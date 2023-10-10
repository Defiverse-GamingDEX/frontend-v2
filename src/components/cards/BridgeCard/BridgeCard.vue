<script setup lang="ts">
import { computed, toRef } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useBridgeState } from '@/composables/bridge/useBridgeState';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import BridgePair from './BridgePair.vue';
import BridgePairToggle from './BridgePairToggle.vue';
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

function handleTokenSwitch(): void {
  // emit('update:exactIn', !props.exactIn);
  // emit('update:tokenInAmount', _tokenOutAmount.value);
  // emit('update:tokenInAddress', _tokenOutAddress.value);
  // emit('update:tokenOutAmount', _tokenInAmount.value);
  // emit('update:tokenOutAddress', _tokenInAddress.value);
  // emit('amountChange');
}
function handlePreviewButton() {
  // swapping.resetSubmissionError();
  // modalSwapPreviewIsOpen.value = true;
  console.log('show modal preview');
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
        <div class="bridge-form">
          <div class="input-from">
            <div class="label">From</div>
          </div>
          <div class="flex items-center my-5">
            <BridgePairToggle @toggle="handleTokenSwitch" />
            <div class="mx-2 h-px bg-gray-100 dark:bg-gray-700 grow" />
          </div>
          <div class="input-to">
            <div class="label">To</div>
          </div>
          <div class="input-another-wallet">
            <div class="title">Send to another wallet</div>
            <div class="wallet-address-input">input address wallet</div>
          </div>
          <div class="charge-gas">charge gas here</div>
        </div>
        <div class="bridge-info">
          <div class="info">
            <div class="title">Bridge Rate</div>
            <div class="value">1ETH on ? = 1WETH on ?</div>
          </div>
          <div class="info">
            <div class="title">Destination gas fee</div>
            <div class="value">1ETH on ? = 1WETH on ?</div>
          </div>
          <div class="info">
            <div class="title">Bridge fee</div>
            <div class="value">1ETH on ? = 1WETH on ?</div>
          </div>
          <div class="info">
            <div class="title">You will receive</div>
            <div class="value">1ETH on ? = 1WETH on ?</div>
          </div>
        </div>
        <div class="bridge-actions">
          <BalBtn
            :label="$t('preview')"
            classCustom="pink-white-shadow"
            block
            @click.prevent="handlePreviewButton"
          />
        </div>
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.bridge-card {
}
</style>
