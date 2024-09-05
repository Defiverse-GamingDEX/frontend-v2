<script setup lang="ts">
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
// Composables
import { useI18n } from 'vue-i18n';

import WrapStEthLink from '@/components/contextual/pages/pool/invest/WrapStEthLink.vue';
import StakePreviewModal from '@/components/contextual/pages/pool/staking/StakePreviewModal.vue';
// Components
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import {
  isDeep,
  isStableLike,
  tokensListExclBpt,
  usePool,
} from '@/composables/usePool';
import { LOW_LIQUIDITY_THRESHOLD } from '@/constants/poolLiquidity';
import {
  bnum,
  indexOfAddress,
  isSameAddress,
  selectByAddress,
} from '@/lib/utils';
import { isRequired } from '@/lib/utils/validations';
import { useTokens } from '@/providers/tokens.provider';
// Types
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import InvestFormTotals from './components/InvestFormTotals.vue';
import InvestPreviewModal from './components/InvestPreviewModal/InvestPreviewModal.vue';
import useInvestMath from './composables/useInvestMath';
import useInvestState from './composables/useInvestState';

/**
 * TYPES
 */
enum NativeAsset {
  wrapped = 'wrapped',
  unwrapped = 'unwrapped',
}

type Props = {
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const showInvestPreview = ref(false);
const showStakeModal = ref(false);
const isPoolWhiteList = ref(false);
const isHasProtectedToken = ref(false);
/**
 * COMPOSABLES
 */
const { t } = useI18n();
const {
  balanceFor,
  nativeAsset,
  wrappedNativeAsset,
  isLiquidityWhitelisted,
  getAntiTraderInfo,
} = useTokens();
const { useNativeAsset } = usePoolTransfers();
const {
  tokenAddresses,
  amounts,
  validInputs,
  highPriceImpactAccepted,
  resetAmounts,
  sor,
} = useInvestState();

const pool = computed(() => props.pool);

const investMath = useInvestMath(
  pool,
  tokenAddresses,
  amounts,
  useNativeAsset,
  sor
);

const {
  hasAmounts,
  highPriceImpact,
  maximizeAmounts,
  optimizeAmounts,
  proportionalAmounts,
  loadingData,
} = investMath;

const {
  isWalletReady,
  startConnectWithInjectedProvider,
  isMismatchedNetwork,
  account,
} = useWeb3();

const { managedPoolWithSwappingHalted, isWethPool, isStableLikePool } =
  usePool(pool);
/**
 * COMPUTED
 */
const hasValidInputs = computed(
  (): boolean =>
    validInputs.value.every(validInput => validInput === true) &&
    hasAcceptedHighPriceImpact.value
);

const hasAcceptedHighPriceImpact = computed((): boolean =>
  highPriceImpact.value ? highPriceImpactAccepted.value : true
);

const forceProportionalInputs = computed(
  (): boolean => managedPoolWithSwappingHalted.value
);

const poolHasLowLiquidity = computed((): boolean =>
  bnum(props.pool.totalLiquidity).lt(LOW_LIQUIDITY_THRESHOLD)
);

const investmentTokens = computed((): string[] => {
  if (isDeep(props.pool)) {
    return props.pool.mainTokens || [];
  }
  return tokensListExclBpt(props.pool);
});

/**
 * METHODS
 */
function handleAmountChange(value: string, index: number): void {
  amounts.value[index] = value;

  nextTick(() => {
    if (forceProportionalInputs.value) {
      amounts.value = [...proportionalAmounts.value];
    }
  });
}

function handleAddressChange(newAddress: string): void {
  useNativeAsset.value = isSameAddress(newAddress, nativeAsset.address);
}

function tokenWeight(address: string): number {
  if (isStableLike(props.pool.poolType)) return 0;
  if (!props.pool?.onchain?.tokens) return 0;

  if (isSameAddress(address, nativeAsset.address)) {
    return (
      selectByAddress(
        props.pool.onchain.tokens,
        wrappedNativeAsset.value.address
      )?.weight || 1
    );
  }

  return selectByAddress(props.pool.onchain.tokens, address)?.weight || 1;
}

function propAmountFor(index: number): string {
  if (isStableLikePool.value) return '0.0';

  return bnum(proportionalAmounts.value[index]).gt(0)
    ? proportionalAmounts.value[index]
    : '0.0';
}

function hint(index: number): string {
  return bnum(propAmountFor(index)).gt(0) ? t('proportionalSuggestion') : '';
}

function tokenOptions(index: number): string[] {
  return isSameAddress(
    props.pool.tokensList[index],
    wrappedNativeAsset.value.address
  )
    ? [wrappedNativeAsset.value.address, nativeAsset.address]
    : [];
}

// If ETH has a higher balance than WETH then use it for the input.
function setNativeAssetByBalance(): void {
  const nativeAssetBalance = balanceFor(nativeAsset.address);
  const wrappedNativeAssetBalance = balanceFor(
    wrappedNativeAsset.value.address
  );

  if (bnum(nativeAssetBalance).gt(wrappedNativeAssetBalance)) {
    setNativeAsset(NativeAsset.unwrapped);
    useNativeAsset.value = true;
  }
}

function setNativeAsset(to: NativeAsset): void {
  const fromAddress =
    to === NativeAsset.wrapped
      ? nativeAsset.address
      : wrappedNativeAsset.value.address;
  const toAddress =
    to === NativeAsset.wrapped
      ? wrappedNativeAsset.value.address
      : nativeAsset.address;

  const indexOfAsset = indexOfAddress(tokenAddresses.value, fromAddress);

  if (indexOfAsset >= 0) {
    tokenAddresses.value[indexOfAsset] = toAddress;
  }
}
async function checkIsLiquidityWhitelisted() {
  try {
    let multiCall = [];
    if (tokenAddresses.value?.length > 0) {
      for (let i = 0; i < tokenAddresses.value?.length; i++) {
        multiCall.push(
          isLiquidityWhitelisted(tokenAddresses.value[i], account?.value)
        );
      }
    }
    let rs = await Promise.allSettled(multiCall);
    let isExistWhiteList = rs?.find(
      item => item?.value?.isLiquidityWhitelisted === true
    );
    if (isExistWhiteList) {
      isPoolWhiteList.value = true;
    } else {
      isPoolWhiteList.value = false;
    }
  } catch (error) {
    console.log(error, 'error=>checkIsLiquidityWhitelisted');
  }
}
async function checkIsHasProtectedToken() {
  try {
    let multiCall = [];
    if (tokenAddresses.value?.length > 0) {
      for (let i = 0; i < tokenAddresses.value?.length; i++) {
        multiCall.push(
          getAntiTraderInfo(tokenAddresses.value[i], account?.value)
        );
      }
    }
    let rs = await Promise.allSettled(multiCall);
    let isExistWhiteList = rs?.find(
      item => item?.value?.isProtectedToken === true
    );
    if (isExistWhiteList) {
      isHasProtectedToken.value = true;
    } else {
      isHasProtectedToken.value = false;
    }
  } catch (error) {
    console.log(error, 'error=>checkIsLiquidityWhitelisted');
  }
}
isHasProtectedToken;
/**
 * CALLBACKS
 */
onBeforeMount(() => {
  resetAmounts();
  tokenAddresses.value = [...investmentTokens.value];
  if (isWethPool.value) setNativeAssetByBalance();

  // check if pool have asset in whiteList
  checkIsLiquidityWhitelisted();
  checkIsHasProtectedToken();
});

/**
 * WATCHERS
 */
watch(useNativeAsset, shouldUseNativeAsset => {
  if (shouldUseNativeAsset) {
    setNativeAsset(NativeAsset.unwrapped);
  } else {
    setNativeAsset(NativeAsset.wrapped);
  }
});
// watch(
//   () => tokenAddresses.value,
//   async () => {
//     checkIsLiquidityWhitelisted();
//   }
// );
</script>

<template>
  <div>
    <BalAlert
      v-if="forceProportionalInputs"
      type="warning"
      :title="$t('investment.warning.managedPoolSwappingHalted.title')"
      :description="
        $t('investment.warning.managedPoolSwappingHalted.description')
      "
      class="mb-4"
    />

    <BalAlert
      v-if="poolHasLowLiquidity"
      type="warning"
      :title="$t('investment.warning.lowLiquidity.title')"
      :description="$t('investment.warning.lowLiquidity.description')"
      class="mb-4"
    />

    <TokenInput
      v-for="(n, i) in tokenAddresses.length"
      :key="i"
      v-model:address="tokenAddresses[i]"
      v-model:amount="amounts[i]"
      v-model:isValid="validInputs[i]"
      :name="tokenAddresses[i]"
      :weight="tokenWeight(tokenAddresses[i])"
      :hintAmount="propAmountFor(i)"
      :hint="hint(i)"
      class="mb-4"
      fixedToken
      :options="tokenOptions(i)"
      @update:amount="handleAmountChange($event, i)"
      @update:address="handleAddressChange($event)"
    />

    <InvestFormTotals
      :math="investMath"
      @maximize="maximizeAmounts"
      @optimize="optimizeAmounts"
    />

    <div
      v-if="highPriceImpact"
      class="p-2 pb-2 mt-4 rounded-lg border dark:border-gray-700"
    >
      <BalCheckbox
        v-model="highPriceImpactAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPriceImpactAccepted"
        size="sm"
        :label="$t('priceImpactAccept', [$t('depositing')])"
      />
    </div>
    <BalAlert
      v-if="isHasProtectedToken"
      class="mt-4 mb-4"
      title="ATF Warning"
      type="error"
    >
      <p class="text-gray-600 dark:text-gray-400">
        This pool has ATF token. Your wallet must be whitelisted to add
        liquidity
      </p>
    </BalAlert>
    <WrapStEthLink :pool="pool" class="mt-4" />

    <div class="mt-4">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        color="gradient"
        block
        @click="startConnectWithInjectedProvider"
      />
      <BalBtn
        v-else
        :label="$t('preview')"
        color="gradient"
        :disabled="
          !isPoolWhiteList ||
          !hasAmounts ||
          !hasValidInputs ||
          isMismatchedNetwork ||
          loadingData
        "
        block
        @click="showInvestPreview = true"
      />
    </div>

    <teleport to="#modal">
      <InvestPreviewModal
        v-if="showInvestPreview"
        :pool="pool"
        :math="investMath"
        :tokenAddresses="tokenAddresses"
        @close="showInvestPreview = false"
        @show-stake-modal="showStakeModal = true"
      />
      <StakePreviewModal
        :pool="pool"
        :isVisible="showStakeModal"
        action="stake"
        @close="showStakeModal = false"
      />
    </teleport>
  </div>
</template>
