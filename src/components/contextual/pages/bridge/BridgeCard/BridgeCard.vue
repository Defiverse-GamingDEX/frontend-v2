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
import ChargeGasComponent from './ChargeGasComponent.vue';
import { BRIDGE_NETWORKS } from '@/constants/bridge/networks';
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

// STATES
const chainsList = ref(BRIDGE_NETWORKS);
const inputFromSelect = ref({
  chainId: '',
  tokenSymbol: '',
  tokenAddress: '',
  balance: 0,
  amount: 0,
  decimals: 18,
  tokensList: [],
  isOnlyDefiBridge: false,
});
const inputToSelect = ref({
  chainId: '',
  tokenSymbol: '',
  tokenAddress: '',
  balance: 0,
  amount: 0,
  decimals: 18,
  tokensList: [],
  chainsList: [],
  isOnlyDefiBridge: false,
});
const anotherWalletAddress = ref('');
const isChargeGas = ref(false);
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
  if (inputFromSelect.chainId) {
    checkInputToNetwork();
  }
}
function handleInputToChange(inputSelect) {
  inputToSelect.value = inputSelect;
  console.log(inputToSelect.value, 'inputToSelect.value');
}

function handleWalletAddressChange(address) {
  anotherWalletAddress.value = address;
}
function handleChargeGas(isChecked) {
  isChargeGas.value = isChecked;
  console.log(isChargeGas.value, 'isChargeGas.value');
}
function checkInputToNetwork() {
  const inputFrom = inputFromSelect.value;
  if (inputFrom.isOnlyDefiBridge) {
    inputToSelect.value.chainsList = chainsList.value.filter(
      item =>
        (item.chain_id_decimals === 16116 || item.chain_id_decimals == 17117) &&
        item.chain_id_decimals !== inputFrom.chainId
    );
  } else {
    inputToSelect.value.chainsList = chainsList.value.filter(
      item => item.chain_id_decimals !== inputFrom.chainId
    );
  }
  console.log(inputToSelect.value, 'inputToSelect');
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
              :chainsList="chainsList"
              :inputSelect="inputFromSelect"
              @update:input-select="handleInputFromChange"
            />
          </div>
          <div class="flex justify-center items-center my-3">
            <BridgePairToggle @toggle="handleTokenSwitch" />
          </div>
          <div class="input-to">
            <div class="label">To</div>
            <InputTo
              :chainsList="inputToSelect?.chainsList"
              :inputSelect="inputToSelect"
              @update:input-select="handleInputToChange"
            />
          </div>
          <div class="input-another-wallet">
            <div class="title">Send to another wallet</div>
            <div class="wallet-address-input">
              <BalTextInput
                :modelValue="anotherWalletAddress"
                name="anotherWallet"
                placeholder=""
                type="text"
                :decimalLimit="decimalLimit"
                validateOn="input"
                autocomplete="off"
                autocorrect="off"
                step="any"
                spellcheck="false"
                v-bind="$attrs"
                inputAlignRight
                @update:model-value="handleWalletAddressChange($event)"
              >
              </BalTextInput>
            </div>
          </div>
          <div class="charge-gas-container">
            <ChargeGasComponent
              :isChargeGas="isChargeGas"
              @update:change-gas="handleChargeGas($event)"
            />
          </div>
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
    .input-another-wallet {
      margin-top: 10px;
      .title {
        font-size: 14px;
        line-height: 17px;
        font-weight: medium;
        color: #0a425c;
        margin-bottom: 8px;
      }
      :deep() {
        .input-group {
          padding: 0px;
          > input {
            height: auto;
            text-align: left;
          }
        }
      }
    }
    .charge-gas-container {
      margin-top: 14px;
    }
  }
}
</style>
