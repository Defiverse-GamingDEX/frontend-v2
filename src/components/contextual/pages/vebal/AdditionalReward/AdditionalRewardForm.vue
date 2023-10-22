<script setup lang="ts">
import { computed } from 'vue';

import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolQuery from '@/composables/queries/usePoolQuery';

import { useTokens } from '@/providers/tokens.provider';
import useVeBal from '@/composables/useVeBAL';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import {
  isVeBalPool,
  preMintedBptIndex,
  removeBptFrom,
  usePool,
  tokensListExclBpt,
  tokenTreeLeafs,
} from '@/composables/usePool';

/**
 * STATE
 */
const route = useRoute();
const poolId = (route.params.poolId as string).toLowerCase();

/**
 * COMPOSABLES
 */
const { t } = useI18n();

const { prices } = useTokens();
const { isWalletReady } = useWeb3();
const { addAlert, removeAlert } = useAlerts();
const _isVeBalPool = isVeBalPool(poolId);

//#region pool query
const poolQuery = usePoolQuery(poolId, undefined, undefined);
const pool = computed(() => poolQuery.data.value);
const poolQueryLoading = computed(
  () =>
    poolQuery.isLoading.value ||
    poolQuery.isIdle.value ||
    Boolean(poolQuery.error.value)
);
const loadingPool = computed(() => poolQueryLoading.value || !pool.value);

console.log(pool, 'poolAAA');

/**
 * WATCHERS
 */
watch(poolQuery.error, () => {
  if (poolQuery.error.value) {
    addAlert({
      id: 'pool-fetch-error',
      label: t('alerts.pool-fetch-error'),
      type: AlertType.ERROR,
      persistent: true,
      action: poolQuery.refetch.value,
      actionLabel: t('alerts.retry-label'),
      priority: AlertPriority.MEDIUM,
    });
  } else {
    removeAlert('pool-fetch-error');
  }
});
</script>

<template>
  <Col3Layout offsetGutters>
    <BalLoadingBlock v-if="loadingPool || !pool" class="h-96" />
    <div v-else class="addition-reward-container">
      Additional reward form here
    </div>
  </Col3Layout>
</template>
