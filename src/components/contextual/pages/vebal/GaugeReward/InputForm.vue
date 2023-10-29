<script setup lang="ts">
import TokenSelectInput from '@/components/contextual/pages/bridge/BridgeCard/TokenSelectInput.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { isLessThanOrEqualTo, isPositive } from '@/lib/utils/validations';
import { cloneDeep } from 'lodash';
import { bnum, isSameAddress } from '@/lib/utils';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { Rules } from '@/types';
import { useI18n } from 'vue-i18n';
import useBridgeWeb3 from '@/services/bridge/useBridgeWeb3';
import { useBridge } from '@/composables/bridge/useBridge';
import { GAUGE_REWARD_TOKENS } from '@/constants/gaugeReward/reward-tokens';
// TYPES
type InputValue = string | number;

type inputForm = {
  tokenSymbol: string;
  tokenAddress: string;
  balance: number;
  amount: number;
  decimals: number;
  periods: number; // weeks
};

// PROPS
type Props = {
  inputSelect: inputForm;
  index: number;
  input_list: array;
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
const { getChain } = useBridge();
/**
 * STATE
 */
const _amount = ref<InputValue>('');
const _address = ref<string>('');
const _periods = ref<number>(0);
const _token_list = ref<array>(GAUGE_REWARD_TOKENS);
// EMITS
const emit = defineEmits<{
  (e: 'update:inputSelect', { inputSelect: inputForm, index: number }): void;
  (e: 'update:delete', index: number): void;
}>();

// COMPUTEDS
const { connectToAppNetwork } = useBridgeWeb3();
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
  _periods.value = props?.inputSelect?.periods;
  console.log(_token_list.value, '_token_list.valuebefore');
  _token_list.value = getTokenList(props.input_list);
  console.log(_token_list.value, '_token_list.valueAfter');
});

// FUNCTIONS
function getTokenList(listSelected) {
  let rs = cloneDeep(GAUGE_REWARD_TOKENS);
  for (let i = rs.length - 1; i >= 0; i--) {
    const token = rs[i];
    const tokenSelected = listSelected.find(
      item =>
        item.tokenAddress?.toLowerCase() === token.address.toLowerCase() &&
        item.tokenAddress?.toLowerCase() !==
          props?.inputSelect?.tokenAddress?.toLowerCase()
    );
    if (tokenSelected) {
      rs.splice(i, 1);
    }
  }
  return rs;
}
function updateToken(token) {
  let inputSelect = cloneDeep(props?.inputSelect);
  inputSelect.tokenAddress = token.address;
  inputSelect.tokenSymbol = token.symbol;
  inputSelect.balance = token.balance;
  inputSelect.decimals = token.decimals;
  emit('update:inputSelect', { inputSelect: inputSelect, index: props.index });
}

function handleAmountChange(value) {
  let inputSelect = cloneDeep(props?.inputSelect);
  inputSelect.amount = value;
  console.log('handleAmountChange', inputSelect.amount);
  emit('update:inputSelect', { inputSelect: inputSelect, index: props.index });
}
function handlePeriodsChange(value) {
  let inputSelect = cloneDeep(props?.inputSelect);
  inputSelect.periods = value;
  console.log('handlePeriodsChange', inputSelect.periods);
  emit('update:inputSelect', { inputSelect: inputSelect, index: props.index });
}
function deleteInput(index) {
  console.log(index, 'deleteInput');
  emit('update:delete', index);
}
const setMax = () => {
  const maxAmount = props?.inputSelect?.balance;
  handleAmountChange(maxAmount);
};
</script>

<template>
  <div class="input-form-component">
    <div class="input-content">
      <div class="input-title">
        {{ index + 2 }} Reward token
        <span
          class="hover:text-red-500 dark:hover:text-red-500 delete-icon ease-color text-secondary"
          @click.stop.prevent="deleteInput(index)"
        >
          <BalIcon name="trash-2" size="md" />
        </span>
      </div>
      <BalTextInput
        :modelValue="_amount"
        :name="`token${index}`"
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
      >
        <template #prepend>
          <slot name="tokenSelect">
            <TokenSelectInput
              :tokensList="_token_list"
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
    <div class="mt-4 input-content period">
      <div class="input-title">Peroid</div>
      <BalTextInput
        :modelValue="_periods"
        :name="`periods${index}`"
        :placeholder="'0.0'"
        type="number-dot"
        :decimalLimit="decimalLimit"
        autocomplete="off"
        autocorrect="off"
        step="any"
        spellcheck="false"
        v-bind="$attrs"
        inputAlignRight
        @update:model-value="handlePeriodsChange($event)"
      >
        <template #append> Weeks </template>
      </BalTextInput>
    </div>
  </div>
</template>

<style scoped lang="scss">
.input-form-component {
  :deep() {
    .input-content {
      &.period {
        .input-group {
          padding: 0px;
          > input {
            margin: 0px;
            margin-right: 4px;
          }
        }
      }
      .input-title {
        font-size: 18px;
        font-weight: bold;
        line-height: 22px;
        margin-bottom: 2px;
        display: flex;
        .delete-icon {
          margin-left: auto;
          cursor: pointer;
        }
      }
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
