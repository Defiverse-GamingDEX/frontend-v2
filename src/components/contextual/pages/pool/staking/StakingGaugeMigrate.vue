<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { Pool } from '@/services/pool/types';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import { bnum, trackLoading } from '@/lib/utils';
import { getAddress } from '@ethersproject/address';
import { useTokens } from '@/providers/tokens.provider';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { ApprovalAction } from '@/composables/approvals/types';
import { TransactionActionInfo } from '@/types/transactions';
import useTransactions from '@/composables/useTransactions';
type Props = {
  pool: Pool;
  gaugeInfo: any; // New prop to receive gauge info
  legacyStakedShares: string;
};

const props = defineProps<Props>();
const emit = defineEmits(['success', 'close']);

/**
 * STATE
 */
const currentStep = ref<1 | 2>(1);
const isUnstaking = ref(false);
const isStaking = ref(false);
const isApproving = ref(false);
const unstakeCompleted = ref(false);
const stakeCompleted = ref(false);
const isLoadingApprovalsForGauge = ref(false);
const approvalActions = ref<TransactionActionInfo[]>([]);
const needsApproval = ref(false);
/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum2 } = useNumbers();
const { balanceFor, refetchBalances, balanceQueryLoading } = useTokens();
const { addTransaction } = useTransactions();
const {
  stakedShares,
  isRefetchingStakedShares,
  unstakeWithGaugeAddress,
  stakeWithGaugeAddress,
  refetchAllPoolStakingData,
} = usePoolStaking();

/**
 * COMPUTED
 */
const gauge_address = computed(() => {
  return props.gaugeInfo.gauge;
});
const lpTokenAmountStep1 = computed(() => {
  // For migration, we use the staked shares from the legacy gauge
  return props.legacyStakedShares || '0';
});
const lpTokenAmountStep2 = computed(() => {
  // For migration, we use the staked shares from the legacy gauge
  return balanceFor(getAddress(props.pool.address)) || '0';
});
// We need to use the pool address (LP token) for approvals
const { getTokenApprovalActionsForSpender } = useTokenApprovalActions(
  [props.pool.address], // LP token address
  ref(balanceFor(getAddress(props.pool.address))),
  ApprovalAction.Staking
);
const isStep1Active = computed(
  () => currentStep.value === 1 && !unstakeCompleted.value
);
const isStep2Active = computed(
  () => currentStep.value === 2 || unstakeCompleted.value
);

const canProceedToStep2 = computed(() => unstakeCompleted.value);
const isMigrationComplete = computed(
  () => unstakeCompleted.value && stakeCompleted.value
);

/**
 * COMPUTED
 */
const hasWalletBalance = computed(() => {
  return bnum(lpTokenAmountStep2.value).gt(0);
});

const canStake = computed(() => {
  return (
    canProceedToStep2.value && !needsApproval.value && hasWalletBalance.value
  );
});

const showApprovalButton = computed(() => {
  return (
    isStep2Active.value &&
    needsApproval.value &&
    hasWalletBalance.value &&
    !stakeCompleted.value
  );
});

const showStakeButton = computed(() => {
  return (
    isStep2Active.value &&
    !needsApproval.value &&
    hasWalletBalance.value &&
    !stakeCompleted.value
  );
});

const showWaitingForBalance = computed(() => {
  return (
    isStep2Active.value &&
    !hasWalletBalance.value &&
    !balanceQueryLoading.value &&
    !stakeCompleted.value
  );
});

/**
 * METHODS
 */
