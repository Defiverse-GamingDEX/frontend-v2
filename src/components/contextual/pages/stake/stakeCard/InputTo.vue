<script setup lang="ts">
import NetworkSelectInput from './NetworkSelectInput.vue';
import TokenSelectInput from './TokenSelectInput.vue';
import useStake from '@/composables/stake/useStake';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { isLessThanOrEqualTo, isPositive } from '@/lib/utils/validations';
import useStakeWeb3 from '@/services/stake/useStakeWeb3';
import useWeb3 from '@/services/web3/useWeb3';
import { Rules } from '@/types';
import { cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';

// TYPES
type InputValue = string | number;

type InputSelect = {
  chainId: number;
  tokenSymbol: string;
  tokenAddress: string;
  balance: number;
  amount: number;
  decimals: number;
  tokensList: Array<any>;
  chainsList: Array<any>;
};

// PROPS
type Props = {
  inputSelect?: InputSelect;
  disabled?: boolean;
  ignoreWalletBalance?: boolean;
  rules?: Rules;
};
const props = withDefaults(defineProps<Props>(), {
  ignoreWalletBalance: false,
  rules: () => [],
});

// EMITS
const emit = defineEmits<{
  (e: 'update:inputSelect', inputSelect: InputSelect): void;
}>();

// COMPUTEDS
const { t } = useI18n();
const { isWalletReady } = useWeb3();
const { fNum2 } = useNumbers();

/**
 * STATE
 */
const _amount = ref<InputValue>('');
const _address = ref<string>('');
const amountBN = computed(() => bnum(_amount.value));
const tokenBalanceBN = computed(() => bnum(props?.inputSelect?.balance));

const decimalLimit = computed<number>(() => props?.inputSelect?.decimals || 18);




/**
 * WATCHERS
 */
watchEffect(() => {
  _amount.value = props?.inputSelect?.amount;
  _address.value = props?.inputSelect?.tokenAddress;
});

// FUNCTIONS

function updateNetWork(chainId) {
  let inputSelect = cloneDeep(props?.inputSelect);
  let networkChoose = props?.inputSelect?.chainsList?.find(
    item => item.chain_id_decimals === chainId
  );
  if (networkChoose) {
    inputSelect.chainId = networkChoose.chain_id_decimals;
    inputSelect.tokensList = cloneDeep(networkChoose.tokens);
    inputSelect.isOnlyDefiBridge = networkChoose.isOnlyDefiBridge;
  }
  emit('update:inputSelect', inputSelect);
}

function handleAmountChange(value) {
  let inputSelect = cloneDeep(props?.inputSelect);
  inputSelect.amount = value;
  emit('update:inputSelect', inputSelect);
}
</script>

<template>
  <div class="input-to-component">
    <NetworkSelectInput
      :networkList="inputSelect.chainsList"
      :modelValue="inputSelect?.chainId"
      :disabled="disabled || inputSelect.chainsList?.length <= 1"
      class="mb-2"
      @update:model-value="updateNetWork"
    />
    <div class="receive-amount">
      <BalTextInput
        :disabled="true"
        :modelValue="_amount"
        name="tokenIn"
        :placeholder="'0.0'"
        type="number-dot"
        :decimalLimit="decimalLimit"
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
              :tokensList="inputSelect?.tokensList"
              :modelValue="inputSelect?.tokenAddress"
              :disabled="disabled || inputSelect?.tokensList?.length <= 1"
              class="mr-2"
              
            />
          </slot>
        </template>
         <template #footer>
          <div
            v-if="isWalletReady"
            class="flex flex-col pt-1"
          >
            <div
              class="flex justify-between items-center text-sm leading-none text-gray-600 dark:text-gray-400"
            >
              <div v-if="!isWalletReady" />
              <button v-else class="flex items-center">
                {{ $t('balance') }}:

                <span class="mx-1">
                  {{ fNum2(inputSelect?.balance, FNumFormats.token) }}
                </span>

               
              </button>
            </div>

          
          </div>
        </template>
      </BalTextInput>
    </div>
  </div>
</template>

<style scoped lang="scss">
.input-to-component {
  :deep() {
    .token-select-input {
      width: fit-content;
    }

    .input-group {
      align-items: center;
      padding: 0px;
      > .h-10 {
        height: auto;
      }
      .input {
        font-size: 1.25rem;
        line-height: 1.75rem;
        color: #808080;
      }
    }
  }
  .receive-amount {
    margin-top: 10px;
  }
}
</style>
