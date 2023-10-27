<script setup lang="ts">
import { computed, toRef } from 'vue';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useBridge } from '@/composables/bridge/useBridge';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserSettings } from '@/providers/user-settings.provider';
import BridgePairToggle from './BridgePairToggle.vue';
import InputFrom from './InputFrom.vue';
import InputTo from './InputTo.vue';
import ChargeGasComponent from './ChargeGasComponent.vue';
import { BRIDGE_NETWORKS } from '@/constants/bridge/networks';
import { cloneDeep } from 'lodash';
import useBridgeWeb3 from '@/services/bridge/useBridgeWeb3';
import BigNumber from 'bignumber.js';
import useNotifications from '@/composables/useNotifications';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';

// // COMPOSABLES
const { account, getSigner, chainId } = useWeb3();
const { connectToAppNetwork } = useBridgeWeb3();
const { bp } = useBreakpoints();
const {
  getTransferConfigs,
  getEstimateAmt,
  getTokensBalance,
  getBalance,
  checkTokenAllowance,
  approveToken,
  bridgeSend,
  getChainName,
  getChain,
  getToken,
} = useBridge();
const { addNotification } = useNotifications();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();
const { slippage, setSlippage } = useUserSettings();
// const signer = getSigner();
// console.log(signer, 'signerAAA');
// // STATES
const chainsList = ref(BRIDGE_NETWORKS);
const bridgeRate = ref(1);
const bridgeFee = ref(0.001);
const gasFee = ref(0.01);

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
const isAllowance = ref(false);
const isLoading = ref(false);

const chainFrom = ref({});
const chainTo = ref({});
const tokenFrom = ref({});
const tokenTo = ref({});

// // COMPUTED
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

// WATCHS
watch(
  () => account.value,
  async () => {
    getBalanceInputFrom();
    checkAllowanceInputFrom();
  }
);

watchEffect(() => {
  initSelectedData();
});
// /**
//  * FUNCTIONS
//  */

function initSelectedData() {
  chainFrom.value = getChain(inputFromSelect.value.chainId);
  chainTo.value = getChain(inputToSelect.value.chainId);

  tokenFrom.value = getToken(
    inputFromSelect.value.tokenAddress,
    inputFromSelect.value.tokensList
  );
  tokenTo.value = getToken(
    inputToSelect.value.tokenAddress,
    inputToSelect.value.tokensList
  );
  console.log(chainFrom.value, ' chainFrom.value ');
  console.log(chainTo.value, ' chainTo.value ');
  console.log(tokenFrom.value, ' tokenFrom.value ');
  console.log(tokenTo.value, '  tokenTo.value  ');
}
async function getBalanceInputFrom() {
  // update balance InputFrom
  if (account.value && inputFromSelect.value.tokenAddress) {
    inputFromSelect.value.balance = await getBalance(
      tokenFrom.value,
      account.value
    );
  }
}
async function checkAllowanceInputFrom() {
  try {
    if (account.value && inputFromSelect.value.tokenAddress) {
      const allowance = await checkTokenAllowance(
        chainFrom.value,
        tokenFrom.value,
        account.value
      );
      isAllowance.value = BigNumber(allowance?.toString() || 0).gt(0)
        ? true
        : false;
      console.log(isAllowance.value, ' isAllowance.value');
    }
  } catch (error) {
    console.log(error, 'error=>checkAllowanceInputFrom');
    throw error;
  }
}
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
  await getBalanceInputFrom();
  await checkAllowanceInputFrom();
  // connect network from
  handleNetworkChange(inputFromSelect.value.chainId);
}
async function getBridgeRate() {
  // call contract to getRate here
  return new Promise((resolve, reject) => {
    resolve(1); // mean  1 From = 1
  });
}

async function setTokenInput(input, tokenFromList) {
  console.log(tokenFromList, 'tokenFromList');
  input.value.tokenSymbol = tokenFromList.symbol;
  input.value.tokenAddress = tokenFromList.address;
  input.value.decimals = tokenFromList.decimals;
}
function updateNetWorkInputFrom(chainId) {
  let networkChoose = BRIDGE_NETWORKS.find(
    item => item.chain_id_decimals === chainId
  );
  if (networkChoose) {
    inputFromSelect.value.chainId = networkChoose.chain_id_decimals;
    inputFromSelect.value.tokensList = cloneDeep(networkChoose.tokens);
    inputFromSelect.value.isOnlyDefiBridge = networkChoose.isOnlyDefiBridge;

    // set token default
    if (inputFromSelect.value.tokensList?.length > 0) {
      setTokenInput(inputFromSelect, inputFromSelect.value.tokensList[0]);
    }
    // set data inputTo
    checkInputToChange();

    // set chains and tokens selected
    initSelectedData();

    // call contract to check data
    getBalanceInputFrom();
    checkAllowanceInputFrom();
  }
}

