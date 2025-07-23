import { computed } from 'vue';
import { getAddress, isAddress } from '@ethersproject/address';
import { TokenInfo, TokenInfoMap } from '@/types/TokenList';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import useTokenListsByChainId from './useTokenListsByChainId';
import useTokensLocal from './useTokensLocal';
import useBalancesCurrentConnectQuery from '@/composables/queries/useBalancesCurrentConnectQuery';
import useWeb3 from '@/services/web3/useWeb3';

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
  const { erc20 } = useTokensLocal();
  const { data: tokenListBe, isLoading: isLoadingTokenListBe } =
    useTokenListsByChainId(chainId, {
      staleTime: 5000 * 60, // cache 5 min
    });

  const tokens = computed((): TokenInfoMap => {
    return {
      ...mapTokenListTokens(erc20.value || []),
      ...mapTokenListTokens(tokenListBe.value?.tokens || []),
    };
  });

  const {
    data: balanceData,
    isLoading: balanceQueryLoading,
    refetch: refetchBalances,
  } = useBalancesCurrentConnectQuery(tokens, { keepPreviousData: true });

  const balances = computed(
    (): BalanceMap => (balanceData.value ? balanceData.value : {})
  );

  const dynamicDataLoading = computed(() => {
    return balanceQueryLoading.value;
  });

  const tokensWithValues = computed((): TokenInfo[] => {
    return Object.values(tokens.value).map(token => {
      const balance = balanceFor(token.address);
      // const value = Number(balance) * price;
      return {
        ...token,
        // price,
        balance,
        // value,
      };
    });
  });

  // METHODS

  function mapTokenListTokens(tokens: TokenInfo[]): TokenInfoMap {
    const tokensMap = tokens.reduce<TokenInfoMap>((acc, token) => {
      try {
        const address: string = getAddress(token.address);
        // Don't include if already included
        if (acc[address]) return acc;

        // Don't include if not on app network
        if (token.chainId !== chainId.value) return acc;

        acc[address] = token;
      } catch (error) {
        console.log('getAddress failed for: ', token.address);
      }
      return acc;
    }, {});
    return tokensMap;
  }

  function balanceFor(address: string): string {
    if (address) address = getAddress(address);
    try {
      return balances.value[address] || '0';
    } catch {
      return '0';
    }
  }

  function searchTokens(query: string): TokenInfo[] {
    if (!query) return tokensWithValues.value;
    if (isAddress(query)) {
      return tokensWithValues.value.filter(
        token => token.address.toLowerCase() === query.toLowerCase()
      );
    }
    return tokensWithValues.value.filter(
      token =>
        token.name.toLowerCase().includes(query.toLowerCase()) ||
        token.symbol.toLowerCase().includes(query.toLowerCase())
    );
  }

  return {
    tokens,
    balances,
    tokensWithValues,
    isLoadingTokens: isLoadingTokenListBe,
    dynamicDataLoading,
    // methods
    refetchBalances,
    searchTokens,
  };
}
