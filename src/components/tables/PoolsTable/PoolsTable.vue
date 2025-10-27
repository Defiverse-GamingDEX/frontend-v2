<script setup lang="ts">
import { format } from 'date-fns';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import gaugeApi from '@/composables/gaugeReward/gauge.api';
import useWeb3 from '@/services/web3/useWeb3';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import BalChipNew from '@/components/chips/BalChipNew.vue';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import { POOL_MIGRATIONS_MAP } from '@/components/forms/pool_actions/MigrateForm/constants';
import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import useFathom from '@/composables/useFathom';
import useNumbers from '@/composables/useNumbers';
import useNetwork from '@/composables/useNetwork';
import {
  absMaxApr,
  fiatValueOf,
  isLiquidityBootstrapping,
  isMigratablePool,
  isStableLike,
  orderedPoolTokens,
  orderedTokenAddresses,
  totalAprLabel,
  isLBP,
} from '@/composables/usePool';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { POOLS } from '@/constants/pools';
import BigNumber from 'bignumber.js';
import PoolsTableActionsCell from './PoolsTableActionsCell.vue';
import TokenPills from './TokenPills/TokenPills.vue';
import PoolWarningTooltip from '@/components/pool/PoolWarningTooltip.vue';
import TokensWhite from '@/assets/images/icons/tokens_white.svg';
import TokensBlack from '@/assets/images/icons/tokens_black.svg';
import VerifiedIcon from '@/assets/images/pools/verified.png';
import YukichiIcon from '@/assets/images/pools/yukichi.png';

/**
 * STATE
 */
const poolSwapFees = ref<Record<string, string>>({});
const loadingSwapFeePoolIds = ref<Set<string>>(new Set());

/**
 * TYPES
 */
type Props = {
  data?: Pool[];
  poolsType?: 'unstaked' | 'staked';
  isLoading?: boolean;
  isLoadingMore?: boolean;
  isLazyLoading?: boolean; // Loading state for APR and TotalLiquidity
  showPoolShares?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  sortColumn?: string;
  selectedTokens?: string[];
  hiddenColumns?: string[];
  showSwapFee?: boolean;
  showBoost?: boolean;
  showActions?: boolean;
  columnStates?: Record<string, string>;
  skeletonClass?: string;
  shares?: Record<string, string>;
  boosts?: Record<string, string>;
};

/**
 * PROPS & EMITS
 */

const props = withDefaults(defineProps<Props>(), {
  poolsType: 'unstaked',
  isLoadingMore: false,
  showPoolShares: false,
  showSwapFee: true,
  noPoolsLabel: 'No pools',
  isPaginated: false,
  sortColumn: 'totalLiquidity',
  hiddenColumns: () => [],
  showBoost: false,
  showActions: false,
  columnStates: () => ({}),
  data: () => [],
  selectedTokens: () => [],
  skeletonClass: 'h-64',
});

const emit = defineEmits<{
  (e: 'loadMore'): void;
  (e: 'triggerStake', value: Pool): void;
  (e: 'triggerUnstake', value: Pool): void;
  (e: 'onColumnSort', value: string): void;
}>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const router = useRouter();
const { t } = useI18n();
const { trackGoal, Goals } = useFathom();
const { darkMode } = useDarkMode();
const { upToLargeBreakpoint, upToMediumBreakpoint } = useBreakpoints();
const { networkSlug } = useNetwork();
const { account } = useWeb3();
const { networkId } = useNetwork();

const wideCompositionWidth = computed(() =>
  upToMediumBreakpoint.value ? 450 : undefined
);

/**
 * DATA
 */
