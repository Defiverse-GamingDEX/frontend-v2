import { computed } from 'vue';
import { getAddress, isAddress } from '@ethersproject/address';
import { TokenInfo, TokenInfoMap } from '@/types/TokenList';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import useTokenListsByChainId from './useTokenListsByChainId';
import useTokensLocal from './useTokensLocal';
import useBalancesCurrentConnectQuery from '@/composables/queries/useBalancesCurrentConnectQuery';
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
  const { chainId } = useWeb3();
  /**
   * COMPOSABLES + COMPUTED
   */

  // METHODS

  return {
    chainId,
  };
}
