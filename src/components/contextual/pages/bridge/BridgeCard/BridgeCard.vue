<script setup lang="ts">
import ChargeGasComponent from '@/components/contextual/pages/bridge/BridgeCard/ChargeGasComponent.vue';
import bridgeApi from '@/composables/bridge/bridge.price.api';
import { useBridge } from '@/composables/bridge/useBridge';
import useBreakpoints from '@/composables/useBreakpoints';
import useEthers from '@/composables/useEthers';
import useNotifications from '@/composables/useNotifications';
import useTransactions from '@/composables/useTransactions';
import { BRIDGE_NETWORKS } from '@/constants/bridge/networks';
import { formatNumberToCurrency } from '@/lib/utils/index';
import { isValidAddressV2 } from '@/lib/utils/validations';
import { useUserSettings } from '@/providers/user-settings.provider';
import useBridgeWeb3 from '@/services/bridge/useBridgeWeb3';
import useWeb3 from '@/services/web3/useWeb3';
import { isAddress } from '@ethersproject/address';
import BigNumber from 'bignumber.js';
import { cloneDeep, debounce } from 'lodash';
import { computed } from 'vue';
import BridgePairToggle from './BridgePairToggle.vue';
import InputFrom from './InputFrom.vue';
import InputTo from './InputTo.vue';
// COMPOSABLES
const {
  account,
  getSigner,
  getProvider,
  chainId,
  isWalletReady,
  isMismatchedNetwork,
  startConnectWithInjectedProvider,
} = useWeb3();
const { connectToAppNetwork } = useBridgeWeb3();
const { bp } = useBreakpoints();
const {
  truncateDecimal,
  getTokenURL,
  checkIsNative,

  getBalance,
  getNativeBalance,
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

const srcBE = ref(null);
const dstBE = ref(null);
const routesBE = ref(null);

const estimateInfo = ref(null);
const paging = ref({
  page_size: 5,
  next_page_token: null,
});
//const networkFee = ref(0);
const txHistory = ref([]);

const inputFromSelect = ref({
  chainId: '',
  tokenSymbol: '',
  tokenAddress: '',
  balance: 0,
  amount: 0,
  decimals: 18,
  tokensList: [],
  minAmount: 0,
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
const currentAllowance = ref(0);
const isLoading = ref(false);

const chainFrom = ref({});
const chainTo = ref({});
const tokenFrom = ref({});
const tokenTo = ref({});
const minAmountRoute = ref(0);
const oasys_bridge_type = ref(0);
const li_bridge_address = ref('');
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
    verifyNetwork();
    updateNetWorkInputFrom(chainId.value);
  }
);
watch(
  () => inputFromSelect.value.chainId,
  async () => {
    verifyNetwork();
  }
);
watchEffect(() => {
  initSelectedData();
});
// /**
//  * FUNCTIONS
//  */
function groupByChainId(arr) {
  // group by chainId
  const groupedByChainId = arr.reduce((acc, curr) => {
    const chainId = curr.chain_id;
    let networkStaticInfo = BRIDGE_NETWORKS.find(
      item => item.chain_id_decimals === chainId
    );
    if (!acc[chainId]) {
      acc[chainId] = { chain_id: chainId, tokens: [] };
    }
    const tokenAddress = curr.token_address;
    const tokenExists = acc[chainId].tokens.some(
      token => token.address?.toLowerCase() === tokenAddress?.toLowerCase()
    );
    if (!tokenExists) {
      acc[chainId].tokens.push({
        name: curr.token_name,
        address: curr.token_address,
        logoURI: getTokenURL(curr.token_symbol),
        symbol: curr.token_symbol,
        decimals: curr.token_decimals,
        is_native: checkIsNative(curr.token_address, chainId),
        rpc: networkStaticInfo?.rpc,
      });
    }
    acc[chainId] = { ...acc[chainId], ...networkStaticInfo };
    return acc;
  }, {});

  const result = Object.values(groupedByChainId);
  return result;
}
function reorderTokens(tokens, symbolToMove) {
  const index = tokens.findIndex(token => token.symbol === symbolToMove);

  if (index > 0) {
    const [token] = tokens.splice(index, 1);

    tokens.unshift(token);
  }

  return tokens;
}
function reOrderTokensList(data) {
  const result = data?.map(item => {
    return {
      ...item,
      tokens: reorderTokens(item.tokens, 'OAS'),
    };
  });
  return result;
}
function initSrcBE() {
  if (routesBE.value?.length > 0) {
    const data = routesBE.value;
    const srcList = data?.map(item => item.src);
    let result = groupByChainId(srcList);
    result = reOrderTokensList(result);
    return result || [];
  }
}
async function getRouters() {
  try {
    let rs = await bridgeApi.getRoutes();
    if (rs.length > 0) {
      routesBE.value = rs;
      srcBE.value = initSrcBE();
      if (srcBE.value?.length > 0) {
        updateNetWorkInputFrom(chainId.value);
      }
    }
  } catch (error) {
    console.log(error, 'error=>getRouters');
  }
}
function verifyNetwork() {
  console.log('AAAAA', inputFromSelect.value.chainId, chainId.value);
  if (
    inputFromSelect.value.chainId &&
    chainId.value &&
    inputFromSelect.value.chainId !== chainId.value
  ) {
    estimateInfo.value = {
      err: {
        code: '9999',
        msg: `You must switch to ${getChainName(
          inputFromSelect.value.chainId
        )} to begin the transfer`,
      },
    };
  } else {
    estimateInfo.value = null;
  }
}
async function initData() {
  getRouters();
  verifyNetwork();
}
function covertUnitShow(number, token_decimals) {
  const decimals = new BigNumber(10).pow(token_decimals).toFixed();
  const rs = BigNumber(number || 0)
    .div(decimals)
    .toString();
  return rs;
}

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
}
function initMinAmountRoute() {
  minAmountRoute.value = 0;
  oasys_bridge_type.value = '';
  li_bridge_address.value = '';
  if (
    inputFromSelect.value.chainId &&
    inputToSelect.value.chainId &&
    routesBE.value?.length > 0
  ) {
    for (let i = 0; i < routesBE.value.length; i++) {
      const item = routesBE.value[i];
      console.log('🚀 ~ initMinAmountRoute ~ item:', item);
      console.log(item.src.chain_id, ' item.src.chain_id=>initMinAmountRoute');
      console.log(item.dst.chain_id, ' item.dst.chain_id=>initMinAmountRoute');
      console.log(
        inputFromSelect.value.chainId,
        ' inputFromSelect.value.chainId=>initMinAmountRoute'
      );
      console.log(
        inputToSelect.value.chainId,
        '  inputToSelect.value.chainId=>initMinAmountRoute'
      );
      if (
        item.src.chain_id === inputFromSelect.value.chainId &&
        item.dst.chain_id === inputToSelect.value.chainId &&
        item.src.token_symbol === inputFromSelect.value.tokenSymbol
      ) {
        minAmountRoute.value = item.min_amount;
        oasys_bridge_type.value = item.type;
        li_bridge_address.value = item.l1_bridge || item.l1_cbridge;
        console.log(
          '🚀 ~ initMinAmountRoute ~ oasys_bridge_type.value:',
          oasys_bridge_type.value
        );
        console.log(
          '🚀 ~ initMinAmountRoute ~ li_bridge_address.value :',
          li_bridge_address.value
        );
        console.log(
          '🚀 ~ initMinAmountRoute ~  minAmountRoute.value:',
          minAmountRoute.value
        );
        break;
      }
    }
  }
}
async function getBalanceInputFrom() {
  // update balance InputFrom
  if (account.value && inputFromSelect.value.tokenAddress) {
    if (tokenFrom.value.is_native) {
      inputFromSelect.value.balance = await getNativeBalance(
        tokenFrom.value,
        account.value
      );
    } else {
      inputFromSelect.value.balance = await getBalance(
        tokenFrom.value,
        account.value
      );
    }
  }
}
async function checkAllowanceInputFrom() {
  try {
    if (account.value && inputFromSelect.value.tokenAddress) {
      console.log(chainFrom.value?.type, ' chainFrom.value?.type');
      if (
        chainFrom.value?.type === 'verse-chain' ||
        inputFromSelect.value?.tokenSymbol === 'OAS' ||
        inputFromSelect.value?.tokenAddress?.toLowerCase() ===
          '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000' ||
        inputFromSelect.value?.tokenAddress?.toLowerCase() ===
          '0x0000000000000000000000000000000000000000'
      ) {
        isAllowance.value = true;
        return;
      }

      const allowance = await checkTokenAllowance(
        chainFrom.value,
        tokenFrom.value,
        account.value,
        li_bridge_address.value
      );
      currentAllowance.value = BigNumber(allowance?.toString() || 0).toFixed();

      const inputAmount = BigNumber(inputFromSelect.value.amount)
        .times(10 ** inputFromSelect.value.decimals)
        .toFixed();

      isAllowance.value = BigNumber(currentAllowance.value || 0).gte(
        inputAmount
      )
        ? true
        : false;
    }
  } catch (error) {
    console.log(error, 'error=>checkAllowanceInputFrom');
    throw error;
  }
}
async function handleTokenSwitch() {
  // await swapData();
}
// async function swapData() {
//   const inputFrom = cloneDeep(inputFromSelect.value);
//   const inputTo = cloneDeep(inputToSelect.value);
//   console.log(inputTo, 'inputTo');

