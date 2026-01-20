<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { debounce } from 'lodash';
import BigNumber from 'bignumber.js';

import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import { useTokenLists } from '@/providers/token-lists.provider';
import { useVoteRewardScheduler } from '@/composables/voteRewardScheduler/useVoteRewardScheduler';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import useNotifications from '@/composables/useNotifications';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import ALL_VOTING_GAUGES from '@/data/voting-gauges.json';
import { VotingGauge } from '@/constants/voting-gauges';

/**
 * PROPS & EMITS
 */
interface Props {
  pool?: any;
  gaugeAddress?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pool: undefined,
  gaugeAddress: undefined,
});

const emit = defineEmits(['close', 'success']);

/**
 * COMPOSABLES
 */
const { account, getProvider } = useWeb3();
const { getToken } = useTokens();
const { activeTokenLists } = useTokenLists();
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
const isCheckingAllowance = ref(false);
const balanceError = ref<string>('');

/**
 * COMPUTED
 */
const selectedToken = computed(() => {
  if (!selectedTokenAddress.value) return null;
  return getToken(selectedTokenAddress.value);
});

const poolTokens = computed(() => {
  if (!props.pool || !props.pool.tokens) return [];
  console.log('🚀 ~ VotingRewardsModal poolTokens ~ props.pool:', props.pool);
  console.log(
    '🚀 ~ VotingRewardsModal poolTokens ~ tokenLogoURIs:',
    props.pool.tokenLogoURIs
  );

  // Filter out BPT token and get main tokens
  return props.pool.tokens
    .filter(
      (token: any) =>
        !props.pool.address ||
        token.address?.toLowerCase() !== props.pool.address?.toLowerCase()
    )
    .slice(0, 2); // Get first 2 tokens for the pair
});

// Helper function to get base URL for token assets based on current domain
const getTokenAssetsBaseURL = () => {
  // Use current domain automatically
  return window.location.origin;
};

// Helper function to map token symbols to correct file names
const applyTokenSymbolMapping = (logoURI: string): string => {
  // Map known symbol mismatches to correct file names
  const symbolMappings = {
    'BTC_L.png': 'WBTC_L.png',
    'OAS_L.png': 'WOAS_L.png', // If needed
    'BTC.png': 'WBTC.png',
    'OAS.png': 'WOAS.png', // If needed
  };

  // Extract filename from URI
  const filename = logoURI.split('/').pop() || '';

  // Check if we need to map this filename
  if (symbolMappings[filename]) {
    const mappedURI = logoURI.replace(filename, symbolMappings[filename]);
    console.log(`🔄 ~ Mapped ${filename} → ${symbolMappings[filename]}`);
    return mappedURI;
  }

  return logoURI;
};