const columns = computed<ColumnDefinition<Pool>[]>(() => [
  {
    name: 'Icons',
    id: 'icons',
    accessor: 'uri',
    Header: 'iconColumnHeader',
    Cell: 'iconColumnCell',
    width: 125,
    noGrow: true,
  },
  {
    //name: t('composition'),
    name: t('poolName'),
    id: 'poolName',
    accessor: 'id',
    Cell: 'poolNameCell',
    width: props.hiddenColumns.length >= 2 ? wideCompositionWidth.value : 350,
  },
  {
    name: t('myBoost'),
    accessor: pool => `${bnum(boostFor(pool)).toFixed(3)}x`,
    align: 'right',
    id: 'myBoost',
    hidden: !props.showBoost,
    sortKey: pool => Number(boostFor(pool)),
    width: 150,
    cellClassName: 'font-numeric',
  },
  {
    name: t('myBalance'),
    accessor: pool => {
      const value = Number(balanceValue(pool));
      const shares = props?.shares?.[pool.id] || '0';

      // Show more decimals for small values
      const decimals = value < 1 ? 6 : value < 100 ? 2 : 0;
      const formattedValue = fNum2(value, {
        style: 'currency',
        maximumFractionDigits: decimals,
        minimumFractionDigits: 0,
        fixedFormat: true,
      });

      // Show shares below for debugging small values
      // If fiatValue is 0 but shares > 0, show "Calculating..."
      if (value === 0 && Number(shares) > 0) {
        return `Calculating...\n(${Number(shares).toFixed(6)} LP)`;
      }
      return `${formattedValue}\n(${Number(shares).toFixed(6)} LP)`;
    },
    align: 'right',
    id: 'myBalance',
    hidden: !props.showPoolShares,
    sortKey: pool => Number(balanceValue(pool)),
    width: 160,
    cellClassName: 'font-numeric whitespace-pre-line',
  },
  {
    name: t('poolValue'),
    Cell: 'totalLiquidityCell',
    accessor: pool =>
      fNum2(pool.totalLiquidity || 0, {
        style: 'currency',
        maximumFractionDigits: 3,
      }),
    align: 'right',
    id: 'totalLiquidity',
    sortKey: pool => {
      const apr = Number(pool.totalLiquidity);
      if (apr === Infinity || isNaN(apr)) return 0;
      return apr;
    },
    width: 150,
    cellClassName: 'font-numeric',
  },
  {
    name: t('volume24h', [t('hourAbbrev')]),
    accessor: pool => pool?.volumeSnapshot || '0',
    align: 'right',
    id: 'volume',
    Cell: 'volumeCell',
    sortKey: pool => {
      const volume = Number(pool?.volumeSnapshot);
      if (volume === Infinity || isNaN(volume)) return 0;
      return volume;
    },
    width: 175,
    cellClassName: 'font-numeric',
  },
  {
    name: props.showPoolShares ? t('myApr') : t('apr'),
    Cell: 'aprCell',
    accessor: pool => pool?.apr?.min.toString() || '0',
    align: 'right',
    id: 'apr',
    sortKey: pool => {
      let apr = 0;

      if (pool?.apr) {
        apr = Number(absMaxApr(pool.apr, pool.boost));
      }

      return isFinite(apr) ? apr : 0;
    },
    width: 220,
  },
  {
    name: t('expiryDate'),
    Cell: 'lockEndDateCell',
    accessor: 'lockedEndDate',
    align: 'right',
    id: 'lockEndDate',
    width: 150,
  },
  {
    name: t('migrate'),
    Cell: 'migrateCell',
    accessor: 'migrate',
    align: 'center',
    id: 'migrate',
    width: 150,
  },
  {
    name: t('actions'),
    Cell: 'actionsCell',
    accessor: 'actions',
    align: 'center',
    id: 'actions',
    hidden: !props.showActions,
    width: 150,
  },
]);

const visibleColumns = computed(() =>
  columns.value.filter(column => !props.hiddenColumns.includes(column.id))
);

/**
 * METHODS
 */

/**
 * Fetch swap fees from voting-pool-details API
 * TODO: Temporarily commented out
 */
// async function fetchPoolSwapFees() {
//   return; // Temporarily disabled
//   if (!props.data || props.data.length === 0) return;