//   // map InputFrom
//   inputFromSelect.value = inputTo;
//   console.log(inputFromSelect.value, 'inputFromSelect.valueAAA');
//   inputToSelect.value = inputFrom;

//   // update inputTo chainsList
//   if (inputFromSelect.value.chainId) {
//     checkInputToChange();
//   }
//   // await getBalanceInputFrom();
//   // await checkAllowanceInputFrom();

//   // reset amount
//   inputFromSelect.value.amount = 0;
//   inputToSelect.value.amount = 0;
//   // connect network from
//   handleNetworkChange(inputFromSelect.value.chainId);
// }

async function setTokenInput(input, tokenFromList) {
  input.value.tokenSymbol = tokenFromList.symbol;
  input.value.tokenAddress = tokenFromList.address;
  input.value.decimals = tokenFromList.decimals;
}
function updateNetWorkInputFrom(chainId) {
  let networkChoose = srcBE.value.find(
    item => item?.chain_id_decimals === chainId
  );
  if (networkChoose) {
    inputFromSelect.value.minAmount = networkChoose.min_amount;
    inputFromSelect.value.chainId = networkChoose.chain_id_decimals;
    inputFromSelect.value.tokensList = cloneDeep(networkChoose.tokens);
    // TODO check token is_native
    inputFromSelect.value.tokensList = inputFromSelect.value.tokensList.map(
      item => {
        const is_native =
          inputFromSelect.value.chainId === 248 && item.symbol === 'OAS';
        return {
          ...item,
          is_native: is_native,
        };
      }
    );
    // set token default
    if (inputFromSelect.value.tokensList?.length > 0) {
      setTokenInput(inputFromSelect, inputFromSelect.value.tokensList[0]);
    }

    // set data inputTo
    inputToSelect.value.chainId = ''; // reset
    checkInputToChange();

    // set chains and tokens selected to get balance
    initSelectedData();

    // set min amount route
    initMinAmountRoute();
    // call contract to check data
    getBalanceInputFrom();
    checkAllowanceInputFrom();
  }
}
const delayinputFromChange = debounce(async inputSelect => {
  handleInputFromChange(inputSelect);
}, 500);

