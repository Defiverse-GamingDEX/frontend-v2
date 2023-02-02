import { balancer } from '@/lib/balancer.sdk';
import { GasPriceService } from '@/services/gas-price/gas-price.service';
import { Pool } from '@/services/pool/types';
import { BalancerSDK, PoolWithMethods } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';
import {
  AmountsOut,
  ExitParams,
  ExitPoolHandler,
  QueryOutput,
} from './exit-pool.handler';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { indexOfAddress, isSameAddress, selectByAddress } from '@/lib/utils';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { TokenInfo } from '@/types/TokenList';
import { flatTokenTree } from '@/composables/usePool';
import { getAddress } from '@ethersproject/address';

/**
 * Handles cases where BPT in is set for the exit using SDK's
 * buildExitExactBPTIn function.
 */
export class ExactInExitHandler implements ExitPoolHandler {
  private lastExitRes?: ReturnType<PoolWithMethods['buildExitExactBPTIn']>;

  constructor(
    public readonly pool: Ref<Pool>,
    public readonly sdk: BalancerSDK,
    public readonly gasPriceService: GasPriceService
  ) {}

  async exit(params: ExitParams): Promise<TransactionResponse> {
    await this.queryExit(params);

    if (!this.lastExitRes) throw new Error('Failed to construct exit.');

    const txBuilder = new TransactionBuilder(params.signer);
    const { to, data } = this.lastExitRes;

    return txBuilder.raw.sendTransaction({ to, data });
  }

  async queryExit(params: ExitParams): Promise<QueryOutput> {
    const { signer, tokenInfo, bptIn, slippageBsp, amountsOut } = params;
    const shouldUnwrapNativeAsset = false;
    const exiter = await signer.getAddress();
    const slippage = slippageBsp.toString();
    const sdkPool = await balancer.pools.find(this.pool.value.id);
    const tokenOut = selectByAddress(tokenInfo, amountsOut[0].address);

    if (!sdkPool) throw new Error('Failed to find pool: ' + this.pool.value.id);
    if (!tokenOut)
      throw new Error('Could not find exit token in pool tokens list.');

    const isSingleTokenExit = amountsOut.length === 1;

    const evmBptIn = parseFixed(bptIn, 18).toString();
    const singleTokenMaxOutAddress = isSingleTokenExit
      ? // TODO: Fix this in the SDK, then remove this toLowerCase
        tokenOut.address.toLowerCase()
      : undefined;

    this.lastExitRes = await sdkPool.buildExitExactBPTIn(
      exiter,
      evmBptIn,
      slippage,
      shouldUnwrapNativeAsset,
      singleTokenMaxOutAddress
    );

    if (!this.lastExitRes) throw new Error('Failed to construct exit.');

    const expectedAmountsOut = this.lastExitRes.expectedAmountsOut;
    // Because this is an exit we need to pass amountsOut as the amountsIn and
    // bptIn as the minBptOut to this calcPriceImpact function.
    const evmPriceImpact = await sdkPool.calcPriceImpact(
      expectedAmountsOut,
      evmBptIn,
      false
    );
    const priceImpact = Number(formatFixed(evmPriceImpact, 18));

    if (isSingleTokenExit) {
      const tokenOutIndex = indexOfAddress(
        this.pool.value.tokensList,
        tokenOut.address
      );
      const amountsOut = this.getSingleAmountOut(
        expectedAmountsOut,
        tokenOutIndex,
        tokenOut
      );
      return {
        amountsOut,
        priceImpact,
      };
    } else {
      const tokensOut = this.pool.value.tokensList;
      const amountsOut = this.getAmountsOut(expectedAmountsOut, tokensOut);
      return {
        amountsOut,
        priceImpact,
      };
    }
  }

  private getSingleAmountOut(
    amountsOut: string[],
    tokenOutIndex: number,
    tokenOut: TokenInfo
  ): AmountsOut {
    const amountOut = amountsOut[tokenOutIndex];
    const normalizedAmountOut = formatFixed(
      amountOut,
      tokenOut.decimals
    ).toString();
    return {
      [tokenOut.address]: normalizedAmountOut,
    };
  }

  private getAmountsOut(
    expectedAmountsOut: string[],
    tokensOut: string[]
  ): AmountsOut {
    const amountsOut: AmountsOut = {};
    const allPoolTokens = flatTokenTree(this.pool.value);

    expectedAmountsOut.forEach((amount, i) => {
      const token = allPoolTokens.find(poolToken =>
        isSameAddress(poolToken.address, tokensOut[i])
      );

      if (token) {
        const realAddress = getAddress(token.address);
        const scaledAmount = formatFixed(
          amount,
          token.decimals ?? 18
        ).toString();
        amountsOut[realAddress] = scaledAmount;
      }
    });

    return amountsOut;
  }
}
