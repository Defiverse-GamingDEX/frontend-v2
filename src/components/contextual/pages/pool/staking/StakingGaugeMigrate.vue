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
type Props = {
  pool: Pool;
  gaugeInfo: any; // New prop to receive gauge info
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
const { balanceFor } = useTokens();
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
  return stakedShares.value || '0';
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
const canStake = computed(() => {
  return canProceedToStep2.value && !needsApproval.value;
});

const showApprovalButton = computed(() => {
  return isStep2Active.value && needsApproval.value && !stakeCompleted.value;
});

const showStakeButton = computed(() => {
  return isStep2Active.value && !needsApproval.value && !stakeCompleted.value;
});

/**
 * METHODS
 */
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
      await tx.wait();

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
    await tx.wait();
    unstakeCompleted.value = true;
    currentStep.value = 2;
    await refetchAllPoolStakingData();
    await checkApproveNewGauge();
  } catch (error) {
    console.error('Unstake failed:', error);
  } finally {
    isUnstaking.value = false;
  }
}

async function handleStake() {
  try {
    isStaking.value = true;
    const gauge_address = props.gaugeInfo.gauge;
    const tx = await stakeWithGaugeAddress(gauge_address);
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

onMounted(() => {
  checkApproveNewGauge();
});
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
