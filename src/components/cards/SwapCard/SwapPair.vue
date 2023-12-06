<script setup lang="ts">
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { UseSwapping } from '@/composables/swap/useSwapping';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import useVeBal from '@/composables/useVeBAL';
import { bnum } from '@/lib/utils';

import SwapPairToggle from './SwapPairToggle.vue';
import SwapAntiTraderWarningModal from '@/components/modals/SwapAntiTraderWarningModal.vue';

import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type Props = {
  tokenInAmount: string;
  tokenInAddress: string;
  tokenOutAmount: string;
  tokenOutAddress: string;
  exactIn: boolean;
  priceImpact?: number;
  effectivePriceMessage?: UseSwapping['effectivePriceMessage'];
  swapLoading?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:tokenInAmount', value: string): void;
  (e: 'update:tokenInAddress', value: string): void;
  (e: 'update:tokenOutAmount', value: string): void;
  (e: 'update:tokenOutAddress', value: string): void;
  (e: 'update:exactIn', value: boolean): void;
  (e: 'amountChange'): void;
  (e: 'update:tokenInTradeInfo', value: object): void;
}>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { getToken, getAntiTraderInfo } = useTokens();
const { veBalTokenInfo } = useVeBal();
const { account } = useWeb3();
/**
 * STATE
 */
const _tokenInAmount = ref<string>('');
const _tokenInAddress = ref<string>('');
const _tokenOutAmount = ref<string>('');
const _tokenOutAddress = ref<string>('');

const isInRate = ref<boolean>(true);

const typingTimeout = ref<any>({});

const modalAntiTraderWarning = ref<boolean>(false);

const tokenInTraderInfo = ref<any>(undefined);
const tokenOutTraderInfo = ref<any>(undefined);
/**
 * COMPUTED
 */
const missingToken = computed(
  () => !_tokenInAddress.value || !_tokenOutAddress.value
);

const missingAmount = computed(
  () => !_tokenInAmount.value || !_tokenOutAmount.value
);

const tokenIn = computed(() => getToken(_tokenInAddress.value));
const tokenOut = computed(() => getToken(_tokenOutAddress.value));

const rateLabel = computed(() => {
  if (missingToken.value || missingAmount.value) return '';

  if (props.effectivePriceMessage)
    return isInRate.value
      ? props.effectivePriceMessage.value.tokenIn
      : props.effectivePriceMessage.value.tokenOut;

  let rate, inSymbol, outSymbol;

  if (isInRate.value) {
    rate = bnum(_tokenOutAmount.value).div(_tokenInAmount.value).toString();
    inSymbol = tokenIn.value.symbol;
    outSymbol = tokenOut.value.symbol;
  } else {
    rate = bnum(_tokenInAmount.value).div(_tokenOutAmount.value).toString();
    inSymbol = tokenOut.value.symbol;
    outSymbol = tokenIn.value.symbol;
  }

  return `1 ${inSymbol} = ${fNum2(rate, FNumFormats.token)} ${outSymbol}`;
});

/**
 * WATCHS
 */
watch(
  () => _tokenInAddress.value,
  async () => {
    tokenInTraderInfo.value = await getAntiTraderInfo(
      _tokenInAddress.value,
      account.value
    );

    tokenInTraderInfo.value = mapDataTraderInfo(
      tokenInTraderInfo.value,
      tokenIn.value
    );
    console.log(tokenInTraderInfo.value, 'tokenInTraderInfo');
    emit('update:tokenInTradeInfo', tokenInTraderInfo.value);
  }
);
watch(
  () => _tokenOutAddress.value,
  async () => {
    tokenOutTraderInfo.value = await getAntiTraderInfo(
      _tokenOutAddress.value,
      account.value
    );

    tokenOutTraderInfo.value = mapDataTraderInfo(
      tokenOutTraderInfo.value,
      tokenOut.value
    );
    console.log(tokenOutTraderInfo.value, 'tokenOutTraderInfo');
  }
);
watch(
  () => account.value,
  async () => {
    tokenInTraderInfo.value = await getAntiTraderInfo(
      _tokenInAddress.value,
      account.value
    );

    tokenInTraderInfo.value = mapDataTraderInfo(
      tokenInTraderInfo.value,
      tokenIn.value
    );
    tokenOutTraderInfo.value = await getAntiTraderInfo(
      _tokenOutAddress.value,
      account.value
    );

    tokenOutTraderInfo.value = mapDataTraderInfo(
      tokenOutTraderInfo.value,
      tokenOut.value
    );
    emit('update:tokenInTradeInfo', tokenInTraderInfo.value);
  }
);
/**
 * METHODS
 */
async function updateTraderInfo() {
  tokenInTraderInfo.value = await getAntiTraderInfo(
    _tokenInAddress.value,
    account.value
  );

  tokenInTraderInfo.value = mapDataTraderInfo(
    tokenInTraderInfo.value,
    tokenIn.value
  );
  console.log(tokenInTraderInfo.value, 'tokenInTraderInfoCCCC');
  checkAmountAntiTrader();
  emit('update:tokenInTradeInfo', tokenInTraderInfo.value);
}
defineExpose({
  updateTraderInfo,
});
function preventUpdatesOnTyping(callback: () => void) {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  typingTimeout.value = setTimeout(() => {
    callback();
  }, 300);
}

