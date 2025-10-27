<template>
  <BalModal id="redeem-modal" :show="show" @close="$emit('close')">
    <template #header>
      <div class="flex justify-between items-center px-4">
        <h5 class="text-3xl font-bold text-black">Redeem</h5>
      </div>
    </template>

    <div class="px-2 redeem-modal-container">
      <div class="p-4 mb-2 rounded-xl border border-gray-800">
        <div class="flex flex-col justify-end items-end mb-1 balance-content">
          <div class="text-xs text-right balance-label">
            Redeemable :
            <span
              class="text-xs hover:underline cursor-pointer balance-value"
              @click="setMaxAmount"
            >
              {{
                fNum2((redeemableBalance || 0).toString(), FNumFormats.token)
              }}</span
            >
            sZ
          </div>
        </div>
        <div class="relative input-control">
          <input
            v-model="amount"
            type="number"
            placeholder="0"
            class="pr-10 w-full text-xl font-bold bg-whitefocus:outline-none font-sm"
            @input="delayinputChange"
          />
          <div
            class="flex absolute top-1/2 right-0 gap-2 items-center -translate-y-1/2"
          >
            <img :src="ZIcon" alt="Z Token" class="w-4 h-4" />
            <span class="text-xl font-bold text-gray-800">sZ</span>
          </div>
        </div>
        <div v-if="validate.isError" class="validate-amount">
          {{ validate.message }}
        </div>
      </div>

      <div class="flex justify-end items-center mb-4 ratio-content">
        <span>1 sZ = {{ estimateZRate }} Z</span>
      </div>

      <div class="flex justify-between items-center mb-8 maturity-content">
        <span class="label">Maturity</span>
        <span class="value">{{ pool?.maturity }}</span>
      </div>

      <div class="flex flex-col mb-2">
        <div class="flex justify-between items-center penalty-content">
          <div class="flex gap-2 items-center">
            <span class="label">Early redemption penalty</span>
            <BalTooltip
              text="Early redemption will incur a penalty that reduces the amount of Z tokens you receive."
              placement="top"
              iconSize="sm"
              width="64"
              iconClass="text-black"
            />
          </div>
          <span class="value">-{{ penaltyRate }} %</span>
        </div>
        <p class="warning-text">
          Redemption prior to maturity reduces the sZ that can be received.
        </p>
      </div>

      <div class="pt-4">
        <div class="receive-content">
          <div class="label">Receive</div>
          <div class="flex justify-end items-center">
            <span class="mr-1 text-xl font-bold text-black">{{
              receiveAmount || '-'
            }}</span>
            <div class="flex items-center">
              <img :src="ZIcon" alt="Z Token" class="w-4 h-4" />
              <span class="ml-1 text-xl font-bold text-black">Z</span>
            </div>
          </div>
          <hr class="mt-4 border-gray-800" />
        </div>
      </div>
    </div>

    <template #footer>
      <div v-if="!account" class="mt-4 btn-actions">
        <BalBtn
          :label="$t('connectWallet')"
          :loading="isLoading"
          classCustom="pink-white-shadow"
          block
          @click="startConnectWithInjectedProvider"
        />
      </div>
      <div v-else class="mt-4 btn-actions">
        <div v-if="!isApproved">
          <BalBtn
            :disabled="!amount || Number(amount) <= 0"
            label="Approve"
            :loading="isLoading"
            classCustom="pink-white-shadow"
            block
            @click="handleApprove"
          />
        </div>
        <div v-else>
          <BalBtn
            v-if="!amount"
            label="Enter Amount"
            :disabled="true"
            classCustom="pink-white-shadow"
            block
          />
          <BalBtn
            v-else
            label="Redeem"
            :loading="isLoading"
            :disabled="!receiveAmount || validate.isError"
            classCustom="pink-white-shadow"
            block
            @click="handleRedeem"
          />
        </div>
      </div>
    </template>
  </BalModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';
import { useStakeZ } from '@/composables/stakeZ/useStakeZ';
import useWeb3 from '@/services/web3/useWeb3';
import { STAKE_Z_NETWORKS } from '@/constants/stakeZ';
import BigNumber from 'bignumber.js';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useEthers from '@/composables/useEthers';
import useNotifications from '@/composables/useNotifications';
import useTransactions from '@/composables/useTransactions';
import { debounce } from 'lodash';
import { ethers } from 'ethers';
const props = defineProps<{
  show: boolean;
  pool?: any;
}>();

const emit = defineEmits(['close', 'redeem']);

/**
 * STATES
 */
const redeemableBalance = ref(0);
const penaltyRate = ref<number | string>(0);
const estimateZRate = ref<number | string>(0);
const amount = ref(0);
const receiveAmount = ref<number | ''>('');
const validate = ref({
  isError: false,
  message: '',
});
const isApproved = ref(true); // TODO need check
const isLoading = ref(false);
/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const {
  getRedeemableAmount_SZ,
  getEstimateZAmount,
  getEarlyRedeemPenalty,
  checkTokenAllowance,
  approveToken,
  redeemSZ,
} = useStakeZ();
const { account, chainId, getProvider, startConnectWithInjectedProvider } =
  useWeb3();
