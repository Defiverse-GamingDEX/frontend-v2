<script lang="ts">
// Add a default export to make the component importable with default import
export default {
  name: 'StakingForm',
};
</script>
<script setup lang="ts">
import { ref } from 'vue';

import BalCard from '@/components/_global/BalCard/BalCard.vue';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
import { useStakeZ } from '@/composables/stakeZ/useStakeZ';
import { STAKE_Z_NETWORKS } from '@/constants/stakeZ';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { cloneDeep, debounce } from 'lodash';
import BigNumber from 'bignumber.js';
import { format } from 'date-fns';
import useNotifications from '@/composables/useNotifications';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
/**
 * STATES
 */
const isApproved = ref(false);
const amount = ref<number | unknown>(0);
const receiveAmount = ref<number | unknown>(0);
const userZBalance = ref<number | unknown>(0);
const rateSZ = ref<number | unknown>(0);
const maturityPeriod = ref<any>({});
const isLoading = ref(false);
const validate = ref({
  isError: false,
  message: '',
});
/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { addNotification } = useNotifications();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();
const { upToLargeBreakpoint } = useBreakpoints();
const { account, chainId, getProvider, startConnectWithInjectedProvider } =
  useWeb3();
const STAKE_Z_NETWORK = computed(() => {
  return (
    STAKE_Z_NETWORKS.find(network => network.chain_id === chainId.value) || null
  );
});
const {
  getTokenBalance,
  getMaturityPeriod,
  getEstimateSzAmount,
  checkTokenAllowance,
  approveToken,
  stakeZ,
  stakeZForTest,
} = useStakeZ();
/**
 * METHODS
 */
