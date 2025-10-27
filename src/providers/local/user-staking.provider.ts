/**
 * Provides all user staking related data.
 */
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { isDefiverse } from '@/composables/useNetwork';
import { fiatValueOf } from '@/composables/usePool';
import symbolKeys from '@/constants/symbol.keys';
import { Pool } from '@/services/pool/types';
import { computed, InjectionKey, provide, reactive, ref } from 'vue';
import { safeInject } from '../inject';
import { useUserData } from '../user-data.provider';

const provider = () => {
  /**
   * COMPOSABLES
   */
  const { userGaugeSharesQuery, userBoostsQuery, stakedSharesQuery } =
    useUserData();

  /**
   * COMPUTED
   */
  const { data: userGaugeShares } = userGaugeSharesQuery;
  const { data: poolBoostsMap } = userBoostsQuery;
  const { data: stakedShares } = stakedSharesQuery;

  // Array of all the pools a user has staked BPT for.
  const stakedPoolIds = computed((): string[] => {
    if (!userGaugeShares.value) return [];

    const arr = userGaugeShares.value.map(gaugeShare => gaugeShare.gauge.poolId);
    return arr;
  });

  const isPoolsQueryEnabled = computed(
    (): boolean => stakedPoolIds.value.length > 0
  );

  const stakedPoolsQuery = usePoolsQuery(
    ref([]),
    reactive({
      enabled: isPoolsQueryEnabled,
    }),
    {
      poolIds: stakedPoolIds,
      pageSize: 999,
    }
  );
  const { data: _stakedPools, refetch: refetchStakedPools } = stakedPoolsQuery;

  // Pool records for all the pools where a user has staked BPT.
  // Filter out pools with 0 or negligible balance based on actual onchain data
  const stakedPools = computed((): Pool[] => {
    const pools = _stakedPools.value?.pages[0].pools || [];
    console.log('HUNG:stakedPools:',_stakedPools.value);
    // If stakedShares data is not loaded yet, return empty to avoid showing pools with 0 balance
    if (!stakedShares.value) return [];

    // Only return pools that have actual shares > 0 and valid totalLiquidity
    // Filter out pools with no liquidity data (can't calculate fiat value)
    return pools.filter(pool => {
      const shares = stakedShares.value?.[pool.id];
      if (!shares || Number(shares) === 0) return false;

      // Filter out pools with 0 or invalid totalLiquidity
      if (!pool.totalLiquidity || Number(pool.totalLiquidity) === 0) {
        console.log(`Filtering out staked pool ${pool.id}: totalLiquidity = ${pool.totalLiquidity}`);
        return false;
      }

      return true;
    });
  });

  // Total fiat value of staked shares.
  const totalStakedValue = computed((): string => {
    return Object.keys(stakedShares.value || {})
      .reduce((acc, poolId) => {
        const pool = stakedPools.value.find(pool => pool.id === poolId);
        if (!pool) return acc;
        const bpt = stakedShares?.value?.[poolId] || '0';
        return acc + Number(fiatValueOf(pool, bpt));
      }, 0)
      .toString();
  });

  // Is loading any user staking data?
  // const isLoading = computed((): boolean => {
  //   return isDefiverse.value
  //     ? isQueryLoading(stakedPoolsQuery)
  //     : isQueryLoading(userGaugeSharesQuery) ||
  //         isQueryLoading(stakedSharesQuery) ||
  //         isQueryLoading(userBoostsQuery) ||
  //         isQueryLoading(stakedPoolsQuery);
  // });

  // Hung open
  const isLoading = computed((): boolean => {
    return (
      isQueryLoading(userGaugeSharesQuery) ||
      isQueryLoading(stakedSharesQuery) ||
      isQueryLoading(userBoostsQuery) ||
      isQueryLoading(stakedPoolsQuery)
    );
  });

  /**
   * Gets a user's staked BPT balance for a given pool.
   *
   * @param {string} poolId - The pool to get the staked balance for.
   * @returns The staked balance.
   */
  function stakedSharesFor(poolId: string): string {
    return stakedShares?.value?.[poolId] || '0';
  }

  return {
    stakedPools,
    stakedShares,
    poolBoostsMap,
    totalStakedValue,
    isLoading,
    refetchStakedPools,
    stakedSharesFor,
  };
};

/**
 * Provide setup: response type + symbol.
 */
export type UserStakingResponse = ReturnType<typeof provider>;
export const UserStakingProviderSymbol: InjectionKey<UserStakingResponse> =
  Symbol(symbolKeys.Providers.UserStaking);

export function provideUserStaking(): UserStakingResponse {
  const _provider = provider();
  provide(UserStakingProviderSymbol, _provider);
  return _provider;
}

export function useUserStaking(): UserStakingResponse {
  return safeInject(UserStakingProviderSymbol);
}