//   // Process pools in batches to avoid too many simultaneous requests
//   const batchSize = 5;
//   for (let i = 0; i < props.data.length; i += batchSize) {
//     const batch = props.data.slice(i, i + batchSize);

//     // Mark these pools as loading
//     batch.forEach(pool => {
//       loadingSwapFeePoolIds.value.add(pool.id);
//     });

//     // Create promises for each pool in the batch
//     const promises = batch.map(async (pool: Pool) => {
//       try {
//         const chainId = networkId.value;
//         const poolIds = [pool.id];
//         const gaugeIds = []; // Empty for pools without gauges
//         const userAddress = account.value || '';
//         const params = {
//           chain_id: chainId,
//           pool_ids: poolIds,
//           gauge_ids: gaugeIds,
//           user_address: userAddress,
//         };
//         const votingPoolDetails = await gaugeApi.getVotingPoolDetails(params);

//         if (votingPoolDetails && votingPoolDetails[pool.id]) {
//           const detail = votingPoolDetails[pool.id];
//           return { poolId: pool.id, swapFee: detail.swap_fee_rate };
//         }
//         return null;
//       } catch (error) {
//         console.error(`Failed to fetch swap fee for pool ${pool.id}:`, error);
//         return null;
//       } finally {
//         // Remove this pool from loading state
//         loadingSwapFeePoolIds.value.delete(pool.id);
//       }
//     });

//     // Wait for all promises in the batch to resolve
//     const results = await Promise.all(promises);

//     // Update swap fees
//     results.forEach(result => {
//       if (result && result.swapFee !== undefined) {
//         poolSwapFees.value[result.poolId] = result.swapFee;
//       }
//     });
//   }
// }

/**
 * WATCHERS
 */
// TODO: Temporarily commented out API watcher
// watch(
//   () => props.data,
//   newData => {
//     if (newData && newData.length > 0 && props.showSwapFee) {
//       fetchPoolSwapFees();
//     }
//   },
//   { immediate: true }
// );

/**
 * METHODS
 */
function handleRowClick(pool: Pool, inNewTab?: boolean) {
  trackGoal(Goals.ClickPoolsTableRow);
  const route = router.resolve({
    name: 'pool',
    params: { id: pool.id, networkSlug },
  });
  inNewTab ? window.open(route.href) : router.push(route);
}

function navigateToPoolMigration(pool: Pool) {
  router.push({
    name: 'migrate-pool',
    params: {
      from: pool.id,
      to: POOL_MIGRATIONS_MAP[pool.id].toPoolId,
    },
    query: { returnRoute: 'home' },
  });
}

function balanceValue(pool: Pool): string {
  const bpt = props?.shares?.[pool.id] || '0';
  return fiatValueOf(pool, bpt);
}

function formatSwapFee(pool: Pool): string {
  // TODO: Temporarily use contract data instead of API
  // const apiSwapFee = poolSwapFees.value[pool.id];
  // if (apiSwapFee !== undefined) {
  //   if (!apiSwapFee || bnum(apiSwapFee).isZero()) return '-';
  //   return `${bnum(apiSwapFee).toNumber()}%`;
  // }

  // Use contract swap fee data
  const contractSwapFee = pool.swapFee;
  if (!contractSwapFee || bnum(contractSwapFee).isZero()) return '-';
  return `${bnum(contractSwapFee).times(100).toNumber()}%`;
}

function isSwapFeeLoading(pool: Pool): boolean {
  // TODO: Temporarily disabled API loading
  return false;
  // return (
  //   loadingSwapFeePoolIds.value.has(pool.id) ||
  //   (poolSwapFees.value[pool.id] === undefined && !!pool.swapFee)
  // );
}

function boostFor(pool: Pool): string {
  return props?.boosts?.[pool.id] || '1';
}

function aprLabelFor(pool: Pool): string {
  const poolAPRs = pool?.apr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, pool.boost);
}

function lockedUntil(lockEndDate?: number) {
  return lockEndDate ? format(lockEndDate, PRETTY_DATE_FORMAT) : '—';
}

