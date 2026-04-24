<script lang="ts">
// Add a default export to make the component importable with default import
export default {
  name: 'StakingForm',
};
</script>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

import BalCard from '@/components/_global/BalCard/BalCard.vue';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
import { useStakeZ } from '@/composables/stakeZ/useStakeZ';
import { STAKE_Z_NETWORKS } from '@/constants/stakeZ';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { debounce } from 'lodash';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
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
} = useStakeZ();
/**
 * METHODS
 */
const setMaxBalance = () => {
  if (userZBalance.value && Number(userZBalance.value) > 0) {
    amount.value = userZBalance.value;

    // Trigger amount change to recalculate receive amount and validation
    const mockEvent = {
      target: {
        value: userZBalance.value.toString(),
      },
    };

    // Call the debounced function to handle all the calculations
    delayinputChange(mockEvent);
  }
};

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
    isApproved.value = false;
    return;
  }

  try {
    // Convert to BigNumber directly from string to preserve precision
    const calculatedAmount = BigNumber(String(amount?.value || 0))
      .times(BigNumber(String(rateSZ?.value || 0)))
      .toNumber();
    receiveAmount.value = calculatedAmount;
    checkValidateAmount();
  } catch (error) {
    console.error('Error calculating receive amount:', error);
    receiveAmount.value = 0;
  }
};

// Debounced allowance check to avoid too many contract calls
const debouncedAllowanceCheck = debounce(async (amountValue: string) => {
  if (account.value && amountValue && Number(amountValue) > 0) {
    await checkAllowanceForAmount(amountValue);
  } else {
    isApproved.value = false;
  }
}, 800);

