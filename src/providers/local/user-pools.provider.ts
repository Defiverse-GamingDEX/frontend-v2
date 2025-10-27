import { InjectionKey } from 'vue';
import { UserStakingResponse } from '@/providers/local/user-staking.provider';
import { useUserData } from '@/providers/user-data.provider';
import { Pool } from '@/services/pool/types';
import { bnSum } from '@/lib/utils';
import symbolKeys from '@/constants/symbol.keys';
import { safeInject } from '../inject';
import { useLock } from '@/composables/useLock';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { fiatValueOf } from '@/composables/usePool';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { isVeBalSupported } from '@/composables/useVeBAL';
import { useTokens } from '../tokens.provider';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';

/**
 * Provides user pools data. Primarily for the portfolio page.
 */
export const provider = (userStaking: UserStakingResponse) => {
  const {
    stakedPools,
    totalStakedValue,
    refetchStakedPools,
    isLoading: isStakedDataLoading,
  } = userStaking;

  // Access user data fetched on wallet connection/change.
  const { userPoolSharesQuery, lockQuery } = useUserData();
  const { data: userPoolShares, refetch: refetchUserPoolShares } =
    userPoolSharesQuery;

  const { totalLockedValue } = useLock();
  const { injectTokens } = useTokens();

  // Lazy loading state
  const isLazyLoading = ref(false);
  const lazyLoadedPoolIds = ref<Set<string>>(new Set());
  // Store APR data separately to avoid readonly issues
  const lazyLoadedAprData = ref<Record<string, { apr: any; totalLiquidity: string }>>({});

  // Array of pool IDs that the user hasn't staked.
  const unstakedPoolIds = computed((): string[] =>
    Object.keys(userPoolShares.value || {})
  );

  // Only fetch unstaked pools if the user has pool shares.
  const isPoolsQueryEnabled = computed(
    (): boolean => unstakedPoolIds.value.length > 0
  );

  // Fetch pools that the user hasn't staked.
  const filterOptions = computed(() => ({
    poolIds: unstakedPoolIds,
    pageSize: 999,
  }));

  const unstakedPoolsQuery = usePoolsQuery(
    ref([]),
    reactive({
      enabled: true // isPoolsQueryEnabled,
    }),
    filterOptions,
    undefined, // poolsSortField
    false // skipExpensiveDecorations - CHANGED: load APR immediately instead of lazy loading
  );
  const { data: _unstakedPools } = unstakedPoolsQuery;

  // Helper property to drill down to first page of results.
  // Filter out pools with 0 or negligible balance
  const unstakedPools = computed((): Pool[] => {
    const pools = _unstakedPools.value?.pages[0]?.pools || [];
    console.log('[unstakedPools computed] lazyLoadedAprData:', lazyLoadedAprData.value);
    console.log('[unstakedPools computed] pools count:', pools.length);
    
    if (!userPoolShares.value) return [];

    // Only return pools that have actual shares > 0 and valid totalLiquidity
    // Filter out pools with no liquidity data (can't calculate fiat value)
    const filteredPools = pools.filter(pool => {
      const shares = userPoolShares.value?.[pool.id];
      if (!shares || Number(shares) === 0) return false;

      // Filter out pools with 0 or invalid totalLiquidity
      if (!pool.totalLiquidity || Number(pool.totalLiquidity) === 0) {
        console.log(`Filtering out pool ${pool.id}: totalLiquidity = ${pool.totalLiquidity}`);
        return false;
      }

      return true;
    });

    console.log('[unstakedPools computed] filteredPools count:', filteredPools.length);

    // Merge lazy loaded APR data into pools
    const result = filteredPools.map(pool => {
      const lazyData = lazyLoadedAprData.value[pool.id];
      console.log(`[unstakedPools computed] Pool ${pool.id}: has lazyData=${!!lazyData}, original APR:`, pool.apr);
      if (lazyData) {
        console.log(`[unstakedPools computed] Merging APR for pool ${pool.id}:`, lazyData.apr);
        return {
          ...pool,
          apr: lazyData.apr,
          totalLiquidity: lazyData.totalLiquidity,
        };
      }
      return pool;
    });
    
    console.log('[unstakedPools computed] Final result:', result.map(p => ({ id: p.id, hasApr: !!p.apr })));
    return result;
  });

  // Combine staked and unstaked pools.
  const userPools = computed((): Pool[] => [
    ...unstakedPools.value,
    ...stakedPools.value,
  ]);

  // Total fiat value of unstaked positions.
  const totalUnstakedValue = computed((): string => {
    return Object.keys(userPoolShares.value || {})
      .reduce((acc, poolId) => {
        const pool = userPools.value.find(pool => pool.id === poolId);
        if (!pool) return acc;
        const bpt = userPoolShares?.value?.[poolId] || '0';
        return acc + Number(fiatValueOf(pool, bpt));
      }, 0)
      .toString();
  });

  // Total portfolio fiat value, including staked, unstaked, and locked positions.
  const totalFiatValue = computed((): string =>
    bnSum([
      totalUnstakedValue.value,
      totalStakedValue.value,
      totalLockedValue.value,
    ]).toString()
  );

  const isLoading = computed((): boolean => {
    return (
      isStakedDataLoading.value ||
      isQueryLoading(userPoolSharesQuery) ||
      (isPoolsQueryEnabled.value === true &&
        isQueryLoading(unstakedPoolsQuery)) ||
      (isVeBalSupported.value && isQueryLoading(lockQuery))
    );
  });

  // Trigger refetch of queries for staked and unstaked pools.
  async function refetchAllUserPools() {
    await Promise.all([
      refetchUserPoolShares.value(),
      refetchStakedPools.value(),
    ]);
  }

  // Lazy load APR and TotalLiquidity for pools
  async function lazyLoadPoolData(pools: Pool[]) {
    if (isLazyLoading.value || pools.length === 0) return;
    
    // Filter out pools that have already been lazy loaded
    const poolsToLoad = pools.filter(pool => !lazyLoadedPoolIds.value.has(pool.id));
    if (poolsToLoad.length === 0) return;

    isLazyLoading.value = true;
    console.log(`[LazyLoad Unstaked] Starting lazy load for ${poolsToLoad.length} pools`);

    try {
      const decorator = new PoolDecorator(poolsToLoad);
      const updatedPools = await decorator.decoratePoolsLazy(poolsToLoad);
      
      console.log(`[LazyLoad Unstaked] Decorated pools:`, updatedPools);
      
      // Store APR data in a separate reactive object
      updatedPools.forEach(pool => {
        if (pool.apr && pool.totalLiquidity) {
          lazyLoadedAprData.value[pool.id] = {
            apr: pool.apr,
            totalLiquidity: pool.totalLiquidity,
          };
          console.log(`[LazyLoad Unstaked] Saved APR data for pool ${pool.id}:`, pool.apr);
        }
        lazyLoadedPoolIds.value.add(pool.id);
      });
      
      console.log(`[LazyLoad Unstaked] Completed lazy load for ${updatedPools.length} pools`);
      console.log(`[LazyLoad Unstaked] APR data store:`, lazyLoadedAprData.value);
    } catch (error) {
      console.error('[LazyLoad Unstaked] Failed to lazy load pool data:', error);
    } finally {
      isLazyLoading.value = false;
    }
  }

  // Whenever new pools show up in the user pools array, inject their tokens so
  // that we can add the user's balance to the token registry.
  watch(userPools, newUserPools => {
    injectTokens(newUserPools.map(pool => pool.address));
  });

  return {
    stakedPools,
    unstakedPools,
    userPoolShares,
    totalFiatValue,
    isLoading,
    isLazyLoading,
    refetchAllUserPools,
    lazyLoadPoolData,
  };
};

export type UserPoolsProviderResponse = ReturnType<typeof provider>;
export const UserPoolsProviderSymbol: InjectionKey<UserPoolsProviderResponse> =
  Symbol(symbolKeys.Providers.UserPools);

export function providerUserPools(userStaking: UserStakingResponse) {
  provide(UserPoolsProviderSymbol, provider(userStaking));
}

export function useUserPools(): UserPoolsProviderResponse {
  return safeInject(UserPoolsProviderSymbol);
}