async function handleInputFromChange(inputSelect) {
  inputFromSelect.value = inputSelect;
  console.log(inputFromSelect.value, 'inputFromSelect.value');
  if (inputFromSelect.value.chainId) {
    checkInputToChange();
  }
  // update amount InputTo
  inputToSelect.value.amount = inputFromSelect.value.amount * bridgeRate.value;
  // check allowance
  checkAllowanceInputFrom();

  getEstimateAtmData();
}
async function getEstimateAtmData() {
  try {
    if (
      inputFromSelect.value.amount > 0 &&
      inputFromSelect.value.chainId &&
      inputToSelect.value.chainId &&
      inputFromSelect.value.tokenSymbol &&
      account.value
    ) {
      let rs = await getEstimateAmt(
        inputFromSelect.value,
        inputToSelect.value,
        account.value,
        slippage.value
      );
      console.log(rs, 'rs=>getEstimateAtmData');
    }
  } catch (error) {
    console.log(error, 'error=>getEstimateAtmData');
  }
}
async function handleInputToChange(inputSelect) {
  console.log(inputSelect, 'inputSelect=>handleInputToChange');
  inputToSelect.value = inputSelect;
  console.log(inputToSelect.value, 'inputToSelect.value');

  getEstimateAtmData();
}

function handleWalletAddressChange(address) {
  anotherWalletAddress.value = address;
}
// function handleChargeGas(isChecked) {
//   isChargeGas.value = isChecked;
//   console.log(isChargeGas.value, 'isChargeGas.value');
// }
function checkInputToChange() {
  const inputFrom = inputFromSelect.value;
  // update chainsList
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
  } else {
    // set default chainId for inputTo
    if (inputToSelect.value.chainsList.length > 0) {
      inputToSelect.value.chainId =
        inputToSelect.value.chainsList[0].chain_id_decimals;
    }
  }

  console.log(inputToSelect.value, 'inputToSelect');
}
function handleNetworkChange(networkId) {
  let network = getChain(networkId);
  if (network) {
    connectToAppNetwork(network);
  }
}
async function handleTransferButton() {
  try {
    isLoading.value = true;

    const signer = getSigner();

    let tx = await bridgeSend(
      inputFromSelect.value,
      inputToSelect.value,
      slippage.value,
      account.value,
      signer
    );

    const chainNameInput = chainFrom.value.name;
    const chainNameOutput = chainTo.value.name;
    const summary = `tranfer token ${inputFromSelect.value.tokenSymbol} from ${chainNameInput} to ${chainNameOutput}`;
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary,
    });
    txListener(tx, {
      onTxConfirmed: async () => {
        console.log('success');
        isLoading.value = false;
      },
      onTxFailed: () => {
        isLoading.value = false;
      },
    });
  } catch (error) {
    console.log(error, 'error=>handleTransferButton');
    isLoading.value = false;
    addNotification({
      type: 'error',
      title: '',
      message: error?.message ? error.message : JSON.stringify(error),
    });
  }
}
async function handleApproveButton() {
  try {
    isLoading.value = true;
    const signer = getSigner();
    let tx = await approveToken(
      chainFrom.value,
      tokenFrom.value,
      account.value,
      signer
    );

    const chainName = chainFrom.value.name;
    const summary = `Approve token ${inputFromSelect.value.tokenSymbol} on ${chainName}`;
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary,
    });
    txListener(tx, {
      onTxConfirmed: async () => {
        await checkAllowanceInputFrom();
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

/**
 * LIFECYCLE
 */
onBeforeMount(() => {
  updateNetWorkInputFrom(chainId.value);
});
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
            <div class="mx-2 h-px bg-gray-100 dark:bg-gray-700 grow" />
            <div
              v-if="inputFromSelect.tokenAddress && inputToSelect.chainId"
              class="flex items-center text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
            >
              <!-- <div class="rate">
                1 {{ inputFromSelect?.tokenSymbol }} on
                {{ getChainName(inputFromSelect?.chainId) }} = {{ bridgeRate }}
                {{ inputToSelect?.tokenSymbol }} on
                {{ getChainName(inputToSelect?.chainId) }}
              </div> -->
            </div>
          </div>
          <div class="input-to">
            <div class="label">To</div>
            <InputTo
              :chainsList="inputToSelect?.chainsList"
              :inputSelect="inputToSelect"
              :disabled="true"
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
          <!-- <div class="charge-gas-container">
            <ChargeGasComponent
              :isChargeGas="isChargeGas"
              @update:change-gas="handleChargeGas($event)"
            />
          </div> -->
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
            v-if="!isAllowance"
            :disabled="!inputFromSelect.tokenAddress || !inputToSelect.chainId"
            :label="$t('Approve')"
            :loading="isLoading"
            classCustom="pink-white-shadow"
            block
            @click.prevent="handleApproveButton"
          />
          <BalBtn
            v-else
            :disabled="
              !inputFromSelect.tokenAddress ||
              !inputToSelect.chainId ||
              inputFromSelect.balance === 0 ||
              inputFromSelect.balance < inputFromSelect.amount ||
              inputFromSelect.amount <= 0
            "
            :label="$t('Tranfer')"
            :loading="isLoading"
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
