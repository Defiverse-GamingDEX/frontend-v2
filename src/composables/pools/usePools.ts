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
    const allPages = poolsQuery?.data?.value?.pages || [];
    if (allPages.length === 1) {
      console.log('🚀 ~ filter case');
      return poolsQuery.currentData?.value?.pools || [];
    }
    // merge case
    // Lấy tất cả pools từ tất cả pages và merge lại

    console.log('🚀 ~ merge case:', allPages);

    // Merge tất cả pools từ các pages
    return allPages.reduce((acc, page) => {
      return [...acc, ...(page.pools || [])];
    }, [] as Pool[]);
  });
  console.log('🚀 ~ pools:', pools);
  const isLoading = computed(() => isQueryLoading(poolsQuery));
  console.log(
    '🚀 ~   poolsQuery?.data?.value?.pages',
    poolsQuery?.data?.value?.pages
  );
  console.log(
    '🚀 ~   poolsQuery?.data?.value?.pages[poolsQuery?.data?.value?.pages?.length - 1]:',
    poolsQuery?.data?.value?.pages[poolsQuery?.data?.value?.pages?.length - 1]
  );
  const poolsHasNextPage = computed(() => {
    const lastPage =
      poolsQuery?.data?.value?.pages?.[
        poolsQuery?.data?.value?.pages?.length - 1
      ];
    console.log('🚀 ~ Last page:', lastPage);

    if (!lastPage) return false;

    const lastPagePools = lastPage.pools || [];
    console.log('🚀 ~ Last page pools length:', lastPagePools.length);

    return pools.value.length > 0 && lastPagePools.length >= 10;
  });
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
