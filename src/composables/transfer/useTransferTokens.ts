import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ExtendedTokenInfo } from '@/types/TokenList';
import { TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import {
  chainIdsForTransferToken,
  chainIdsForTransferNft,
} from '@/constants/networksToSelect';
import configs from '@/lib/config';
import useWeb3 from '@/services/web3/useWeb3';
import TokenService from '@/services/transfer/token.service';
import { isRowCheck, validColType } from '@/lib/utils/validations';
import useEthers from '../useEthers';
import useTransactions from '../useTransactions';
import { bnum } from '@/lib/utils';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

/**
 * TYPES
 */

export interface ValueTextAreaType {
  isValid: boolean;
  value: string[];
}

export default function useTransferTokens() {
  const isLoadingTransfer = ref(false);
  /**
   * COMPOSABLES + COMPUTED
   */
  const { chainId, account, getProvider } = useWeb3();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions(chainId);
  const { t } = useI18n();
  const { fNum2 } = useNumbers();

  const isChainSupport = computed(() => {
    return chainIdsForTransferToken.includes(Number(chainId.value));
  });

  const isChainSupportSendNft = computed(() => {
    return chainIdsForTransferNft.includes(Number(chainId.value));
  });

  const configService = computed(() => {
    return configs[chainId.value];
  });

  // METHODS
  function _tokenService() {
    const provider = getProvider();
    return new TokenService(provider);
  }

  async function fetchNativeBalance(): Promise<ExtendedTokenInfo> {
    const balance = await _tokenService().fetchNativeBalance(
      account.value,
      configService.value.nativeAsset.decimals
    );
    return {
      balance: balance,
      chainId: chainId.value,
      type: 'native',
      ...configService.value.nativeAsset,
    };
  }

  async function fetchErc20Balance(token: ExtendedTokenInfo) {
    const balance = await _tokenService().fetchErc20Balance(
      account.value,
      token.address,
      token.decimals
    );
    return { ...token, balance };
  }

  async function checkOwnerErc721(tokenAddress: string, tokenIds: string[]) {
    if (!tokenAddress || !tokenIds?.length) {
      throw 'Invalid params';
    }
    const ownerList = await Promise.allSettled(
      tokenIds.map(tokenId => {
        return _tokenService().erc721OwnerOf(tokenAddress, tokenId);
      })
    );
    const errors: string[] = [];
    ownerList.map((result, index) => {
      const anAddress = (result as any).value ?? '';
      if (anAddress == '') {
        errors.push(t(`transfer.tokenIdNotExist`, { id: tokenIds[index] }));
      } else if (account.value.toLocaleLowerCase() != anAddress.toLowerCase()) {
        errors.push(t(`transfer.notOwnedToken`, { id: tokenIds[index] }));
      }
    });
    if (errors?.length) {
      throw errors;
    }
    return ownerList;
  }

  async function checkBalanceErc1155(
    tokenAddress: string,
    recipients: ValueTextAreaType[]
  ) {
    if (!tokenAddress || !recipients?.length) {
      throw 'Invalid params';
    }
    const ownerBalanceList = await Promise.allSettled(
      recipients.map(i => {
        return _tokenService().erc1155BalanceOf(
          tokenAddress,
          account.value,
          i.value[1]
        );
      })
    );
    const errors: string[] = [];
    ownerBalanceList.map((result, index) => {
      const balance = bnum((result as any).value ?? '0');
      const tokenId = recipients[index].value[1];
      const amount = bnum(recipients[index].value[2]);
      if (balance.eq(0)) {
        errors.push(t(`transfer.tokenZeroBalance`, { id: tokenId }));
      } else if (balance.lt(amount)) {
        errors.push(
          t(`transfer.insufficientBalance`, {
            id: tokenId,
            requiredAmount: amount,
            balance: balance,
          })
        );
      }
    });
    if (errors?.length) {
      throw errors;
    }
    return ownerBalanceList;
  }

  function convertValueTextArea(
    text: string,
    validCol: validColType
  ): ValueTextAreaType[] {
    if (!text.trim()) return [];
    const lines = text.trim().split('\n');
    const rows: ValueTextAreaType[] = [];
    for (let index = 0; index < lines.length; index++) {
      const row = lines[index];
      const pairs = row
        .trim()
        .split(',')
        ?.map(i => i.trim());

      rows.push({
        isValid: isRowCheck(row, validCol),
        value: pairs,
      });
    }
    return rows;
  }

  async function transferToken(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[],
    onTxConfirmed: () => void
  ): Promise<TransactionResponse | undefined> {
    const _recipients = recipients.filter(i => i.isValid);
    if (token.type === 'native') {
      return transferNative(token, _recipients, onTxConfirmed);
    }
    if (token.type === 'erc20') {
      return transferTokenErc20(token, _recipients, onTxConfirmed);
    }
    if (token.type === 'erc721') {
      return transferNft721(token, _recipients, onTxConfirmed);
    }
    if (token.type === 'erc1155') {
      return transferNft71155(token, _recipients, onTxConfirmed);
    }
  }

  async function transferTokenErc20(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[],
    onTxConfirmed: () => void
  ): Promise<TransactionResponse> {
    try {
      if (!configService.value.addresses.disperse) {
        throw t('errorMissingNetworkConfig');
      }
      isLoadingTransfer.value = true;

      const tx = await _tokenService().disperseToken(
        configService.value.addresses.disperse,
        token.address,
        recipients.map(i => i.value[0]),
        recipients.map(i => parseUnits(i.value[1], token.decimals).toString())
      );

      txHandler(tx, getSummaryTransfer(token, recipients), onTxConfirmed);
      return tx;
    } catch (e) {
      console.log(e);
      isLoadingTransfer.value = false;
      return Promise.reject(e);
    }
  }

  async function transferNative(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[],
    onTxConfirmed: () => void
  ): Promise<TransactionResponse> {
    try {
      if (!configService.value.addresses.disperse) {
        throw t('errorMissingNetworkConfig');
      }
      isLoadingTransfer.value = true;

      const tx = await _tokenService().disperseNative(
        configService.value.addresses.disperse,
        recipients.map(i => i.value[0]),
        recipients.map(i => parseUnits(i.value[1], token.decimals).toString())
      );

      txHandler(tx, getSummaryTransfer(token, recipients), onTxConfirmed);
      return tx;
    } catch (e) {
      console.log(e);
      isLoadingTransfer.value = false;
      return Promise.reject(e);
    }
  }

  async function transferNft721(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[],
    onTxConfirmed: () => void
  ): Promise<TransactionResponse> {
    try {
      if (!configService.value.addresses.nftTransfer) {
        throw t('errorMissingNetworkConfig');
      }
      isLoadingTransfer.value = true;

      const tx = await _tokenService().transferERC721(
        configService.value.addresses.nftTransfer,
        token.address,
        recipients.map(i => i.value[0]),
        recipients.map(i => i.value[1])
      );

      txHandler(tx, getSummaryTransfer(token, recipients), onTxConfirmed);
      return tx;
    } catch (e) {
      console.log(e);
      isLoadingTransfer.value = false;
      return Promise.reject(e);
    }
  }

  async function transferNft71155(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[],
    onTxConfirmed: () => void
  ): Promise<TransactionResponse> {
    try {
      if (!configService.value.addresses.nftTransfer) {
        throw t('errorMissingNetworkConfig');
      }
      isLoadingTransfer.value = true;

      const tx = await _tokenService().transferERC1155(
        configService.value.addresses.nftTransfer,
        token.address,
        recipients.map(i => i.value[0]),
        recipients.map(i => i.value[1]),
        recipients.map(i => i.value[2])
      );

      txHandler(tx, getSummaryTransfer(token, recipients), onTxConfirmed);
      return tx;
    } catch (e) {
      console.log(e);
      isLoadingTransfer.value = false;
      return Promise.reject(e);
    }
  }

  function getSummaryTransfer(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[]
  ) {
    if (token.type == 'erc721' || token.type == 'erc1155') {
      const key =
        recipients.length === 1
          ? 'transfer.transferNftSummary_one'
          : 'transfer.transferNftSummary_other';
      return t(key, {
        type: token.type.toLocaleUpperCase(),
        count: recipients.length,
      });
    }
    const key =
      recipients.length === 1
        ? 'transfer.transferTokenSummary_one'
        : 'transfer.transferTokenSummary_other';
    const amount = recipients.reduce(
      (totalValue, { value }) => totalValue.plus(value[1] ?? 0),
      bnum(0)
    );
    return t(key, {
      amount: fNum2(amount.toString(), FNumFormats.token),
      currency: token.symbol,
      count: recipients.length,
    });
  }

  function txHandler(
    tx: TransactionResponse,
    summary: string,
    onTxConfirmed: () => void
  ): void {
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'batchTransfer',
      summary: summary,
    });

    txListener(
      tx,
      {
        onTxConfirmed: async () => {
          onTxConfirmed();
          isLoadingTransfer.value = false;
        },
        onTxFailed: () => {
          isLoadingTransfer.value = false;
        },
      },
      false,
      true,
      chainId.value
    );
  }

  return {
    chainId,
    account,
    isChainSupport,
    isChainSupportSendNft,
    configService,
    isLoadingTransfer,
    fetchNativeBalance,
    fetchErc20Balance,
    checkOwnerErc721,
    checkBalanceErc1155,
    convertValueTextArea,
    transferToken,
    transferTokenErc20,
  };
}