const { addNotification } = useNotifications();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();
/**
 * COMPUTED
 */
const STAKE_Z_NETWORK = computed(() => {
  return (
    STAKE_Z_NETWORKS.find(network => network.chain_id === chainId.value) || null
  );
});

/**
 * FUNCTIONS
 */
const getRedeemableBalance = async () => {
  try {
    const provider = getProvider();
    let balance = await getRedeemableAmount_SZ({
      provider: provider,
      walletAddress: account.value,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      stakeId: props.pool?.id,
    });
    balance = BigNumber(balance)
      .div(10 ** Number(STAKE_Z_NETWORK.value?.sz_token_decimals))
      .toFixed();
    redeemableBalance.value = balance;
    console.log(
      '🚀 ~ getRedeemableBalance ~ redeemableBalance.value:',
      redeemableBalance.value
    );
  } catch (error) {
    console.log(error, 'getRedeemableBalance=>error');
    redeemableBalance.value = 0;
  }
};
// const getPenaltyRate = async () => {
//   try {
//     const provider = getProvider();
//     let penalty = await getEarlyRedeemPenalty({
//       provider: provider,
//       contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
//     });
//     if (penalty) {
//       console.log('🚀 ~ getPenaltyRate ~ penalty:', penalty);
//       penalty = BigNumber(penalty).div(1e4).toFixed(0);
//     }
//     penaltyRate.value = penalty;
//     console.log('🚀 ~ getPenatyRate ~ penaltyRate.value:', penaltyRate.value);
//   } catch (error) {
//     console.log(error, 'getPenatyRate=>error');
//     penaltyRate.value = 0;
//   }
// };
const getEstimateZRate = async (amountInput: number) => {
  try {
    console.log('🚀 ~ getEstimateZRate ~ pool:', props.pool);
    const stakeId = props.pool?.id;
    const provider = getProvider();
    const amount = BigNumber(amountInput || 0)
      .times(10 ** (STAKE_Z_NETWORK.value?.sz_token_decimals || 18))
      .toFixed(0);
    const rs = await getEstimateZAmount({
      provider: provider,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      amount: amount,
      stakeId: stakeId,
      account: account.value,
    });
    console.log('🚀 ~ getEstimateZRate ~ rs:', rs);
    const { redemptionRate, zAmount } = rs;
    // Format penaltyRate to remove trailing zeros
    console.log(
      '🚀 ~ getEstimateZRate ~ redemptionRate:',
      redemptionRate?.toString()
    );
    console.log('🚀 ~ getEstimateZRate ~ zAmount:', zAmount?.toString());
    const rateNum = BigNumber(redemptionRate?.toString() || 0).div(1e4);
    const rateStr = rateNum.toFixed(2);
    penaltyRate.value = rateStr.endsWith('.00')
      ? rateStr.slice(0, -3)
      : rateStr;
    console.log(
      '🚀 ~ getEstimateZRate ~ penaltyRate.valueBefore :',
      penaltyRate.value
    );
    // change penaltyRate follow logic -(100% - penaltyRate)
    penaltyRate.value = BigNumber(100).minus(penaltyRate.value).toFixed(2);
    console.log(
      '🚀 ~ getEstimateZRate ~ penaltyRate.valueAfter :',
      penaltyRate.value
    );
    estimateZRate.value = BigNumber(zAmount?.toString() || 0)
      .div(10 ** (STAKE_Z_NETWORK.value?.z_token_decimals || 18))
      .toFixed();
    console.log(
      '🚀 ~ getEstimateZRate ~ estimateZRate.value:',
      estimateZRate.value
    );
  } catch (error) {
    console.log(error, 'getEstimateZRate=>error');
    estimateZRate.value = 0;
  }
};
const checkAllowance = async () => {
  try {
    const provider = getProvider();
    const allowance = await checkTokenAllowance({
      provider: provider,
      tokenAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      walletAddress: account.value,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
    });

    if (allowance.gt(0)) {
      isApproved.value = true;
    } else {
      isApproved.value = false;
    }
  } catch (error) {
    console.log(error, 'checkAllowance=>error');
  }
};
const handleApprove = async () => {
  // TODO: Handle approve
  try {
    isLoading.value = true;
    const provider = getProvider();
    const signer = provider.getSigner();
    console.log(
      '🚀 ~ handleApprove ~ redeemableBalance?.value:',
      redeemableBalance?.value
    );

    // Use ethers.utils.parseUnits to preserve precision (similar to StakingForm)
    const decimals = STAKE_Z_NETWORK.value?.sz_token_decimals || 18;
    const approveAmount = ethers.utils.parseUnits(
      String(redeemableBalance?.value || 0),
      decimals
    );

    console.log(
      '🚀 ~ handleApprove ~ approveAmount (wei):',
      approveAmount.toString()
    );

    const params = {
      provider,
      contractProvider: provider,
      tokenAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      signer,
      approveAmount: approveAmount,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
    };
    const tx = await approveToken(params);
    console.log('🚀 ~ handleApprove ~ tx:', tx);
    txListener(tx, {
      onTxConfirmed: async () => {
        await checkAllowance();
        isLoading.value = false;
      },
      onTxFailed: () => {
        isLoading.value = false;
      },
    });
  } catch (error: any) {
    isLoading.value = false;
    console.log(error, 'handleApprove=>error');
    addNotification({
      type: 'error',
      title: '',
      message: error?.message ? error.message : JSON.stringify(error),
    });
  }
};
const fetchData = async () => {
  try {
    await getRedeemableBalance();
    getEstimateZRate(1);
  } catch (error) {
    console.log('🚀 ~ error:', error);
  }
};
const delayinputChange = debounce(async event => {
  handleAmountChange(event);
}, 500);
const checkValidateAmount = () => {
  if (Number(amount?.value) > Number(redeemableBalance.value)) {
    validate.value = {
      isError: true,
      message: 'Insufficient balance',
    };
    return;
  }
  validate.value = {
    isError: false,
    message: '',
  };
};
const calculateReceiveAmount = () => {
  try {
    const calculatedAmount = BigNumber(Number(amount?.value))
      .times(Number(estimateZRate?.value || 0))
      .toNumber();
    receiveAmount.value = calculatedAmount;

    checkValidateAmount();
  } catch (error) {
    console.error('Error calculating receive amount:', error);
    receiveAmount.value = 0;
  }
};
const handleAmountChange = async event => {
  console.log('🚀 ~ event:', event);
  amount.value = event.target.value;
  if (!amount.value) {
    receiveAmount.value = 0;
    return;
  }
  calculateReceiveAmount();
};

