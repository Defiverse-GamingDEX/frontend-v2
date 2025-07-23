import { UseQueryOptions } from 'react-query/types';
import { computed, reactive, Ref, ref } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import TokenService from '@/services/transfer/token.service';

import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfoMap } from '@/types/TokenList';

/**
 * TYPES
 */
type QueryResponse = BalanceMap;

/**
 * Fetches all balances for provided tokens.
 */
export default function useBalancesCurrentConnectQuery(
  tokens: Ref<TokenInfoMap> = ref({}),
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady, chainId, getProvider } = useWeb3();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value);
  const tokenAddresses = computed(() => Object.keys(tokens.value));

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive(
    QUERY_KEYS.Account.Balances(chainId, account, tokenAddresses)
  );

  const queryFn = async () => {
    return await new TokenService(getProvider()).getBalanceTokens(
      account.value,
      tokens.value
    );
  };

  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
