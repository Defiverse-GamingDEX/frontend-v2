import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';

import { fetchTokenListsByChainId } from '@/constants/tokenlists';

export default function useTokenListsByChainId(
  chainId: Ref<number>,
  options: UseQueryOptions<any> = {}
) {
  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      const data = await fetchTokenListsByChainId(chainId.value);
      return data[chainId.value] || {};
    } catch (error) {
      console.error('Failed to fetch gauges', error);
      return {};
    }
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled: computed(() => !!chainId.value),
    ...options,
  });

  return useQuery<any>(
    ['transfer', 'TokenList', chainId],
    queryFn,
    queryOptions
  );
}
