<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isLBP, totalAprLabel } from '@/composables/usePool';
import { APR_THRESHOLD } from '@/constants/pools';
import { Pool } from '@/services/pool/types';
import { AprBreakdown } from '@balancer-labs/sdk';

/**
 * TYPES
 */
type Props = {
  pool?: Pool | null;
  poolApr: AprBreakdown | null;
  loading?: boolean;
  loadingApr?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pool: null,
  poolApr: null,
});

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { t } = useI18n();

/**
 * COMPUTED
 */
const aprLabel = computed((): string => {
  const poolAPRs = props.poolApr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, props.pool?.boost);
});

const stats = computed(() => {
  return [
    {
      id: 'poolValue',
      label: t('poolValue'),
      value: fNum2(props.pool?.totalLiquidity || '0', FNumFormats.fiat),
      loading: props.loading,
    },
    {
      id: 'volumeTime',
      label: t('volumeTime', ['24h']),
      value: fNum2(props.pool?.volumeSnapshot || '0', FNumFormats.fiat),
      loading: props.loading,
    },
    {
      id: 'feesTime',
      label: t('feesTime', ['24h']),
      value: fNum2(props.pool?.feesSnapshot || '0', FNumFormats.fiat),
      loading: props.loading,
    },
    {
      id: 'apr',
      label: 'APR',
      value:
        Number(props.poolApr?.min || '0') > APR_THRESHOLD
          ? '-'
          : aprLabel.value,
      loading: props.loadingApr,
    },
  ];
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <template v-for="stat in stats" :key="stat.id">
      <BalLoadingBlock v-if="stat.loading || !pool" class="h-24" />
      <BalCard v-else>
        <div class="flex mb-2 text-sm font-medium text-secondary">
          <span>{{ stat.label }}</span>
          <template v-if="stat.id === 'apr' && poolApr">
            <BalTooltip
              v-if="isLBP(pool.poolType)"
              width="36"
              :text="$t('lbpAprTooltip')"
              iconSize="sm"
              iconClass="ml-1"
            />
            <APRTooltip v-else :pool="pool" :poolApr="poolApr" />
          </template>
        </div>
        <div
          :class="[
            'flex items-center text-xl font-medium',
            {
              'text-gray-300 dark:text-gray-600 line-through':
                stat.id === 'apr' && isLBP(pool.poolType),
            },
          ]"
        >
          {{ stat.value }}
        </div>
      </BalCard>
    </template>
  </div>
</template>