function iconAddresses(pool: Pool) {
  return POOLS.Metadata[pool.id]?.hasIcon
    ? [pool.address]
    : orderedTokenAddresses(pool);
}

function formatPoolName(name: string): string {
  if (!name) return '';

  // if (name.includes('by Yukichi')) {
  //   return name.replace(
  //     /(\d+[\w\s]+) by Yukichi Fun_(\d+[\w\s]+)_POOL.*?/g,
  //     '$1_$2'
  //   );
  // }

  return name;
}

function formatPoolNameFromPoolInfo(pool: Pool) {
  // format pool name from pool info
  if (POOLS.wrongPoolNameWhitelist?.includes(pool.id)) {
    let poolName = '';
    if (pool.tokens.length > 0) {
      console.log(
        '🚀 ~ formatPoolNameFromPoolInfo ~ pool.tokens:',
        pool.tokens
      );
      for (let i = 0; i < pool.tokens.length; i++) {
        const token = pool.tokens[i];
        const token_weight = token.weight
          ? BigNumber(token.weight || 0)
              .times(100)
              .toFixed(0)
          : '';
        const token_name = token.symbol || '';
        poolName += token_weight + token_name;
        if (i < pool.tokens.length - 1) {
          poolName += '_';
        }
      }
      return poolName;
    }
  }
  if (/by yukichi\s+fun_/i.test(pool.name)) {
    return pool.name.replace(
      /(.*?)\s+by\s+yukichi\s+fun_([\w\d]+)_pool.*?/i,
      '$1_$2'
    );
  }
  return pool.name;
}
</script>