async function handleInputFromChange(inputSelect) {
  inputFromSelect.value = inputSelect;
  if (inputFromSelect.value.chainId) {
    checkInputToChange();
  }
  // check allowance
  checkAllowanceInputFrom();

  // set min amount route
  initMinAmountRoute();

  await getEstimateFee();
  await getBalanceInputFrom();
}
function mapEstimateInfo(rs) {
  console.log('🚀 ~ mapEstimateInfo ~ rs:', rs);
  const amount_in_show = BigNumber(rs.amount_in)
    .div(Math.pow(10, rs.src_token_decimals))
    .toString();
  const amount_out_show = BigNumber(rs.amount_out)
    .div(Math.pow(10, rs.dst_token_decimals))
    .toString();
  return {
    ...rs,
    amount_in_show: amount_in_show,
    amount_out_show: amount_out_show,
    fee1_show: BigNumber(rs.fee1)
      .div(Math.pow(10, rs.fee1_decimals))
      .toString(),
    fee2_show: BigNumber(rs.fee2)
      .div(Math.pow(10, rs.fee2_decimals))
      .toString(),
    bridge_rate: truncateDecimal(
      BigNumber(amount_out_show).div(amount_in_show).toString(),
      2
    ),
  };
}

async function getEstimateFeeRoutes() {
  try {
    if (
      inputFromSelect.value.amount > 0 &&
      inputFromSelect.value.chainId &&
      inputToSelect.value.chainId &&
      inputFromSelect.value.tokenSymbol &&
      account.value
    ) {
      const amount = BigNumber(inputFromSelect.value.amount)
        .times(Math.pow(10, inputFromSelect.value.decimals))
        .toFixed(0);
      const params = {
        src_token_address: inputFromSelect.value.tokenAddress,
        src_chain_id: inputFromSelect.value.chainId,
        dst_chain_id: inputToSelect.value.chainId,
        amount_in: amount,
      };
      const rs = await bridgeApi.getEstimateFee(params);

      if (rs) {
        estimateInfo.value = mapEstimateInfo(rs);
        console.log(
          '🚀 ~ getEstimateFeeRoutes ~ estimateInfo.value:',
          estimateInfo.value
        );

        // update InputTo amount
        inputToSelect.value.amount = estimateInfo.value?.amount_out_show || 0;
      }
    }
  } catch (error) {
    console.log(error, 'error=>getEstimateFeeRoutes');
  }
}
async function getGasFee() {
  try {
    const signer = getSigner();
    const provider = getProvider();
    const isEstimate = true;
    const rs = await bridgeSend(
      inputFromSelect.value,
      inputToSelect.value,
      account.value,
      signer,
      provider,
      isEstimate
    );
    const gasPrice = 10000000000000;
    const gasLimit = rs?.tx || 250000;
    networkFee.value = Number(
      BigNumber(gasPrice)
        .times(gasLimit)
        .div(10 ** inputFromSelect.value.decimals)
        .toFixed()
    );
    console.log('🚀 ~ getGasFee ~ networkFee.value:', networkFee.value);
  } catch (error) {
    console.log(error, 'error=>getGasFee');
  }
}
async function getEstimateFee() {
  try {
    //networkFee.value = 0;
    await getEstimateFeeRoutes();
    // if (
    //   inputToSelect.value.chainId &&
    //   inputFromSelect.value.tokenSymbol === 'OAS' &&
    //   Number(inputFromSelect.value.chainId) === 16116
    // ) {
    //   await getGasFee();
    // }
  } catch (error) {
    console.log(error, 'error=>getEstimateFee');
  }
}
async function handleInputToChange(inputSelect) {
  inputToSelect.value = inputSelect;

  getEstimateFee();
  initMinAmountRoute();
}