// Helper function to get token logo URI
const getTokenLogoURI = (tokenAddress: string) => {
  console.log('🚀 ~ getTokenLogoURI ~ tokenAddress:', tokenAddress);

  // First try from pool's tokenLogoURIs (from GaugesTable)
  if (props.pool?.tokenLogoURIs?.[tokenAddress]) {
    let logoURI = props.pool.tokenLogoURIs[tokenAddress];
    console.log('✅ ~ Using pool tokenLogoURIs:', logoURI);

    // Apply token symbol mapping for known mismatches
    logoURI = applyTokenSymbolMapping(logoURI);

    // Convert relative paths to absolute URLs
    if (logoURI.startsWith('tokens/')) {
      logoURI = `${getTokenAssetsBaseURL()}/${logoURI}`;
      console.log('🔄 ~ Converted to current domain URL:', logoURI);
    }

    return logoURI;
  }

  // Second try: search in voting gauges data by pool ID or gauge address
  if (props.pool?.id || props.gaugeAddress) {
    const votingGauges = ALL_VOTING_GAUGES as VotingGauge[];
    const matchingGauge = votingGauges.find(
      gauge =>
        gauge.pool.id === props.pool?.id || gauge.address === props.gaugeAddress
    );

    if (matchingGauge?.tokenLogoURIs?.[tokenAddress]) {
      let logoURI = matchingGauge.tokenLogoURIs[tokenAddress];
      console.log('✅ ~ Using voting gauges tokenLogoURIs:', logoURI);

      // Apply token symbol mapping for known mismatches
      logoURI = applyTokenSymbolMapping(logoURI);

      // Convert relative paths to absolute URLs
      if (logoURI.startsWith('tokens/')) {
        logoURI = `${getTokenAssetsBaseURL()}/${logoURI}`;
        console.log('🔄 ~ Converted to current domain URL:', logoURI);
      }

      return logoURI;
    }
  }

  // Third try: tokens provider
  const token = getToken(tokenAddress);
  if (token?.logoURI) {
    console.log('✅ ~ Using tokens provider logoURI:', token.logoURI);
    return token.logoURI;
  }

  // Final fallback - generate from token address
  const fallbackURI = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`;
  console.log('⚠️ ~ Using fallback URI:', fallbackURI);
  return fallbackURI;
};

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

// Get token list origin for owner filtering
const tokenListOrigin = computed(() => {
  const tokenListArray = Object.entries(activeTokenLists.value) || [];
  return tokenListArray.length > 0 &&
    tokenListArray[0] &&
    tokenListArray[0].length >= 2
    ? tokenListArray[0][1].tokens
    : [];
});

// Custom excluded tokens for voting rewards - exclude OAS and non-gamingdex tokens
const customExcludedTokens = computed(() => {
  const excludedAddresses: string[] = [];

  // Get all tokens from token list origin
  const allTokens = tokenListOrigin.value || [];

  allTokens.forEach(token => {
    // Exclude OAS tokens (native token)
    if (token.symbol === 'OAS' || token.name === 'OASYS') {
      excludedAddresses.push(token.address);
      return;
    }

    // Exclude tokens that don't have owner='gamingdex'
    if (token.owner !== 'gamingdex') {
      excludedAddresses.push(token.address);
    }
  });

  // Also exclude native asset addresses
  excludedAddresses.push('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
  excludedAddresses.push('0x0000000000000000000000000000000000000000');

  return excludedAddresses;
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
    isCheckingAllowance.value = true;
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
  } finally {
    isCheckingAllowance.value = false;
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

  if (!props.gaugeAddress) {
    addNotification({
      type: 'error',
      title: 'Missing Gauge Address',
      message: 'Gauge address is required for voting rewards',
    });
    return;
  }

  try {
    isLoading.value = true;
    const provider = getProvider();
    const signer = provider.getSigner();
    console.log('depositToken params:', {
      gaugeAddress: props.gaugeAddress,
      tokenAddress: selectedToken.value.address,
      amount: amount.value,
      period: period.value,
      decimals: selectedToken.value.decimals,
      account: account.value,
    });

    const tx = await depositToken(
      props.gaugeAddress,
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
        // Check allowance for new token if amount is already entered
        if (amount.value && Number(amount.value) > 0) {
          checkAllowanceForAmount(amount.value);
        }
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
        <!-- Pool Information -->
        <div
          v-if="props.pool && poolTokens.length > 0"
          class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div class="flex justify-center items-center space-x-2">
            <div class="flex items-center space-x-1">
              <BalAsset
                v-for="token in poolTokens"
                :key="token.address"
                :address="token.address"
                :iconURI="getTokenLogoURI(token.address)"
                :size="24"
                class="relative"
                :class="{ '-ml-2': poolTokens.indexOf(token) > 0 }"
              />
            </div>
            <span class="font-semibold text-gray-800 dark:text-gray-200">
              {{
                poolTokens
                  .map(token => getToken(token.address)?.symbol || token.symbol)
                  .join(' / ')
              }}
            </span>
          </div>
          <div class="mt-1 text-xs text-center text-gray-500">
            Pool: {{ props.pool.name || 'Weighted Pool' }}
          </div>
        </div>

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
            :excludedTokens="customExcludedTokens"
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
            :disabled="!isFormValid || isCheckingAllowance"
            block
            @click="handleApprove"
          >
            <span v-if="isCheckingAllowance">Checking Allowance...</span>
            <span v-else>Approve {{ selectedToken.symbol }}</span>
          </BalBtn>

          <BalBtn
            v-else
            color="gradient"
            :loading="isLoading"
            :disabled="
              !isFormValid ||
              (!isApproved && !isNativeToken) ||
              isCheckingAllowance
            "
            block
            @click="handleSubmit"
          >
            <span v-if="!selectedToken">Select Token</span>
            <span v-else-if="!amount || Number(amount) <= 0">Enter Amount</span>
            <span v-else-if="isCheckingAllowance">Checking Allowance...</span>
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