<template>
  <BalCard
    shadow="lg"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="visibleColumns"
      :data="data"
      :noResultsLabel="noPoolsLabel"
      :isLoading="isLoading"
      :isLoadingMore="isLoadingMore"
      :skeletonClass="skeletonClass"
      sticky="both"
      :square="upToLargeBreakpoint"
      :onRowClick="handleRowClick"
      :isPaginated="isPaginated"
      isOnlyDescSort
      loadingText="Loading"
      :initialState="{
        sortColumn: sortColumn,
        sortDirection: 'desc',
      }"
      @on-column-sort="emit('onColumnSort', $event)"
      @load-more="emit('loadMore')"
    >
      <template #iconColumnHeader>
        <div class="flex items-center">
          <img v-if="darkMode" :src="TokensWhite" />
          <img v-else :src="TokensBlack" />
        </div>
      </template>
      <template #iconColumnCell="pool">
        <div v-if="!isLoading" class="py-4 px-6">
          <BalAssetSet :addresses="iconAddresses(pool)" :width="100" />
        </div>
      </template>
      <template #poolNameCell="pool">
        <div
          v-if="!isLoading"
          class="flex justify-between items-center py-4 px-6"
        >
          <div
            v-if="POOLS.Metadata[pool.id]"
            class="flex items-center text-left"
          >
            <img
              v-if="pool.isVerified"
              :src="VerifiedIcon"
              alt="Verified Pool"
              class="verified-icon"
            />
            <img
              v-if="pool.isYukichi"
              :src="YukichiIcon"
              alt="Yukichi Pool"
              class="verified-icon"
            />
            {{ formatPoolName(POOLS.Metadata[pool.id].name) }}
          </div>
          <div v-else class="flex justify-between items-center w-full">
            <img
              v-if="pool.isVerified"
              :src="VerifiedIcon"
              alt="Verified Pool"
              class="verified-icon"
            />
            <img
              v-if="pool.isYukichi"
              :src="YukichiIcon"
              alt="Yukichi Pool"
              class="mr-1 verified-icon"
            />
            <span class="mr-2 pool-name">{{
              formatPoolNameFromPoolInfo(pool)
            }}</span>
            <TokenPills
              class="pool-pills"
              :tokens="orderedPoolTokens(pool, pool.tokens)"
              :isStablePool="isStableLike(pool.poolType)"
              :selectedTokens="selectedTokens"
            />
            <BalTooltip
              v-if="props.showSwapFee"
              text="Swap Fee"
              :delayMs="50"
              width="auto"
              class="ml-2"
            >
              <template #activator>
                <div class="swap-fee-pill">
                  <BalLoadingBlock
                    v-if="isSwapFeeLoading(pool)"
                    class="w-16 h-4"
                  />
                  <div v-else class="">{{ formatSwapFee(pool) }}</div>
                </div>
              </template>
            </BalTooltip>
          </div>
          <BalChip
            v-if="isLiquidityBootstrapping(pool.poolType)"
            label="LBP"
            color="amber"
          />
          <BalChipNew v-else-if="pool?.isNew" class="ml-2" />
          <PoolWarningTooltip :pool="pool" />
        </div>
      </template>
      <template #totalLiquidityCell="pool">
        <div class="flex justify-end py-4 px-6 -mt-1 font-numeric">
          <BalLoadingBlock v-if="!pool?.totalLiquidity || isLazyLoading" class="w-12 h-4" />
          <span v-else class="text-right">
            {{
              fNum2(pool.totalLiquidity, {
                style: 'currency',
                maximumFractionDigits: 3,
              })
            }}
          </span>
        </div>
      </template>
      <template #volumeCell="pool">
        <div
          :key="columnStates.volume"
          class="flex justify-end py-4 px-6 -mt-1 font-numeric"
        >
          <BalLoadingBlock v-if="!pool?.volumeSnapshot" class="w-12 h-4" />

          <span v-else class="text-right">
            {{
              fNum2(pool?.volumeSnapshot, {
                style: 'currency',
                maximumFractionDigits: 3,
              })
            }}
          </span>
        </div>
      </template>
      <template #aprCell="pool">
        <div
          :key="columnStates.aprs"
          :class="[
            'flex justify-end py-4 px-6 -mt-1 font-numeric text-right',
            {
              'text-gray-300 dark:text-gray-600 line-through': isLBP(
                pool.poolType
              ),
            },
          ]"
        >
          <BalLoadingBlock v-if="!pool?.apr || isLazyLoading" class="w-12 h-4" />
          <template v-else>
            {{ aprLabelFor(pool) }}
            <BalTooltip
              v-if="isLBP(pool.poolType)"
              width="36"
              :text="$t('lbpAprTooltip')"
              iconSize="sm"
              iconClass="ml-1"
            />
            <APRTooltip v-else-if="pool?.apr" :pool="pool" />
          </template>
        </div>
      </template>
      <template #migrateCell="pool">
        <div class="flex justify-center py-4 px-2">
          <BalBtn
            v-if="isMigratablePool(pool)"
            color="gradient"
            size="sm"
            @click.prevent="navigateToPoolMigration(pool)"
          >
            {{ $t('migrate') }}
          </BalBtn>
        </div>
      </template>
      <template #lockEndDateCell="pool">
        <div class="py-4 px-6 text-right">
          {{ lockedUntil(pool.lockedEndDate) }}
        </div>
      </template>
      <template #actionsCell="pool">
        <PoolsTableActionsCell
          :pool="pool"
          :poolsType="poolsType"
          @click:stake="pool => emit('triggerStake', pool)"
          @click:unstake="pool => emit('triggerUnstake', pool)"
          @click:migrate="pool => navigateToPoolMigration(pool)"
        />
      </template>
    </BalTable>
  </BalCard>
</template>
<style lang="scss" scoped>
.pool-name {
  max-width: 280px;
  word-break: break-word;
  text-align: left;
  min-width: 200px;
}
.pool-pills {
  max-width: 220px;
  margin-left: auto;
  justify-content: flex-end;
}
.swap-fee-pill {
  @apply flex items-center px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900 text-sm font-medium;
  @apply text-blue-700 dark:text-blue-200;
  @apply cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800;
}
</style>