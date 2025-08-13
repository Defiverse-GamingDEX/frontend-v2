<script setup lang="ts">
import { format } from 'date-fns';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

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
 * TYPES
 */
type Props = {
  data?: Pool[];
  poolsType?: 'unstaked' | 'staked';
  isLoading?: boolean;
  isLoadingMore?: boolean;
  showPoolShares?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  sortColumn?: string;
  selectedTokens?: string[];
  hiddenColumns?: string[];
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
    accessor: pool =>
      fNum2(balanceValue(pool), {
        style: 'currency',
        maximumFractionDigits: 0,
        fixedFormat: true,
      }),
    align: 'right',
    id: 'myBalance',
    hidden: !props.showPoolShares,
    sortKey: pool => Number(balanceValue(pool)),
    width: 160,
    cellClassName: 'font-numeric',
  },
  {
    name: t('poolValue'),
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
    // sortKey: pool => {
    //   let apr = 0;

    //   if (pool?.apr) {
    //     apr = Number(absMaxApr(pool.apr, pool.boost));
    //   }

    //   return isFinite(apr) ? apr : 0;
    // },
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
          <BalLoadingBlock v-if="!pool?.apr" class="w-12 h-4" />
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
</style>