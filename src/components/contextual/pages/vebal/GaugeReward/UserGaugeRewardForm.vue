<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

// Using defineAsyncComponent to handle components with no default export
const Col3Layout = defineAsyncComponent(
  () => import('@/components/layouts/Col3Layout.vue')
);
const UserGaugeForm = defineAsyncComponent(() => import('./UserGaugeForm.vue'));
const TargetGauge = defineAsyncComponent(() => import('./TargetGauge.vue'));

import { useGaugeReward } from '@/composables/gaugeReward/useGaugeReward';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { useTokens } from '@/providers/tokens.provider';
import useWeb3 from '@/services/web3/useWeb3';

import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import useBreakpoints from '@/composables/useBreakpoints';
import { networkSlug } from '@/composables/useNetwork';
import { isVeBalPool } from '@/composables/usePool';

import useEthers from '@/composables/useEthers';
import useNotifications from '@/composables/useNotifications';
import useTransactions from '@/composables/useTransactions';
import { GAUGE_REWARD_MAX_PERIODS } from '@/constants/gaugeReward/gauge-tokens-config';
import BigNumber from 'bignumber.js';
// Type definitions for better error handling
interface RewardItem {
  isError?: boolean;
  [key: string]: any;
}

/**
 * STATE
 */
const route = useRoute();
const router = useRouter();
const poolId = (route.params.id as string).toLowerCase();
const gaugeAddress = route.query.gaugeAddress as string;
const streamerAddress = route.query.streamer as string;
const returnRoute = route.query.returnRoute as string;
const input_list = ref<RewardItem[]>([]);
const isAllowance = ref(true);
const isLoading = ref(false);
const gaugeForm = ref<any>(null);
const maxPeriods = ref(GAUGE_REWARD_MAX_PERIODS);

/**
 * COMPOSABLES
 */
const { t } = useI18n();

const { prices, balanceQueryLoading } = useTokens();
const { isWalletReady, account, getSigner, getProvider, chainId } = useWeb3();
const { addAlert, removeAlert } = useAlerts();
const _isVeBalPool = isVeBalPool(poolId);
const { bp } = useBreakpoints();
const { checkTokenAllowance, depositTokens, approveToken } = useGaugeReward();

const { addNotification } = useNotifications();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();
const provider = getProvider();
/**
 * COMPUTED
 */

const swapCardShadow = computed(() => {
  switch (bp.value) {
    case 'xs':
      return 'none';
    case 'sm':
      return 'lg';
    default:
      return 'xl';
  }
});

const isError = computed(() => {
  const list = input_list.value;
  const isItemError = list.find(item => {
    if (
      item.balance === 0 ||
      item.amount === 0 ||
      item.periods === 0 ||
      item.periods > maxPeriods.value ||
      item.amount > item.balance
    ) {
      return true;
    }
    return false;
  });
  return isItemError ? true : false;
});

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

/**
 * FUNCTIONS
 */

function updateInputList(payload: RewardItem[]) {
  input_list.value = payload;
  console.log('🚀 ~ updateInputList ~ input_list:', input_list.value);
  // check isAllowance
  isAllowance.value = input_list.value.every(item => item.isAllowance);
  console.log('🚀 ~ updateInputList ~ isAllowance:', isAllowance.value);
}
async function checkAllowanceToken(address) {
  try {
    const allowance = await checkTokenAllowance(
      address,
      provider,
      account.value
    );
    console.log(allowance?.toString(), 'checkAllowanceToken');
    return BigNumber(allowance?.toString() || 0).gt(0) ? true : false;
  } catch (error) {
    console.log(error, 'error=>checkAllowanceToken');
    throw error;
  }
}
async function handleApproveButton() {
  const token = input_list.value[0];
  try {
    isLoading.value = true;
    const signer = getSigner();
    let tx = await approveToken(
      token.tokenAddress,
      provider,
      account.value,
      signer,
      chainId.value
    );

    const summary = `Approve token success!`;
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary,
    });
    txListener(tx, {
      onTxConfirmed: async () => {
        const is_allowance = await checkAllowanceToken(token.tokenAddress);
        isAllowance.value = is_allowance || false;
        isLoading.value = false;
      },
      onTxFailed: () => {
        isLoading.value = false;
      },
    });
  } catch (error) {
    console.log(error, 'error=>handleApproveButton');
    isLoading.value = false;
    addNotification({
      type: 'error',
      title: '',
      message: error?.message ? error.message : JSON.stringify(error),
    });
  }
}

function goBack() {
  // Use direct navigation to avoid router param issues
  const path =
    returnRoute === 'pool'
      ? `/#/${networkSlug}/pool/${poolId}`
      : `/#/${networkSlug}/sZ`;

  window.location.href = path;
}

async function handleSubmitButton() {
  try {
    isLoading.value = true;

    const signer = getSigner();
    const provider = getProvider();

    let tx = await depositTokens(
      gaugeAddress,
      streamerAddress,
      input_list.value,
      account.value,
      signer,
      provider,
      chainId.value
    );

    const summary = `Deposit tokens success!`;
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'depositTokens',
      summary,
    });

    txListener(tx, {
      onTxConfirmed: async () => {
        if (
          gaugeForm.value &&
          typeof gaugeForm.value.getTokenList === 'function'
        ) {
          await gaugeForm.value.getTokenList();
        }
        isLoading.value = false;
      },
      onTxFailed: () => {
        isLoading.value = false;
      },
    });
  } catch (error: any) {
    console.log(error, 'error=>handleTransferButton');
    isLoading.value = false;
    addNotification({
      type: 'error',
      title: '',
      message: error?.message ? error.message : JSON.stringify(error),
    });
  }
}
</script>

<template>
  <Col3Layout offsetGutters>
    <BalLoadingBlock v-if="loadingPool && !pool" class="h-96" />
    <div v-else class="addition-reward-container">
      <BalCard
        class="relative card-container bg-blue gauge-reward-container"
        :shadow="swapCardShadow"
        noBorder
      >
        <div class="mb-4 navigation">
          <div class="flex items-center cursor-pointer" @click="goBack">
            <BalIcon class="mr-1 text-gray-400" name="chevron-left" />
            <h5>Add Extra Rewards</h5>
          </div>
        </div>
        <div class="px-6 main-container">
          <div class="target-gauge-container">
            <TargetGauge :pool="pool" />
          </div>
          <div class="mt-2 form-container">
            <UserGaugeForm
              ref="gaugeForm"
              :gaugeAddress="gaugeAddress"
              @update:input-list="updateInputList"
            />
          </div>
          <div class="mt-8 btn-actions">
            <BalBtn
              v-if="!isAllowance"
              :disabled="input_list.length === 0 || isError"
              :label="$t('Approve')"
              :loading="isLoading"
              classCustom="pink-white-shadow"
              block
              @click.prevent="handleApproveButton"
            />
            <BalBtn
              v-else
              :disabled="input_list.length === 0 || isError"
              :label="$t('Deposit')"
              :loading="isLoading"
              classCustom="pink-white-shadow"
              block
              @click.prevent="handleSubmitButton"
            />
          </div>
        </div>
      </BalCard>
    </div>
  </Col3Layout>
</template>
<style lang="scss" scoped>
.gauge-reward-container {
  overflow: initial;
}
</style>