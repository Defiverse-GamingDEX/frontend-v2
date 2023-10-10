<script setup lang="ts">
import { computed, toRef } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useBridgeState } from '@/composables/bridge/useBridgeState';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import BridgePair from './BridgePair.vue';

// COMPOSABLES
const { bp } = useBreakpoints();
const {
  tokenInAddress,
  tokenOutAddress,
  tokenInAmount,
  tokenOutAmount,
  setTokenInAddress,
  setTokenOutAddress,
  setTokenInAmount,
  setTokenOutAmount,
  setInitialized,
} = useBridgeState();

// DATA
const exactIn = ref(true);

// COMPUTED
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

/**
 * FUNCTIONS
 */
function handleAmountChange() {
  console.log(tokenInAmount, 'tokenInAmount');
  console.log(tokenInAddress, 'tokenInAddress');
  console.log(tokenOutAmount, 'tokenOutAmount');
  console.log(tokenOutAddress, 'tokenOutAddress');
}
</script>

<template>
  <div class="bridge-card">
    <BalCard
      class="relative card-container bg-blue"
      :shadow="swapCardShadow"
      noBorder
    >
      <template #header>
        <div class="flex justify-end items-center w-full">
          <SwapSettingsPopover :context="SwapSettingsContext.bridge" />
        </div>
      </template>
      <div class="bridge-container">
        <BridgePair
          v-model:tokenInAmount="tokenInAmount"
          v-model:tokenInAddress="tokenInAddress"
          v-model:tokenOutAmount="tokenOutAmount"
          v-model:tokenOutAddress="tokenOutAddress"
          class="mb-4"
          @amount-change="handleAmountChange"
        />
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.bridge-card {
}
</style>