const handleRedeem = async () => {
  try {
    isLoading.value = true;
    console.log('🚀 ~ handleRedeem:', amount.value);
    const provider = getProvider();

    // Use ethers.utils.parseUnits to preserve precision
    const decimals = STAKE_Z_NETWORK.value?.sz_token_decimals ?? 18;
    const decimals_amount = ethers.utils.parseUnits(
      String(amount.value),
      decimals
    );

    console.log(
      '🚀 ~ handleRedeem ~ decimals_amount (wei):',
      decimals_amount.toString()
    );

    const signer = provider.getSigner();
    const params = {
      provider,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      account: account.value,
      value: decimals_amount.toString(), // amount
      stakeId: props.pool?.id,
      signer: signer,
    };
    console.log('🚀 ~ handleRedeem ~ params:', params);
    const tx = await redeemSZ(params);
    console.log('🚀 ~ handleRedeem ~ rs:', tx);
    const summary = `Redeem sZ success!`;
    addTransaction({
      id: tx?.hash || tx,
      type: 'tx',
      action: 'redeemSZ',
      summary,
    });

    tx &&
      txListener(tx, {
        onTxConfirmed: async (receipt: any) => {
          console.log('🚀 ~ onTxConfirmed: ~ receipt:', receipt);
          emit('redeem', {
            receipt: receipt,
          });
          isLoading.value = false;
        },
        onTxFailed: () => {
          isLoading.value = false;
        },
      });
  } catch (error: any) {
    isLoading.value = false;
    console.log(error, 'handleStake=>error');
    addNotification({
      type: 'error',
      title: '',
      message: error?.message ? error.message : JSON.stringify(error),
    });
  }
};
const setMaxAmount = () => {
  amount.value = redeemableBalance.value;
  calculateReceiveAmount();
};
/**
 * LIFE CYCLES
 */
onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
#redeem-modal {
  :deep() {
    .redeem-modal-container {
      .balance-content {
        color: #000;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        .balance-label {
        }
        .balance-value {
          color: #12a8ec;
        }
      }
      .validate-amount {
        color: #f00;
        font-size: 11px;
        font-weight: 500;
      }
      .input-control {
        input {
          color: #000;
          font-size: 24px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          padding-right: 48px;
          &::-webkit-inner-spin-button,
          &::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          -moz-appearance: textfield;
        }
      }
      .ratio-content {
        color: #000;
        font-size: 12px;
        font-weight: 600;
        padding-right: 12px;
      }
      .maturity-content {
        color: #000;
        font-size: 18px;
        font-weight: 600;
      }
      .penalty-content {
        color: #000;
        font-size: 18px;
        font-weight: 600;
        .label {
        }
        .value {
          color: #f00;
        }
      }
      .warning-text {
        color: #f00;
        font-size: 11px;
        font-weight: 500;
      }
      .receive-content {
        .label {
          color: #000;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .value {
        }
      }
    }
    .footer {
      width: 100%;
      display: block;
      .btn-actions {
        .btn-enter-amount {
          background: #555;
        }
      }
    }
  }
}
</style>