async function waitForBalanceUpdate(maxRetries = 5, intervalMs = 1000) {
  let retries = 0;
  const initialBalance = lpTokenAmountStep2.value;

  console.log(
    '🚀 ~ Waiting for balance update, initial balance:',
    initialBalance
  );

  while (retries < maxRetries) {
    await refetchBalances.value();

    // Wait a bit for the reactive value to update
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentBalance = lpTokenAmountStep2.value;
    console.log(`🚀 ~ Retry ${retries + 1}: Balance = ${currentBalance}`);

    // Check if balance has increased (tokens returned to wallet)
    if (bnum(currentBalance).gt(initialBalance)) {
      console.log('🚀 ~ Balance updated successfully!');
      return true;
    }

    retries++;
    if (retries < maxRetries) {
      console.log(`🚀 ~ Balance not updated yet, waiting ${intervalMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  console.log('🚀 ~ Max retries reached, balance may not have updated');
  return false;
}

async function checkApproveNewGauge() {
  try {
    console.log(
      '🚀 ~ checkApproveNewGauge ~ gauge_address:',
      gauge_address.value
    );

    const actions = await trackLoading(async () => {
      return getTokenApprovalActionsForSpender(gauge_address.value);
    }, isLoadingApprovalsForGauge);

    console.log('🚀 ~ checkApproveNewGauge ~ actions:', actions);

    if (actions && actions.length > 0) {
      approvalActions.value = actions;
      needsApproval.value = true;
    } else {
      approvalActions.value = [];
      needsApproval.value = false;
    }
  } catch (error) {
    console.log('🚀 ~ checkApproveNewGauge ~ error:', error);
    needsApproval.value = false;
  }
}

async function handleApproval() {
  try {
    if (approvalActions.value.length > 0) {
      isApproving.value = true;
      const approvalAction = approvalActions.value[0];
      const tx = await approvalAction.action();
      console.log('🚀 ~ handleApproval ~ tx:', tx.hash);

      await tx.wait();
      console.log('🚀 ~ handleApproval ~ tx:', tx);
      // Re-check approval status after approval transaction
      await checkApproveNewGauge();
      isApproving.value = false;
    }
  } catch (error) {
    console.error('Approval failed:', error);
    isApproving.value = false;
  }
}

async function handleUnstake() {
  try {
    isUnstaking.value = true;
    const gauge_legacy_address = props.gaugeInfo.legacy_gauge;
    console.log('🚀 ~ handleUnstake ~ props.gaugeInfo:', props.gaugeInfo);
    console.log(
      '🚀 ~ handleUnstake ~ gauge_legacy_address:',
      gauge_legacy_address
    );
    const tx = await unstakeWithGaugeAddress(gauge_legacy_address);

    // Add transaction tracking for unstake
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'unstake',
      summary: t('transactionSummary.unstakeFromLegacyGauge', {
        pool: props.pool.symbol,
        amount: fNum2(lpTokenAmountStep1.value),
      }),
      details: {
        amount: fNum2(lpTokenAmountStep1.value),
        pool: props.pool,
        gauge: gauge_legacy_address,
      },
    });

    await tx.wait();

    // First refetch staking data
    await refetchAllPoolStakingData();

    // Then wait for balance to be updated with retry logic
    console.log('🚀 ~ Starting balance update wait...');
    const balanceUpdated = await waitForBalanceUpdate(5, 1000);

    if (balanceUpdated) {
      console.log('🚀 ~ Balance updated, checking approvals...');
      await checkApproveNewGauge();
    } else {
      console.log('🚀 ~ Balance may not have updated, but proceeding anyway');
      // Still try to check approvals in case balance was already there
      await checkApproveNewGauge();
    }
    unstakeCompleted.value = true;
    currentStep.value = 2;
    isUnstaking.value = false;
  } catch (error) {
    console.error('Unstake failed:', error);
    isUnstaking.value = false;
  }
}

async function handleStake() {
  try {
    isStaking.value = true;
    const gauge_address = props.gaugeInfo.gauge;
    const tx = await stakeWithGaugeAddress(gauge_address);

    // Add transaction tracking for stake
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'stake',
      summary: t('transactionSummary.migrateToNewGauge', {
        pool: props.pool.symbol,
        amount: fNum2(lpTokenAmountStep2.value),
      }),
      details: {
        amount: fNum2(lpTokenAmountStep2.value),
        pool: props.pool,
        gauge: gauge_address,
      },
    });

    await tx.wait();
    stakeCompleted.value = true;
    await refetchAllPoolStakingData();
    emit('success');
  } catch (error) {
    console.error('Stake failed:', error);
  } finally {
    isStaking.value = false;
  }
}

function handleClose() {
  emit('close');
}
</script>

<template>
  <div class="staking-gauge-migrate">
    <!-- Migration Steps Header -->
    <div class="flex justify-center items-center mb-6">
      <div class="flex items-center space-x-4">
        <!-- Step 1 -->
        <div class="flex items-center">
          <div
            :class="[
              'flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all',
              isStep1Active
                ? 'bg-gradient-to-tr from-blue-600 to-pink-600 text-white'
                : unstakeCompleted
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500',
            ]"
          >
            <BalIcon v-if="unstakeCompleted" name="check" size="sm" />
            <span v-else>1</span>
          </div>
        </div>

        <!-- Connector Line -->
        <div
          :class="[
            'w-12 h-0.5 transition-all',
            unstakeCompleted
              ? 'bg-gradient-to-r from-green-500 to-blue-600'
              : 'bg-gray-300 dark:bg-gray-600',
          ]"
        />

        <!-- Step 2 -->
        <div class="flex items-center">
          <div
            :class="[
              'flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all',
              isStep2Active && !stakeCompleted
                ? 'bg-gradient-to-tr from-blue-600 to-pink-600 text-white'
                : stakeCompleted
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500',
            ]"
          >
            <BalIcon v-if="stakeCompleted" name="check" size="sm" />
            <span v-else>2</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LP Token Display -->
    <div
      v-if="!stakeCompleted"
      class="p-4 mb-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
    >
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('lpTokens') }}
        </span>
        <div class="flex items-center space-x-2">
          <AnimatePresence :isVisible="isRefetchingStakedShares">
            <BalLoadingBlock class="w-20 h-5" />
          </AnimatePresence>
          <AnimatePresence :isVisible="!isRefetchingStakedShares">
            <div class="text-right">
              <div class="text-lg font-semibold">
                <span v-if="currentStep === 1">
                  {{ fNum2(lpTokenAmountStep1) }}
                </span>
                <span v-else>
                  {{ fNum2(lpTokenAmountStep2) }}
                </span>
              </div>
            </div>
          </AnimatePresence>
        </div>
      </div>
    </div>

    <!-- Step 1: Unstake from legacy -->
    <div v-if="currentStep === 1">
      <div class="">
        <div>
          <BalBtn
            v-if="!unstakeCompleted"
            :color="isStep1Active ? 'gradient' : 'gray'"
            :disabled="!isStep1Active || isUnstaking"
            :loading="isUnstaking"
            class="w-full"
            @click="handleUnstake"
          >
            {{ $t('migratePool.unstakeFromLegacy') }}
          </BalBtn>
        </div>
      </div>
    </div>

    <!-- Step 2: Approve and Stake to new pool -->
    <div v-if="currentStep === 2" class="space-y-3">
      <!-- Loading approval status -->
      <div v-if="isLoadingApprovalsForGauge" class="flex justify-center">
        <BalLoadingBlock class="w-full h-12" />
      </div>

      <!-- Approval button when needed -->
      <div v-else-if="showApprovalButton">
        <BalBtn
          :color="isStep2Active ? 'gradient' : 'gray'"
          :disabled="!canProceedToStep2"
          :loading="isApproving"
          class="mb-3 w-full"
          @click="handleApproval"
        >
          {{ approvalActions[0]?.label || $t('approve') }}
        </BalBtn>
      </div>

      <!-- Stake button when approval is complete or not needed -->
      <div v-else-if="showStakeButton">
        <BalBtn
          :color="isStep2Active ? 'gradient' : 'gray'"
          :disabled="!canStake || isStaking"
          :loading="isStaking"
          class="w-full"
          @click="handleStake"
        >
          {{ $t('migratePool.stakeToNewPool') }}
        </BalBtn>
      </div>

      <!-- Waiting for balance message -->
      <div v-else-if="showWaitingForBalance" class="py-4 text-center">
        <div class="flex flex-col items-center space-y-2">
          <BalLoadingIcon />
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('migratePool.waitingForTokensToAppearInWallet') }}
          </div>
        </div>
      </div>

      <!-- Loading balance -->
      <div v-else-if="balanceQueryLoading" class="flex justify-center py-4">
        <BalLoadingBlock class="w-full h-12" />
      </div>
    </div>

    <!-- Success Message -->
    <AnimatePresence :isVisible="isMigrationComplete">
      <BalAlert
        type="success"
        :title="$t('migratePool.successTitle')"
        class="mt-4"
      >
        {{ $t('migratePool.successDescription') }}
      </BalAlert>
    </AnimatePresence>

    <!-- Close Button -->
    <div class="flex justify-center mt-6">
      <BalBtn
        v-if="isMigrationComplete"
        color="gray"
        outline
        @click="handleClose"
      >
        {{ $t('close') }}
      </BalBtn>
    </div>
  </div>
</template>

<style scoped>
.staking-gauge-migrate {
  @apply w-full;
}
</style>