function handleWalletAddressChange(address) {
  anotherWalletAddress.value = address;
}
// function handleChargeGas(isChecked) {
//   isChargeGas.value = isChecked;
//   console.log(isChargeGas.value, 'isChargeGas.value');
// }
function getDstByChainIdAndTokenAddress(routes, srcChainId, tokenAddress) {
  const dstList = routes
    .filter(
      route =>
        route.src.chain_id === srcChainId &&
        route.src.token_address === tokenAddress
    )
    .map(route => route.dst);
  const result = groupByChainId(dstList);
  return result;
}

function checkInputToChange() {
  const inputFrom = inputFromSelect.value;

  dstBE.value = getDstByChainIdAndTokenAddress(
    routesBE.value,
    inputFrom.chainId,
    inputFrom.tokenAddress
  );
  inputToSelect.value.chainsList = dstBE.value;
  // update token
  inputToSelect.value.tokenSymbol = inputFrom.tokenSymbol;

  // check chainId select is avai
  if (inputToSelect.value.chainId) {
    let avaiChain = inputToSelect.value.chainsList?.find(
      item => item.chain_id_decimals === inputToSelect.value.chainId
    );
    if (!avaiChain) {
      inputToSelect.value.chainId = '';
      //inputToSelect.value.tokenSymbol = '';
      inputToSelect.value.tokenAddress = '';
      inputToSelect.value.decimals = 0;
      inputToSelect.value.tokensList = [];
    } else {
      //inputToSelect.value.tokenSymbol = avaiChain.tokens[0]?.symbol;
      inputToSelect.value.tokenAddress = avaiChain.tokens.find(
        token => token.symbol === inputToSelect.value.tokenSymbol
      )?.address;
      inputToSelect.value.decimals = avaiChain.tokens.find(
        token => token.symbol === inputToSelect.value.tokenSymbol
      )?.decimals;
      inputToSelect.value.tokensList = avaiChain.tokens;
    }
  } else {
    // set default chainId for inputTo
    if (inputToSelect.value.chainsList.length > 0) {
      const avaiChain = inputToSelect.value.chainsList[0];
      inputToSelect.value.chainId = avaiChain.chain_id_decimals;
      //inputToSelect.value.tokenSymbol = avaiChain.tokens[0]?.symbol;
      inputToSelect.value.tokenAddress = avaiChain.tokens.find(
        token => token.symbol === inputToSelect.value.tokenSymbol
      )?.address;
      inputToSelect.value.decimals = avaiChain.tokens.find(
        token => token.symbol === inputToSelect.value.tokenSymbol
      )?.decimals;
      inputToSelect.value.tokensList = avaiChain.tokens;
    } else {
      inputToSelect.value.chainId = '';
      //inputToSelect.value.tokenSymbol = '';
      inputToSelect.value.tokenAddress = '';
      inputToSelect.value.decimals = 0;
      inputToSelect.value.tokensList = [];
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
    const provider = getProvider();

    const { tx, nonce } = await bridgeSend(
      inputFromSelect.value,
      inputToSelect.value,
      account.value,
      anotherWalletAddress.value,
      signer,
      provider,
      false,
      oasys_bridge_type.value,
      li_bridge_address.value
    );

    // const chainNameInput = chainFrom.value.name;
    // const chainNameOutput = chainTo.value.name;
    const summary = `Bridge success!`;
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'bridge',
      summary,
    });

    tx &&
      txListener(tx, {
        onTxConfirmed: async (receipt: any) => {
          const params = {
            sender_address: account.value,
            receiver_address: anotherWalletAddress.value
              ? anotherWalletAddress.value
              : account.value,
            src_chain_id: inputFromSelect.value.chainId,
            dst_chain_id: inputToSelect.value.chainId,
            src_token_address: inputFromSelect.value.tokenAddress,
            amount_in: BigNumber(inputFromSelect.value.amount)
              .times(Math.pow(10, inputFromSelect.value.decimals))
              .toFixed(0),
            nonce: nonce,
            src_tx_id: receipt?.transactionHash,
          };
          const rsBE = await bridgeApi.postBridgeRequest(params);
          //await initData();
          await getBalanceInputFrom();
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
    let approveAmount = BigNumber(inputFromSelect.value.amount || 0).toFixed();
    approveAmount = BigNumber(approveAmount || 0)
      //.plus(1)
      .times(10 ** inputFromSelect.value.decimals)
      .toFixed();
    console.log(approveAmount, 'approveAmount');
    //approveAmount = approveAmount + 1;
    const signer = getSigner();
    let tx = await approveToken(
      chainFrom.value,
      tokenFrom.value,
      account.value,
      signer,
      approveAmount,
      li_bridge_address.value
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
  initData();
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
        <!-- <div class="flex justify-end items-center w-full">
          <SwapSettingsPopover :context="SwapSettingsContext.bridge" />
        </div> -->
      </template>
      <div class="bridge-container">
        <div class="bridge-form">
          <div class="input-from">
            <div class="label">From</div>
            <InputFrom
              :chainsList="srcBE"
              :inputSelect="inputFromSelect"
              :disabled="!isWalletReady"
              :minAmount="minAmountRoute"
              @update:input-select="delayinputFromChange"
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
              :disabled="!isWalletReady"
              @update:input-select="handleInputToChange"
            />
          </div>
          <div class="input-another-wallet">
            <div class="title">Send to another wallet</div>
            <div class="wallet-address-input">
              <BalTextInput
                :modelValue="anotherWalletAddress"
                :rules="[isValidAddressV2()]"
                :disabled="!isWalletReady"
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
          <div class="cex-warning error">
            *The exchange's deposit address is invalid. Please be careful.
          </div>
          <div class="charge-gas-container">
            <ChargeGasComponent
              :isChargeGas="isChargeGas"
              @update:change-gas="handleChargeGas($event)"
            />
          </div>
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
              Fee 1
              <!--<BalTooltip width="64">
                <template #activator>
                  <BalIcon
                    name="info"
                    size="xs"
                    class="flex ml-1 text-gray-400"
                  />
                </template>
                <div class="tooltip-content">
                
                  <div>Balabalaba</div>
                </div>
              </BalTooltip>  -->
            </div>
            <div class="value">
              {{ formatNumberToCurrency(estimateInfo?.fee1_show) }}
              {{ inputFromSelect?.tokenSymbol }}
            </div>
          </div>
          <div class="info">
            <div class="title">
              Fee 2
              <!--<BalTooltip width="64">
                <template #activator>
                  <BalIcon
                    name="info"
                    size="xs"
                    class="flex ml-1 text-gray-400"
                  />
                </template>
                <div class="tooltip-content">Balabalaba</div>
              </BalTooltip> -->
            </div>
            <div class="w-40 value">
              {{ formatNumberToCurrency(estimateInfo?.fee2_show) }}
              {{ inputFromSelect?.tokenSymbol }}
            </div>
          </div>
          <div class="info">
            <div class="title">You will receive</div>
            <div class="w-40 value">
              {{ formatNumberToCurrency(estimateInfo?.amount_out_show) }}
              {{ inputFromSelect?.tokenSymbol }}
            </div>
          </div>
          <!-- <div class="info">
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
          </div> -->
        </div>
        <div v-if="estimateInfo?.err?.code" class="mt-8 notification-content">
          <BalAlert title="Error" type="error">
            {{ estimateInfo?.err?.msg }}
          </BalAlert>
        </div>
        <div v-if="estimateInfo?.err?.code === '9999'" class="bridge-actions">
          <BalBtn
            :label="$t('Change network ')"
            :loading="isLoading"
            classCustom="pink-white-shadow"
            block
            @click.prevent="handleNetworkChange(inputFromSelect?.chainId)"
          />
        </div>
        <div v-else>
          <div v-if="isWalletReady" class="bridge-actions">
            <BalBtn
              v-if="!isAllowance"
              :disabled="
                !estimateInfo ||
                !!estimateInfo.err ||
                Number(estimateInfo.amount_out) <= 0 ||
                Number(inputFromSelect.amount) < Number(minAmountRoute)
              "
              :label="$t('Approve')"
              :loading="isLoading"
              classCustom="pink-white-shadow"
              block
              @click.prevent="handleApproveButton"
            />
            <BalBtn
              v-else
              :disabled="
                (anotherWalletAddress && !isAddress(anotherWalletAddress)) ||
                !estimateInfo ||
                !!estimateInfo.err ||
                Number(estimateInfo.amount_out) <= 0 ||
                Number(inputFromSelect.balance) === 0 ||
                Number(inputFromSelect.balance) <
                  Number(inputFromSelect.amount) ||
                Number(inputFromSelect.amount) < Number(minAmountRoute)
              "
              :label="$t('Tranfer')"
              :loading="isLoading"
              classCustom="pink-white-shadow"
              block
              @click.prevent="handleTransferButton"
            />
          </div>
          <div v-else class="bridge-actions wallet-connect">
            <BalBtn
              :label="$t('connectWallet')"
              :loading="isLoading"
              classCustom="pink-white-shadow"
              block
              @click="startConnectWithInjectedProvider"
            />
          </div>
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
  .cex-warning {
    font-weight: 600;
    margin-top: 0.75rem;
    font-size: 1rem;
    line-height: 1.25rem;
    color: rgb(239 68 68);
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
              width: 28px;
              height: 28px;
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