const delayinputChange = debounce(async event => {
  await handleAmountChange(event);
  // Check allowance after amount calculation
  debouncedAllowanceCheck(event.target.value);
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
    const decimals = STAKE_Z_NETWORK.value?.z_token_decimals || 18;
    const amount = BigNumber(1).times(BigNumber(10).pow(decimals)).toFixed(0);
    const provider = getProvider();
    const rateSZ = await getEstimateSzAmount({
      provider: provider,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      amount: amount,
    });
    return BigNumber(rateSZ).div(BigNumber(10).pow(decimals)).toFixed();
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
    const days = BigNumber(rs).div(86400).toFixed(0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(days));
    maturityPeriod.value = {
      endDate: format(endDate, 'dd MMM yyyy'),
      days: days,
    };
  } catch (error) {
    console.log(error, 'getMaturityPeriod=>error');
  }
};
const checkAllowanceForAmount = async (stakeAmount: number | string) => {
  if (!stakeAmount || Number(stakeAmount) <= 0 || isNaN(Number(stakeAmount))) {
    isApproved.value = false;
    return;
  }

  try {
    isLoading.value = true;
    const provider = getProvider();
    const allowance = await checkTokenAllowance({
      provider: provider,
      tokenAddress: STAKE_Z_NETWORK.value?.z_token_address,
      walletAddress: account.value,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
    });

    console.log(
      '🚀 ~ checkAllowanceForAmount ~ allowance:',
      allowance.toString()
    );
    console.log('🚀 ~ checkAllowanceForAmount ~ stakeAmount:', stakeAmount);

    // Convert stakeAmount to BigNumber safely
    const stakeAmountBN = new BigNumber(stakeAmount.toString());
    const decimals = STAKE_Z_NETWORK.value?.z_token_decimals || 18;
    const requiredAmount = stakeAmountBN.times(new BigNumber(10).pow(decimals));

    console.log(
      '🚀 ~ checkAllowanceForAmount ~ requiredAmount:',
      requiredAmount.toFixed(0)
    );
    console.log('🚀 ~ checkAllowanceForAmount ~ allowance:', allowance);

    // Convert allowance to BigNumber for comparison
    const allowanceBN = new BigNumber(allowance.toString());

    if (allowanceBN.gte(requiredAmount)) {
      isApproved.value = true;
    } else {
      isApproved.value = false;
    }
    isLoading.value = false;
  } catch (error) {
    console.log(error, 'checkAllowanceForAmount=>error');
    isApproved.value = false;
    isLoading.value = false;
  }
};
const fetchData = async () => {
  try {
    userZBalance.value = await getUserZBalance();
    rateSZ.value = await getRateSZ();
    await getMaturityPeriodInfo();

    // Only check allowance if there's an amount entered
    if (amount.value && Number(amount.value) > 0) {
      await checkAllowanceForAmount(String(amount.value));
    } else {
      isApproved.value = false;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
const handleApprove = async () => {
  try {
    isLoading.value = true;
    const provider = getProvider();
    const signer = provider.getSigner();

    if (!amount.value || Number(amount.value) <= 0) {
      addNotification({
        type: 'error',
        title: '',
        message: 'Please enter a valid amount to approve',
      });
      isLoading.value = false;
      return;
    }

    // Approve only the amount user wants to stake
    // Use ethers.utils.parseUnits to preserve precision
    const decimals = STAKE_Z_NETWORK.value?.z_token_decimals || 18;
    const approveAmount = ethers.utils.parseUnits(
      String(amount.value),
      decimals
    );

    console.log('🚀 ~ handleApprove ~ amount:', amount.value);
    console.log(
      '🚀 ~ handleApprove ~ approveAmount (wei):',
      approveAmount.toString()
    );
    console.log(
      '🚀 ~ handleApprove ~ approveAmount hex:',
      approveAmount.toHexString()
    );
    const params = {
      provider,
      contractProvider: provider,
      tokenAddress: STAKE_Z_NETWORK.value?.z_token_address,
      signer,
      approveAmount,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
    };
    const tx = await approveToken(params);
    console.log('🚀 ~ handleApprove ~ tx:', tx);
    txListener(tx, {
      onTxConfirmed: async () => {
        await checkAllowanceForAmount(String(amount.value));
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
    const provider = getProvider();
    const signer = provider.getSigner();

    // Use ethers.utils.parseUnits to preserve precision
    const decimals = STAKE_Z_NETWORK.value?.z_token_decimals ?? 18;
    const decimals_amount = ethers.utils.parseUnits(
      String(amount.value),
      decimals
    );

    console.log('🚀 ~ handleStake ~ amount:', amount.value);
    console.log(
      '🚀 ~ handleStake ~ decimals_amount (wei):',
      decimals_amount.toString()
    );
    const params = {
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      contractProvider: provider,
      account: account.value,
      value: decimals_amount.toString(), // Convert BigNumber to string
      signer,
    };
    console.log('🚀 ~ handleStake ~ params:', params);
    const tx = await stakeZ(params);
    console.log('🚀 ~ handleStake ~ rs:', tx);
    const summary = `Stake HZ success!`;
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
watch(account, () => {
  if (account.value) {
    fetchData();
  }
});
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
        <h5 class="mb-6 text-3xl font-bold text-black">HZ Staking</h5>
      </template>

      <div class="p-4 mb-2 rounded-xl border border-gray-800">
        <div class="flex justify-end items-center mb-1 balance-content">
          <span class="balance-label"
            >Balance:
            <span class="balance-value clickable" @click="setMaxBalance">
              {{
                fNum2(userZBalance?.toString() || '0', FNumFormats.token)
              }}</span
            >
            HZ
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
            <span class="text-xl font-bold text-gray-800">HZ</span>
          </div>
        </div>
        <div v-if="validate.isError" class="validate-amount">
          {{ validate.message }}
        </div>
      </div>

      <div class="flex justify-end items-center mb-4 ratio-content">
        <span>1 HZ = {{ rateSZ }} sHZ</span>
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
              Redemption prior to maturity reduces the sHZ that can be received.
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
              <span class="ml-1 text-xl font-bold text-black">sHZ</span>
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
            :disabled="!amount || Number(amount) <= 0"
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

<style scoped lang="scss">
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

      &.clickable {
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: #0f8bb8;
          text-decoration: underline;
        }
      }
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
