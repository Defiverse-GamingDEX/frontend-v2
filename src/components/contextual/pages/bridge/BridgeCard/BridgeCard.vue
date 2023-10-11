<script setup lang="ts">
import { computed, toRef } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useBridgeState } from '@/composables/bridge/useBridgeState';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import BridgePairToggle from './BridgePairToggle.vue';
import InputFrom from './InputFrom.vue';
import InputTo from './InputTo.vue';

import { BRIDGE_NETWORKS } from '@/constants/bridge/networks';
import { BRIDGE_DEFI_TOKENS } from '@/constants/bridge/defi-tokens';
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
const inputFromSelect = ref({
  chainId: '',
  tokenSymbol: '',
  tokenAddress: '',
  balance: null,
});
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

function handleTokenSwitch() {
  console.log('handleTokenSwitch');
}
function handleInputFromChange(inputSelect) {
  inputFromSelect.value = inputSelect;
  console.log(inputFromSelect.value, 'inputFromSelect.value');
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
            <InputFrom
              :chainsList="BRIDGE_NETWORKS"
              :tokensList="BRIDGE_DEFI_TOKENS"
              :inputSelect="inputFromSelect"
              @update:input-select="handleInputFromChange"
            />
          </div>
          <div class="flex justify-center items-center my-5">
            <BridgePairToggle @toggle="handleTokenSwitch" />
          </div>
          <div class="input-to">
            <div class="label">To</div>
            <InputTo />
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
  .bridge-container {
    .bridge-form {
      .label {
        color: #0a425c;
        font-size: 18px;
        font-weight: bold;
        line-height: 22px;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
@/constants/bridge/defi-tokens