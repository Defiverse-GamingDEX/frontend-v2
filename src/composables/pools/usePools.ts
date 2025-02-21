import { flatten } from 'lodash';
import { computed, Ref, ref, watch } from 'vue';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { useTokens } from '@/providers/tokens.provider';
import { Pool } from '@/services/pool/types';
import { tokenTreeLeafs } from '../usePool';
import { ownerAddress } from '@cowprotocol/contracts';
import { GAMING_DEX_OWNER_ADDRESS } from '@/constants/pools';

export default function usePools(
  filterTokens: Ref<string[]> = ref([]),
  poolsSortField: Ref<string>,
  filterOptions: ComputedRef<FilterOptions> | any = {}
) {
  /**
   * COMPOSABLES
   */

  const poolsQuery = usePoolsQuery(
    filterTokens,
    undefined,
    filterOptions,
    poolsSortField
  );
  console.log('🚀 ~ poolsQuery:', poolsQuery);

  const { injectTokens } = useTokens();

  /**
   * COMPUTED
   */
  const pools = computed<Pool[]>(() => {
    if (poolsQuery.currentData?.value?.pools) {
      return poolsQuery.currentData.value.pools;
    }

    const paginatedPools = poolsQuery?.data?.value;
    console.log('🚀 ~ paginatedPools:', paginatedPools);
    return paginatedPools
      ? flatten(paginatedPools.pages.map(page => page.pools))
      : [];
  });
  console.log('🚀 ~ pools:', pools);
  const isLoading = computed(() => isQueryLoading(poolsQuery));

  const poolsHasNextPage = computed(() => poolsQuery.hasNextPage?.value);
  const poolsIsFetchingNextPage = computed(
    () => poolsQuery.isFetchingNextPage?.value
  );

  /**
   * METHODS
   */
  function loadMorePools() {
    poolsQuery.fetchNextPage.value();
  }

  /**
   * WATCHERS
   */
  watch(pools, async newPools => {
    const tokens = flatten(
      newPools.map(pool => [
        ...pool.tokensList,
        ...tokenTreeLeafs(pool.tokens),
        pool.address,
      ])
    );
    await injectTokens(tokens);
  });

  return {
    pools,
    isLoading,
    poolsHasNextPage,
    poolsIsFetchingNextPage,
    // methods
    loadMorePools,
  };
}
