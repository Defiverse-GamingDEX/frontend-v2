<script setup lang="ts">
import NetworkSelectInput from './NetworkSelectInput.vue';
import TokenSelectInput from './TokenSelectInput.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { isLessThanOrEqualTo, isPositive } from '@/lib/utils/validations';
import { cloneDeep } from 'lodash';
import { bnum, isSameAddress } from '@/lib/utils';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { Rules } from '@/types';
import { useI18n } from 'vue-i18n';

// TYPES
type InputValue = string | number;

type inputSelect = {
  chainId: number;
  tokenSymbol: string;
  tokenAddress: string;
  balance: number;
  amount: number;
  decimals: number;
  tokensList: Array<any>;
};

// PROPS
type Props = {
  inputSelect?: inputSelect;
  chainsList: Array<any>;
  ignoreWalletBalance?: boolean;
  rules?: Rules;
};
const props = withDefaults(defineProps<Props>(), {
  ignoreWalletBalance: false,
  rules: () => [],
});

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { isWalletReady } = useWeb3();
const { fNum2 } = useNumbers();
/**
 * STATE
 */
const _amount = ref<InputValue>('');
const _address = ref<string>('');
// EMITS
const emit = defineEmits<{
  (e: 'update:inputSelect', inputSelect: inputSelect): void;
}>();

// COMPUTEDS
const hasToken = computed(() => !!_address.value);
const amountBN = computed(() => bnum(_amount.value));
const tokenBalanceBN = computed(() => bnum(props?.inputSelect?.balance));
const hasAmount = computed(() => amountBN.value.gt(0));
const hasBalance = computed(() => tokenBalanceBN.value.gt(0));
const decimalLimit = computed<number>(() => props?.inputSelect?.decimals || 18);
const inputRules = computed(() => {
  if (!hasToken.value || !isWalletReady.value || props.noRules) {
    return [isPositive()];
  }

  const rules = [...props.rules, isPositive()];
  if (!props.ignoreWalletBalance) {
    rules.push(
      isLessThanOrEqualTo(props?.inputSelect?.balance, t('exceedsBalance'))
    );
  }
  return rules;
});
const isMaxed = computed(() => {
  return _amount.value === props?.inputSelect?.balance;
});

const maxPercentage = computed(() => {
  if (!hasBalance.value || !hasAmount.value) return '0';

  return amountBN.value.div(props?.inputSelect?.balance).times(100).toFixed(2);
});

const bufferPercentage = computed(() => {
  return '0';
});
const amountExceedsTokenBalance = computed(() =>
  amountBN.value.gt(props?.inputSelect?.balance)
);

const barColor = computed(() =>
  amountExceedsTokenBalance.value ? 'red' : 'green'
);

/**
 * WATCHERS
 */
watchEffect(() => {
  _amount.value = props?.inputSelect?.amount;
  _address.value = props?.inputSelect?.tokenAddress;
});

// FUNCTIONS
function updateToken(token) {
  let inputSelect = cloneDeep(props?.inputSelect);
  inputSelect.tokenAddress = token.address;
  inputSelect.tokenSymbol = token.symbol;
  inputSelect.balance = token.balance;
  emit('update:inputSelect', inputSelect);
}
function updateNetWork(chainId) {
  let inputSelect = cloneDeep(props?.inputSelect);
  let networkChoose = props?.chainsList?.find(
    item => item.chain_id_decimals === chainId
  );
  if (networkChoose) {
    inputSelect.chainId = networkChoose.chain_id_decimals;
    inputSelect.tokensList = cloneDeep(networkChoose.tokens);
    inputSelect.isOnlyDefiBridge = networkChoose.isOnlyDefiBridge;
  }
  emit('update:inputSelect', inputSelect);
  emit('update:network', inputSelect.chainId);
}
function handleAmountChange(value) {
  let inputSelect = cloneDeep(props?.inputSelect);
  inputSelect.amount = value;
  emit('update:inputSelect', inputSelect);
}
const setMax = () => {
  const maxAmount = props?.inputSelect?.balance;
  handleAmountChange(maxAmount);
};
</script>

<template>
  <div class="input-from-component">
    <div class="input-content">
      <BalTextInput
        :modelValue="_amount"
        name="tokenIn"
        :placeholder="'0.0'"
        type="number-dot"
        :decimalLimit="decimalLimit"
        :rules="inputRules"
        validateOn="input"
        autocomplete="off"
        autocorrect="off"
        step="any"
        spellcheck="false"
        v-bind="$attrs"
        inputAlignRight
        @update:model-value="handleAmountChange($event)"
        @update:is-valid="emit('update:isValid', $event)"
      >
        <template #header>
          <NetworkSelectInput
            :networkList="chainsList"
            :modelValue="inputSelect?.chainId"
            class="mb-2"
            @update:model-value="updateNetWork"
          />
        </template>
        <template #prepend>
          <slot name="tokenSelect">
            <TokenSelectInput
              :tokensList="inputSelect?.tokensList"
              :modelValue="inputSelect?.tokenAddress"
              class="mr-2"
              @update:model-value="updateToken"
            />
          </slot>
        </template>
        <template #footer>
          <div
            v-if="isWalletReady || (hasAmount && hasToken)"
            class="flex flex-col pt-1"
          >
            <div
              class="flex justify-between items-center text-sm leading-none text-gray-600 dark:text-gray-400"
            >
              <div v-if="!isWalletReady" />
              <button v-else class="flex items-center" @click="setMax">
                {{ $t('balance') }}:

                <span class="mx-1">
                  {{ fNum2(inputSelect?.balance, FNumFormats.token) }}
                </span>

                <template v-if="hasBalance">
                  <span
                    v-if="!isMaxed"
                    class="text-blue-600 hover:text-purple-600 focus:text-purple-600 dark:text-blue-400 dark:hover:text-yellow-500 dark:focus:text-yellow-500 transition-colors"
                  >
                    {{ $t('max') }}
                  </span>
                  <span
                    v-else
                    class="text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  >
                    {{ $t('maxed') }}
                  </span>
                </template>
              </button>
            </div>

            <BalProgressBar
              v-if="hasBalance"
              :width="maxPercentage"
              :bufferWidth="bufferPercentage"
              :color="barColor"
              class="mt-2"
            />
          </div>
        </template>
      </BalTextInput>
    </div>
  </div>
</template>

<style scoped lang="scss">
.input-from-component {
  :deep() {
    .input-content {
      .header {
        .token-select-input {
          width: fit-content;
        }
      }
      .input-group {
        align-items: flex-end;
        > .h-10 {
          height: auto;
        }
        .input {
          margin-bottom: 6px;
          font-size: 1.25rem;
          line-height: 1.75rem;
          color: #808080;
        }
      }
    }
  }
}
</style>
