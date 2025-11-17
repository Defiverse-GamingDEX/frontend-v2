<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { debounce } from 'lodash';
import BigNumber from 'bignumber.js';

import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import { useVoteRewardScheduler } from '@/composables/voteRewardScheduler/useVoteRewardScheduler';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import useNotifications from '@/composables/useNotifications';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';

/**
 * PROPS & EMITS
 */
const emit = defineEmits(['close', 'success']);

/**
 * COMPOSABLES
 */
const { account, getProvider } = useWeb3();
const { getToken } = useTokens();
const { checkTokenAllowance, approveToken, depositToken } =
  useVoteRewardScheduler();
const { addNotification } = useNotifications();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();

/**
 * STATE
 */
const selectedTokenAddress = ref<string>('');
const amount = ref<string>('');
const period = ref<number>(1);
const isApproved = ref(false);
const isLoading = ref(false);
const balanceError = ref<string>('');

/**
 * COMPUTED
 */
const selectedToken = computed(() => {
  if (!selectedTokenAddress.value) return null;
  return getToken(selectedTokenAddress.value);
});

const isNativeToken = computed(() => {
  // Check if selected token is native token (OAS)
  return (
    selectedToken.value &&
    (selectedToken.value.address ===
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ||
      selectedToken.value.address ===
        '0x0000000000000000000000000000000000000000' ||
      selectedToken.value.symbol === 'OAS')
  );
});

const isFormValid = computed(() => {
  return (
    selectedTokenAddress.value &&
    amount.value &&
    Number(amount.value) > 0 &&
    period.value >= 1 &&
    period.value <= 52 &&
    !balanceError.value
  );
});

/**
 * METHODS
 */
function validateAmount() {
  balanceError.value = '';

  if (!selectedToken.value || !amount.value) {
    return;
  }

  if (Number(amount.value) <= 0) {
    balanceError.value = 'Amount must be greater than 0';
    return;
  }

  // TokenInput will handle balance validation internally
}

async function checkAllowanceForAmount(amountValue: string) {
  if (!selectedToken.value || !amountValue || Number(amountValue) <= 0) {
    isApproved.value = false;
    return;
  }

  // Native token (OAS) doesn't need approval
  if (isNativeToken.value) {
    isApproved.value = true;
    return;
  }

  try {
    const provider = getProvider();
    const allowance = await checkTokenAllowance(
      selectedToken.value.address,
      provider,
      account.value
    );

    const requiredAmount = BigNumber(amountValue).times(
      BigNumber(10).pow(selectedToken.value.decimals)
    );

    const allowanceBN = BigNumber(allowance.toString());

    isApproved.value = allowanceBN.gte(requiredAmount);
  } catch (error) {
    console.error('Error checking allowance:', error);
    isApproved.value = false;
  }
}

const debouncedAllowanceCheck = debounce(async (amountValue: string) => {
  if (account.value && amountValue && Number(amountValue) > 0) {
    await checkAllowanceForAmount(amountValue);
  } else {
    isApproved.value = false;
  }
}, 800);

const handleAmountChange = debounce(async () => {
  validateAmount();
  if (amount.value && Number(amount.value) > 0 && !balanceError.value) {
    debouncedAllowanceCheck(amount.value);
  } else {
    isApproved.value = false;
  }
}, 500);

async function handleApprove() {
  if (!selectedToken.value || !amount.value) return;

  try {
    isLoading.value = true;
    const provider = getProvider();
    const signer = provider.getSigner();

    const tx = await approveToken(
      selectedToken.value.address,
      provider,
      account.value,
      signer,
      provider.network?.chainId || 1
    );

    txListener(tx, {
      onTxConfirmed: async () => {
        await checkAllowanceForAmount(amount.value);
        isLoading.value = false;
        addNotification({
          type: 'success',
          title: 'Approval Successful',
          message: `${selectedToken.value.symbol} approved successfully`,
        });
      },
      onTxFailed: () => {
        isLoading.value = false;
      },
    });
  } catch (error: any) {
    isLoading.value = false;
    console.error('Approve error:', error);
    addNotification({
      type: 'error',
      title: 'Approval Failed',
      message: error?.message || 'Failed to approve token',
    });
  }
}

