import { computed } from 'vue';
import { getAddress, isAddress } from '@ethersproject/address';
import { TokenInfo, TokenInfoMap } from '@/types/TokenList';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import useTokenListsByChainId from './useTokenListsByChainId';
import useTokensLocal from './useTokensLocal';
import useBalancesCurrentConnectQuery from '@/composables/queries/useBalancesCurrentConnectQuery';

import { chainIdsForTransferToken } from '@/constants/networksToSelect';
import configs from '@/lib/config';
import useWeb3 from '@/services/web3/useWeb3';
import TokenService from '@/services/transfer/token.service';

/**
 * TYPES
 */
declare module '@/types/TokenList' {
  interface TokenInfo {
    price?: number;
    balance?: string;
    value?: number;
  }
}

export default function useTransferTokens() {
  const { chainId, account, getProvider } = useWeb3();
  /**
   * COMPOSABLES + COMPUTED
   */
  const isChainSupprt = computed(() => {
    return chainIdsForTransferToken.includes(Number(chainId.value));
  });

  // METHODS
  function _tokenService() {
    const provider = getProvider();
    return new TokenService(provider);
  }
  function _configService() {
    return configs[chainId.value];
  }
  async function fetchNativeBalance() {
    const balance = await _tokenService().fetchNativeBalance(
      account.value,
      _configService().nativeAsset.decimals
    );
    return {
      value: balance,
      symbol: _configService().nativeAsset.symbol,
    };
  }

  async function fetchErc20Balance(token: TokenInfo) {
    const balance = await _tokenService().fetchErc20Balance(
      account.value,
      token.address,
      token.decimals
    );
    return { ...token, balance };
  }

  return {
    chainId,
    isChainSupprt,
    fetchNativeBalance,
    fetchErc20Balance,
  };
}