function handleInAmountChange(value: string): void {
  emit('update:tokenInAmount', value);
  console.log(value, 'value');
  preventUpdatesOnTyping(() => {
    // not calc if amount not done
    if (value === '0.' || Number(value) === 0) {
      return;
    }
    emit('amountChange');
  });
}

function handleOutAmountChange(value: string): void {
  emit('update:tokenOutAmount', value);
  preventUpdatesOnTyping(() => {
    // not calc if amount not done
    if (value === '0.' || Number(value) === 0) {
      return;
    }
    emit('amountChange');
  });
}

function handleTokenSwitch(): void {
  emit('update:exactIn', !props.exactIn);
  emit('update:tokenInAmount', _tokenOutAmount.value);
  emit('update:tokenInAddress', _tokenOutAddress.value);
  emit('update:tokenOutAmount', _tokenInAmount.value);
  emit('update:tokenOutAddress', _tokenInAddress.value);
  emit('amountChange');
}

async function handleInputTokenChange(newTokenIn: string) {
  if (newTokenIn === _tokenOutAddress.value) {
    handleTokenSwitch();
    return;
  }
  emit('update:tokenInAddress', newTokenIn);
}

async function handleOutputTokenChange(newTokenOut: string) {
  if (newTokenOut === _tokenInAddress.value) {
    handleTokenSwitch();
    return;
  }
  emit('update:tokenOutAddress', newTokenOut);
}
function checkAmountAntiTrader() {
  setTimeout(() => {
    // check to show modal
    if (
      tokenInTraderInfo?.value?.isProtectedToken === true &&
      props.tokenInAmount > tokenInTraderInfo?.value?.sellableAmount
    ) {
      modalAntiTraderWarning.value = true;
    } else {
      modalAntiTraderWarning.value = false;
    }
    emit('modalAntiTraderWarningChange', modalAntiTraderWarning.value);
  }, 1000);
}
function mapDataTraderInfo(tokenTraderInfo, tokenInfo) {
  let rs = {
    ...tokenTraderInfo,
    ...tokenInfo,
  };
  rs.sellableAmount = bnum(tokenTraderInfo.getSellable)
    .div(Math.pow(10, tokenInfo.decimals))
    .toNumber();
  console.log(rs.sellableAmount, 'rs.sellableAmount');
  return rs;
}
function handleModalAntiTraderClose() {
  modalAntiTraderWarning.value = false;
}

/**
 * CALLBACKS
 */
watchEffect(() => {
  _tokenInAmount.value = props.tokenInAmount;
  _tokenInAddress.value = props.tokenInAddress;
  _tokenOutAmount.value = props.tokenOutAmount;
  _tokenOutAddress.value = props.tokenOutAddress;
  checkAmountAntiTrader();
});
onMounted(() => {
  // populates initial tokenOutAmount
  if (props.tokenOutAmount) {
    handleOutAmountChange(props.tokenOutAmount);
  }
});
</script>

<template>
  <div>
    <TokenInput
      :amount="_tokenInAmount"
      :address="_tokenInAddress"
      :tokenInTraderInfo="tokenInTraderInfo"
      name="tokenIn"
      :excludedTokens="[veBalTokenInfo?.address]"
      :ignoreWalletBalance="swapLoading"
      autoFocus
      @update:amount="handleInAmountChange"
      @update:address="handleInputTokenChange"
      @input="emit('update:exactIn', true)"
      @set-max="emit('update:exactIn', true)"
    />

    <div class="flex items-center my-5">
      <SwapPairToggle @toggle="handleTokenSwitch" />
      <div class="mx-2 h-px bg-gray-100 dark:bg-gray-700 grow" />
      <div
        v-if="rateLabel"
        class="flex items-center text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
        @click="isInRate = !isInRate"
        v-html="rateLabel"
      />
    </div>

    <TokenInput
      :amount="_tokenOutAmount"
      :address="_tokenOutAddress"
      name="tokenOut"
      :priceImpact="priceImpact"
      noRules
      noMax
      disableNativeAssetBuffer
      :excludedTokens="[veBalTokenInfo?.address]"
      @update:amount="handleOutAmountChange"
      @update:address="handleOutputTokenChange"
      @input="emit('update:exactIn', false)"
    />
    <teleport to="#modal">
      <SwapAntiTraderWarningModal
        v-if="modalAntiTraderWarning"
        :tokenInTraderInfo="tokenInTraderInfo"
        :tokenOutTraderInfo="tokenOutTraderInfo"
        :tokenInAmount="_tokenInAmount"
        :tokenOutAmount="_tokenOutAmount"
        @close="handleModalAntiTraderClose"
      />
    </teleport>
  </div>
</template>
 