async function handleSubmit() {
  if (!isFormValid.value || !selectedToken.value) return;

  try {
    isLoading.value = true;
    const provider = getProvider();
    const signer = provider.getSigner();
    console.log(
      selectedToken.value.address,
      amount.value,
      period.value,
      selectedToken.value.decimals,
      account.value,
      signer,
      'depositData'
    );
    console.log(provider);
    const tx = await depositToken(
      selectedToken.value.address,
      amount.value,
      period.value,
      selectedToken.value.decimals,
      account.value,
      signer,
      provider
    );

    const summary = `Add ${amount.value} ${selectedToken.value.symbol} voting reward for ${period.value} weeks`;
    addTransaction({
      id: tx?.hash || tx,
      type: 'tx',
      action: 'invest',
      summary,
    });

    txListener(tx, {
      onTxConfirmed: async () => {
        isLoading.value = false;
        addNotification({
          type: 'success',
          title: 'Voting Reward Added',
          message: summary,
        });
        emit('success');
        emit('close');
      },
      onTxFailed: () => {
        isLoading.value = false;
      },
    });
  } catch (error: any) {
    isLoading.value = false;
    console.error('Submit error:', error);
    addNotification({
      type: 'error',
      title: 'Transaction Failed',
      message: error?.message || 'Failed to add voting reward',
    });
  }
}

function handleClose() {
  emit('close');
}

/**
 * WATCHERS
 */
watch(
  () => selectedTokenAddress.value,
  () => {
    if (selectedToken.value) {
      // Reset form state when token changes
      balanceError.value = '';
      // For native token, set approved immediately
      if (isNativeToken.value) {
        isApproved.value = true;
      } else {
        isApproved.value = false;
      }
    }
  }
);

watch(() => amount.value, handleAmountChange);
</script>

<template>
  <teleport to="#modal">
    <BalModal :show="true" @close="handleClose">
      <template #header>
        <div class="flex justify-between items-center w-full">
          <h4 class="font-bold">Voting Rewards</h4>
          <BalBtn color="gray" size="xs" flat circle @click="handleClose">
            <BalIcon name="x" size="sm" />
          </BalBtn>
        </div>
      </template>

      <div class="p-4 space-y-4">
        <!-- Token Selection & Amount Input Combined -->
        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Token & Amount
          </label>
          <TokenInput
            v-model:amount="amount"
            v-model:address="selectedTokenAddress"
            name="token"
            :rules="[]"
            :excludedTokens="[]"
            placeholder="0.0"
            @amount-change="handleAmountChange"
          />

          <!-- Balance validation error -->
          <div v-if="balanceError" class="text-xs text-red-500">
            {{ balanceError }}
          </div>
        </div>

        <!-- Period Input -->
        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Period (weeks)
          </label>
          <BalTextInput
            v-model="period"
            type="number"
            :min="1"
            :max="52"
            placeholder="Enter period (1-52 weeks)"
          />
          <div class="text-xs text-gray-500">
            Minimum: 1 week, Maximum: 52 weeks
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 space-y-2">
          <BalBtn
            v-if="
              !isApproved &&
              selectedToken &&
              amount &&
              Number(amount) > 0 &&
              !isNativeToken
            "
            color="gradient"
            :loading="isLoading"
            :disabled="!isFormValid"
            block
            @click="handleApprove"
          >
            Approve {{ selectedToken.symbol }}
          </BalBtn>

          <BalBtn
            v-else
            color="gradient"
            :loading="isLoading"
            :disabled="!isFormValid || (!isApproved && !isNativeToken)"
            block
            @click="handleSubmit"
          >
            <span v-if="!selectedToken">Select Token</span>
            <span v-else-if="!amount || Number(amount) <= 0">Enter Amount</span>
            <span v-else-if="!isApproved && !isNativeToken">Approve First</span>
            <span v-else>Add Voting Reward</span>
          </BalBtn>
        </div>
      </div>
    </BalModal>
  </teleport>
</template>

<style scoped>
.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
