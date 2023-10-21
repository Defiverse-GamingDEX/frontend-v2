<script setup lang="ts">
import { computed, toRef } from 'vue';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useBridge } from '@/composables/bridge/useBridge';
import useWeb3 from '@/services/web3/useWeb3';

import BridgePairToggle from './BridgePairToggle.vue';
import InputFrom from './InputFrom.vue';
import InputTo from './InputTo.vue';
import ChargeGasComponent from './ChargeGasComponent.vue';
import { BRIDGE_NETWORKS } from '@/constants/bridge/networks';
import { cloneDeep } from 'lodash';
import useBridgeWeb3 from '@/services/bridge/useBridgeWeb3';
// COMPOSABLES
const { account, getSigner, chainId } = useWeb3();
const { connectToAppNetwork } = useBridgeWeb3();
const { bp } = useBreakpoints();
const { getTokensBalance, getBalance } = useBridge();

const signer = getSigner();
console.log(signer, 'signerAAA');
// STATES
const chainsList = ref(BRIDGE_NETWORKS);
const bridgeRate = ref(1);
const bridgeFee = ref(0.001);
const gasFee = ref(0.01);

const inputFromSelect = ref({
  chainId: chainId,
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

async function handleTokenSwitch() {
  await swapData();
}
async function swapData() {
  const inputFrom = cloneDeep(inputFromSelect.value);
  const inputTo = cloneDeep(inputToSelect.value);
  console.log(inputTo, 'inputTo');

  // map InputFrom
  inputFromSelect.value = inputTo;
  console.log(inputFromSelect.value, 'inputFromSelect.valueAAA');
  inputToSelect.value = inputFrom;

  // update inputTo chainsList
  if (inputFromSelect.value.chainId) {
    checkInputToChange();
  }
  // update balance InputFrom
  if (account.value && inputFromSelect.value.tokenAddress) {
    inputFromSelect.value.balance = await getBalance(
      inputFromSelect.value.tokenAddress,
      account.value
    );
  }
}
async function getBridgeRate() {
  // call contract to getRate here
  return new Promise((resolve, reject) => {
    resolve(2); // mean  1 From = 2 To
  });
}
function getChainName(chainId) {
  return BRIDGE_NETWORKS.find(item => item.chain_id_decimals === chainId)?.name;
}
function getChain(chainId) {
  return BRIDGE_NETWORKS.find(item => item.chain_id_decimals === chainId);
}
async function handleInputFromChange(inputSelect) {
  inputFromSelect.value = inputSelect;
  console.log(inputFromSelect.value, 'inputFromSelect.value');
  if (inputFromSelect.value.chainId) {
    checkInputToChange();
  }
  //get BridgeRate
  bridgeRate.value = await getBridgeRate();
  // update amount InputTo
  inputToSelect.value.amount = inputFromSelect.value.amount * bridgeRate.value;
}
async function handleInputToChange(inputSelect) {
  inputToSelect.value = inputSelect;
  console.log(inputToSelect.value, 'inputToSelect.value');
  //get BridgeRate
  bridgeRate.value = await getBridgeRate();
  // update amount InputTo
  inputFromSelect.value.amount = inputToSelect.value.amount / bridgeRate.value;
}

function handleWalletAddressChange(address) {
  anotherWalletAddress.value = address;
}
function handleChargeGas(isChecked) {
  isChargeGas.value = isChecked;
  console.log(isChargeGas.value, 'isChargeGas.value');
}
function checkInputToChange() {
  const inputFrom = inputFromSelect.value;
  // update chainsList
  console.log(inputFrom.isOnlyDefiBridge, 'inputFrom.isOnlyDefiBridge');
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
  // update token
  inputToSelect.value.tokenSymbol = inputFrom.tokenSymbol;
  inputToSelect.value.tokenAddress = inputFrom.tokenAddress;
  inputToSelect.value.decimals = inputFrom.decimals;
  inputToSelect.value.isOnlyDefiBridge = inputFrom.isOnlyDefiBridge;

  // check chainId select is avai
  if (inputToSelect.value.chainId) {
    let avaiChain = inputToSelect.value.chainsList?.find(
      item => item.chain_id_decimals === inputToSelect.value.chainId
    );
    if (!avaiChain) {
      inputToSelect.value.chainId = '';
    }
  }

  console.log(inputToSelect.value, 'inputToSelect');
}
function handleNetworkChange(networkId) {
  console.log(networkId, 'networkId');
  let network = getChain(networkId);
  if (network) {
    console.log(network, 'networkAAA');
    connectToAppNetwork(network);
  }
}
function handleTransferButton() {
  console.log(inputFromSelect.value, 'inputFromSelect.value');
  console.log(inputToSelect.value, 'inputToSelect');
  console.log(isChargeGas.value, 'isChargeGas.value');
  console.log(anotherWalletAddress.value, 'anotherWalletAddress.value');
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
              @update:network="handleNetworkChange"
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
        <div
          v-if="inputFromSelect.tokenAddress && inputToSelect.chainId"
          class="bridge-info"
        >
          <div class="info">
            <div class="title">Bridge Rate</div>
            <div class="value">
              1 {{ inputFromSelect?.tokenSymbol }} on
              {{ getChainName(inputFromSelect?.chainId) }} = {{ bridgeRate }}
              {{ inputToSelect?.tokenSymbol }} on
              {{ getChainName(inputToSelect?.chainId) }}
            </div>
          </div>
          <div class="info">
            <div class="title">Destination gas fee</div>
            <div class="value">{{ gasFee }} OAS</div>
          </div>
          <div class="info">
            <div class="title">Bridge fee</div>
            <div class="value">{{ bridgeFee }} OAS</div>
          </div>
          <div class="info">
            <div class="title">You will receive</div>
            <div class="value">
              {{ inputToSelect?.amount }} {{ inputToSelect?.tokenSymbol }} on
              {{ getChainName(inputToSelect?.chainId) }}
            </div>
          </div>
        </div>
        <div class="bridge-actions">
          <BalBtn
            :label="$t('tranfer')"
            classCustom="pink-white-shadow"
            block
            @click.prevent="handleTransferButton"
          />
        </div>
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.bridge-card {
  > .bal-card {
    :deep() {
      > .card-container {
        > .header {
          padding: 24px 48px 0px 48px;
        }
        > .content {
          padding: 0px 48px 24px 48px;
        }
      }
    }
  }

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
  .bridge-info {
    margin-top: 16px;

    .info {
      display: flex;
      flex-wrap: wrap;
      color: #0a425c;
      font-size: 14px;
      line-height: 17px;
      font-weight: medium;
      margin-bottom: 10px;
      .title {
      }
      .value {
        margin-left: auto;
        width: 60%;
        text-align: right;
      }
    }
  }
  .bridge-actions {
    margin-top: 90px;
  }
}
</style>
