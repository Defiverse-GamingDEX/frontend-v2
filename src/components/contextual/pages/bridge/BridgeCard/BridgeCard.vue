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
import { ethers } from 'ethers';
// // COMPOSABLES
const { account, getSigner, chainId } = useWeb3();
const { connectToAppNetwork } = useBridgeWeb3();
const { bp } = useBreakpoints();
const {
  getTransferConfigs,
  getEstimateAmt,
  getTransferStatus,
  getTransferHistory,
  generationTransferId,
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
const estimateInfo = ref(null);
const paging = ref({
  page_size: 5,
  next_page_token: null,
});
const txHistory = ref([]);

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
watch(
  () => chainId.value,
  async () => {
    updateNetWorkInputFrom(chainId.value);
  }
);
watch(
  () => inputFromSelect.value.chainId,
  async () => {
    console.log('AAAAA', inputFromSelect.value.chainId, chainId.value);
    if (inputFromSelect.value.chainId !== chainId.value) {
      estimateInfo.value = {
        err: {
          code: '9999',
          msg: 'From network selected is different network connected',
        },
      };
    }
  }
);
watchEffect(() => {
  initSelectedData();
});
// /**
//  * FUNCTIONS
//  */

function covertUnitShow(number, token_decimals) {
  const decimals = new BigNumber(10).pow(token_decimals).toFixed();
  const rs = BigNumber(number || 0)
    .div(decimals)
    .toString();
  return rs;
}
function calcMinimumReceive() {
  if (estimateInfo.value) {
    let minimumReceive = BigNumber(estimateInfo.value.estimated_receive_amt)
      .minus(estimateInfo.value.base_fee)
      .minus(estimateInfo.value.perc_fee)
      .toString();
    return covertUnitShow(minimumReceive, inputFromSelect.value.decimals);
  }
  return 0;
}
function calcFee() {
  if (estimateInfo.value) {
    let fee = BigNumber(estimateInfo.value.base_fee)
      .plus(estimateInfo.value.perc_fee)
      .toString();
    return covertUnitShow(fee, inputFromSelect.value.decimals);
  }
  return 0;
}
function initSelectedData() {
  chainFrom.value = getChain(inputFromSelect.value.chainId);
  chainTo.value = getChain(inputToSelect.value.chainId);

  tokenFrom.value = getToken(
    inputFromSelect.value.tokenAddress,
    inputFromSelect.value.tokensList
  );
  tokenTo.value = tokenFrom.value;
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
  // await getBalanceInputFrom();
  // await checkAllowanceInputFrom();

  // reset amount
  inputFromSelect.value.amount = 0;
  inputToSelect.value.amount = 0;
  // connect network from
  handleNetworkChange(inputFromSelect.value.chainId);
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
      estimateInfo.value = rs;
      // update InputTo amount
      inputToSelect.value.amount = covertUnitShow(
        rs.estimated_receive_amt,
        inputFromSelect.value.decimals
      );
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

  inputToSelect.value.tokensList = inputFrom.tokensList;

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
    console.log(tx, 'tx');

    const chainNameInput = chainFrom.value.name;
    const chainNameOutput = chainTo.value.name;
    const summary = `tranfer token ${inputFromSelect.value.tokenSymbol} from ${chainNameInput} to ${chainNameOutput}`;
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'transfer',
      summary,
    });

    txListener(tx, {
      onTxConfirmed: async () => {
        console.log('success');
        const transfer_id = await generationTransferId(
          inputFromSelect.value,
          inputToSelect.value,
          account.value
        );
        setInterval(async () => {
          const transferStatus = await getTransferStatus(transfer_id);
          console.log(transferStatus,transfer_id, 'transferStatus');
        }, 15000);

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
onBeforeMount(async () => {
  updateNetWorkInputFrom(chainId.value);
  try {
    await getTransferHistory(account.value, paging.value);
  } catch (error) {
    console.log(error, 'error');
  }
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
            ></div>
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
        <div v-if="estimateInfo && !estimateInfo.err" class="bridge-info">
          <div class="info">
            <div class="title">Bridge Rate</div>
            <div class="value">
              1 {{ inputFromSelect?.tokenSymbol }} on
              <div class="item-img">
                <img width="48" height="48" :src="chainFrom?.img_url" />
              </div>
              ≈ {{ estimateInfo.bridge_rate }}
              {{ inputToSelect?.tokenSymbol }} on
              <div class="mr-0 item-img">
                <img width="48" height="48" :src="chainTo?.img_url" />
              </div>
            </div>
          </div>
          <div class="info">
            <div class="title">
              Fee
              <BalTooltip width="64">
                <template #activator>
                  <BalIcon
                    name="info"
                    size="xs"
                    class="flex ml-1 text-gray-400"
                  />
                </template>
                <div class="tooltip-content">
                  <div class="mb-2">
                    <span class="bold"> The Base Fee:</span>
                    {{ estimateInfo.base_fee }}
                    {{ inputFromSelect?.tokenSymbol }}.e
                  </div>
                  <div class="mb-4">
                    <span class="bold"> The Protocol Fee:</span>
                    {{ estimateInfo.perc_fee }}
                    {{ inputFromSelect?.tokenSymbol }}.e
                  </div>
                  <div class="mb-4">
                    Base Fee is used to cover the gas cost for sending your
                    transfer on the destination chain.
                  </div>
                  <div>
                    Protocol Fee is charged proportionally to your transfer
                    amount. Protocol Fee is paid to cBridge LPs and Celer SGN as
                    economic incentives.
                  </div>
                </div>
              </BalTooltip>
            </div>
            <div class="value">
              {{ calcFee() }}
              {{ inputFromSelect?.tokenSymbol }}.e
            </div>
          </div>
          <div class="info">
            <div class="title">
              Minimum Received
              <BalTooltip width="64">
                <template #activator>
                  <BalIcon
                    name="info"
                    size="xs"
                    class="flex ml-1 text-gray-400"
                  />
                </template>
                <div class="tooltip-content">
                  You will receive at least
                  {{ calcMinimumReceive() }}
                  {{ inputFromSelect?.tokenSymbol }}.e on
                  {{ getChainName(inputToSelect?.chainId) }}
                  or the transfer won't go through.
                </div>
              </BalTooltip>
            </div>
            <div class="w-40 value">
              {{ calcMinimumReceive() }}
              {{ inputFromSelect?.tokenSymbol }}.e
            </div>
          </div>
          <div class="info">
            <div class="title">
              Slippage Tolerance
              <BalTooltip width="64">
                <template #activator>
                  <BalIcon
                    name="info"
                    size="xs"
                    class="flex ml-1 text-gray-400"
                  />
                </template>
                <div class="tooltip-content">
                  The transfer won’t go through if the bridge rate moves
                  unfavorably by more than this percentage when the transfer is
                  executed.
                </div>
              </BalTooltip>
            </div>
            <div class="w-40 value">
              {{
                BigNumber(estimateInfo.slippage_tolerance).div(100).toFixed(2)
              }}%
            </div>
          </div>
        </div>
        <div v-if="estimateInfo?.err?.code" class="mt-8 notification-content">
          <BalAlert title="Error" type="error">
            {{ estimateInfo?.err?.msg }}
          </BalAlert>
        </div>
        <div class="bridge-actions">
          <BalBtn
            v-if="!isAllowance"
            :disabled="!estimateInfo || estimateInfo.err"
            :label="$t('Approve')"
            :loading="isLoading"
            classCustom="pink-white-shadow"
            block
            @click.prevent="handleApproveButton"
          />
          <BalBtn
            v-else
            :disabled="
              !estimateInfo ||
              estimateInfo.err ||
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
    margin-top: 24px;
    :deep() {
      .info {
        display: flex;
        flex-wrap: wrap;
        color: #0a425c;
        font-size: 14px;
        line-height: 17px;
        font-weight: medium;
        margin-bottom: 10px;
        .title {
          font-weight: bold;
          display: flex;
          align-items: center;
          .tooltip {
            font-weight: normal;
            .bold {
              font-weight: bold;
            }
          }
        }
        .value {
          margin-left: auto;
          width: 72%;
          text-align: right;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          white-space: nowrap;
          &.w-40 {
            width: 40%;
          }
          .item-img {
            margin: 0px 6px;
            &.mr-0 {
              margin-right: 0px;
            }
            > img {
              width: 14px;
              height: 14px;
            }
          }
        }
      }
    }
  }
  .bridge-actions {
    margin-top: 60px;
  }
}
</style>