const checkValidateAmount = () => {
  if (Number(amount?.value) > Number(userZBalance?.value)) {
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
const handleAmountChange = async event => {
  console.log('🚀 ~ event:', event);
  amount.value = event.target.value;
  if (!amount.value) {
    receiveAmount.value = 0;
    return;
  }

  try {
    const calculatedAmount = BigNumber(Number(amount?.value))
      .times(Number(rateSZ?.value || 0))
      .toNumber();
    receiveAmount.value = calculatedAmount;
    checkValidateAmount();
  } catch (error) {
    console.error('Error calculating receive amount:', error);
    receiveAmount.value = 0;
  }
};
const delayinputChange = debounce(async event => {
  handleAmountChange(event);
}, 500);

const getUserZBalance = async () => {
  try {
    const provider = getProvider();
    const zBalance = await getTokenBalance({
      provider: provider,
      tokenAddress: STAKE_Z_NETWORK.value?.z_token_address,
      walletAddress: account.value,
      tokenDecimals: STAKE_Z_NETWORK.value?.z_token_decimals,
    });
    return zBalance;
  } catch (error) {
    console.log(error, 'getZbalance=>error');
    return 0;
  }
};
const getRateSZ = async () => {
  try {
    const amount = BigNumber(1)
      .times(10 ** (STAKE_Z_NETWORK.value?.z_token_decimals || 18))
      .toFixed(0);
    const provider = getProvider();
    const rateSZ = await getEstimateSzAmount({
      provider: provider,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      amount: amount,
    });
    console.log('🚀 ~ getRateSZ ~ rateSZ:', rateSZ);
    return BigNumber(rateSZ)
      .div(10 ** (STAKE_Z_NETWORK.value?.z_token_decimals || 18))
      .toFixed();
  } catch (error) {
    console.log(error, 'getRateSZ=>error');
    return 0;
  }
};
const getMaturityPeriodInfo = async () => {
  try {
    const provider = getProvider();
    const rs = await getMaturityPeriod({
      provider: provider,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
    });
    console.log('🚀 ~ getMaturityPeriod ~ maturityPeriod:', rs);
    const days = BigNumber(rs).div(86400).toFixed(0);
    console.log('🚀 ~ getMaturityPeriodInfo ~ days:', days);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(days));
    console.log('🚀 ~ getMaturityPeriodInfo ~ endDate:', endDate);
    maturityPeriod.value = {
      endDate: format(endDate, 'dd MMM yyyy'),
      days: days,
    };
    console.log('🚀 ~ getMaturityPeriodInfo ~ maturityPeriod:', maturityPeriod);
  } catch (error) {
    console.log(error, 'getMaturityPeriod=>error');
  }
};
const checkAllowance = async () => {
  try {
    const provider = getProvider();
    const allowance = await checkTokenAllowance({
      provider: provider,
      tokenAddress: STAKE_Z_NETWORK.value?.z_token_address,
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
const fetchData = async () => {
  try {
    userZBalance.value = await getUserZBalance();
    rateSZ.value = await getRateSZ();
    await getMaturityPeriodInfo();
    await checkAllowance();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
const handleApprove = async () => {
  // TODO: Handle approve
  try {
    isLoading.value = true;
    const provider = getProvider();
    const signer = provider.getSigner();
    console.log(
      '🚀 ~ handleApprove ~ userZBalance?.value:',
      userZBalance?.value
    );
    const balance: any = userZBalance?.value || 0;
    const approveAmount: any = BigNumber(balance)
      .times(10 ** (STAKE_Z_NETWORK.value?.z_token_decimals || 18))
      .toFixed(0);
    const params = {
      provider,
      contractProvider: provider,
      tokenAddress: STAKE_Z_NETWORK.value?.z_token_address,
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
const handleStake = async () => {
  try {
    isLoading.value = true;
    console.log('🚀 ~ handleStake:', amount.value);
    const provider = getProvider();
    const decimals_amount = BigNumber(Number(amount.value))
      .times(10 ** (STAKE_Z_NETWORK.value?.z_token_decimals ?? 18))
      .toFixed(0);
    const signer = provider.getSigner();
    const params = {
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      contractProvider: provider,
      account: account.value,
      value: decimals_amount, // amount
      signer: signer,
    };
    console.log('🚀 ~ handleStake ~ params:', params);
    const tx = await stakeZ(params);
    console.log('🚀 ~ handleStake ~ rs:', tx);
    const summary = `StakeZ success!`;
    addTransaction({
      id: tx?.hash || tx,
      type: 'tx',
      action: 'stakeZ',
      summary,
    });

    tx &&
      txListener(tx, {
        onTxConfirmed: async (receipt: any) => {
          console.log('🚀 ~ onTxConfirmed: ~ receipt:', receipt);
          await fetchData();
          (window as any).emitter?.emit('reloadStakeZInfo');
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
/**
 * LIFE CYCLES
 */
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="staking-form">
    <BalCard noBorder :square="upToLargeBreakpoint">
      <template #header>
        <h5 class="mb-6 text-3xl font-bold text-black">Z Staking</h5>
      </template>

      <div class="p-4 mb-2 rounded-xl border border-gray-800">
        <div class="flex justify-end items-center mb-1 balance-content">
          <span class="balance-label"
            >Balance:
            <span class="balance-value">
              {{
                fNum2(userZBalance?.toString() || '0', FNumFormats.token)
              }}</span
            >
            Z
          </span>
        </div>
        <div class="relative input-control">
          <input
            v-model="amount"
            type="number"
            placeholder="0"
            class="pr-10 w-full text-xl font-bold bg-white focus:outline-none font-sm"
            @input="delayinputChange"
          />
          <div
            class="flex absolute top-1/2 right-0 gap-2 items-center -translate-y-1/2"
          >
            <img :src="ZIcon" alt="Z Token" class="w-4 h-4" />
            <span class="text-xl font-bold text-gray-800">Z</span>
          </div>
        </div>
        <div v-if="validate.isError" class="validate-amount">
          {{ validate.message }}
        </div>
      </div>

      <div class="flex justify-end items-center mb-4 ratio-content">
        <span>1 Z = {{ rateSZ }} sZ</span>
      </div>

      <div class="flex justify-between items-center mb-2 maturity-content">
        <div class="flex gap-1 items-center">
          <span class="label">Maturity</span>
          <span class="days-label">({{ maturityPeriod?.days }} days)</span>
        </div>
        <span class="value">{{ maturityPeriod?.endDate }}</span>
      </div>

      <div class="flex flex-col mb-2">
        <div class="warning-text">
          <ul>
            <li>
              Redemption prior to maturity reduces the sZ that can be received.
            </li>
            <li>Cannot be redeemed early until 30 days after staking.</li>
          </ul>
        </div>
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
              <span class="ml-1 text-xl font-bold text-black">sZ</span>
            </div>
          </div>
          <hr class="mt-4 border-gray-800" />
        </div>
      </div>
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
            label="Stake"
            :loading="isLoading"
            :disabled="!receiveAmount || Number(amount) > Number(userZBalance)"
            classCustom="pink-white-shadow"
            block
            @click="handleStake"
          />
        </div>
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang='scss'>
.staking-form {
  // Styles for staking form container
  .balance-content {
    color: #000;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    .balance-value {
      color: #12a8ec;
    }
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
  .validate-amount {
    color: #f00;
    font-size: 11px;
    font-weight: 500;
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
    .days-label {
      color: #000;
      font-weight: 400;
      font-size: 12px;
      margin-top: 6px;
    }
  }
  .penalty-content {
    color: #000;
    font-size: 18px;
    font-weight: 600;
    .value {
      color: #f00;
    }
  }
  .warning-text {
    ul {
      list-style-type: disc;
      padding-left: 24px;
      li {
        color: #f00;
        font-size: 11px;
        font-weight: 500;
      }
    }
  }
  .receive-content {
    .label {
      color: #000;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
  }
  .btn-enter-amount {
    background: #555;
  }
}
</style>