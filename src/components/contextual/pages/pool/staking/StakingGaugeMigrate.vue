<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { Pool } from '@/services/pool/types';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import { bnum } from '@/lib/utils';
import { getAddress } from '@ethersproject/address';
import { useTokens } from '@/providers/tokens.provider';

type Props = {
  pool: Pool;
};

const props = defineProps<Props>();
const emit = defineEmits(['success', 'close']);

/**
 * STATE
 */
const currentStep = ref<1 | 2>(1);
const isUnstaking = ref(false);
const isStaking = ref(false);
const unstakeCompleted = ref(false);
const stakeCompleted = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum2 } = useNumbers();
const { balanceFor } = useTokens();
const {
  stakedShares,
  isRefetchingStakedShares,
  unstake,
  stake,
  refetchAllPoolStakingData,
} = usePoolStaking();

/**
 * COMPUTED
 */
const lpTokenAmount = computed(() => {
  // For migration, we use the staked shares from the legacy gauge
  return stakedShares.value || '0';
});

const fiatValueOfLPTokens = computed(() => {
  return bnum(props.pool.totalLiquidity)
    .div(props.pool.totalShares)
    .times(lpTokenAmount.value.toString())
    .toString();
});

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
 * METHODS
 */
async function handleUnstake() {
  try {
    isUnstaking.value = true;
    // const tx = await unstake();
    // await tx.wait();
    unstakeCompleted.value = true;
    currentStep.value = 2;
    await refetchAllPoolStakingData();
  } catch (error) {
    console.error('Unstake failed:', error);
  } finally {
    isUnstaking.value = false;
  }
}

async function handleStake() {
  try {
    isStaking.value = true;
    const tx = await stake();
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
    <div class="p-4 mb-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
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
                {{ fNum2(lpTokenAmount) }}
              </div>
              <div class="text-sm text-gray-500">
                {{ fNum2(fiatValueOfLPTokens, FNumFormats.fiat) }}
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
          <div v-else class="flex items-center text-green-500">
            <BalIcon name="check-circle" size="lg" />
            <span class="ml-2 font-medium">{{ $t('completed') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Stake to new pool -->
    <div v-if="currentStep === 2" :class="[]">
      <div class="">
        <div>
          <BalBtn
            v-if="!stakeCompleted"
            :color="isStep2Active ? 'gradient' : 'gray'"
            :disabled="!canProceedToStep2 || isStaking"
            :loading="isStaking"
            class="w-full"
            @click="handleStake"
          >
            {{ $t('migratePool.stakeToNewPool') }}
          </BalBtn>
          <div v-else class="flex items-center text-green-500">
            <BalIcon name="check-circle" size="lg" />
            <span class="ml-2 font-medium">{{ $t('completed') }}</span>
          </div>
        </div>
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
