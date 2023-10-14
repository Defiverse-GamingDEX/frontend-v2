<script setup lang="ts">
import { cloneDeep } from 'lodash';
import NetworkSelectInput from './NetworkSelectInput.vue';
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
  chainsList: Array<any>;
};

// PROPS
type Props = {
  inputSelect?: inputSelect;
};
const props = withDefaults(defineProps<Props>(), {});

// EMITS
const emit = defineEmits<{
  (e: 'update:inputSelect', inputSelect: inputSelect): void;
}>();

// COMPUTEDS

const decimalLimit = computed<number>(() => props?.inputSelect?.decimals || 18);

/**
 * STATE
 */
const _amount = ref<InputValue>('');
const _address = ref<string>('');

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
      class="mb-2"
      @update:model-value="updateNetWork"
    />
    <div class="receive-amount">
      <BalTextInput
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
        @update:is-valid="emit('update:isValid', $event)"
      >
        <template #prepend>
          <slot name="tokenSelect"> Receive </slot>
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
      > .h-10 {
        height: auto;
      }
      .input {
        font-size: 27px;
        line-height: 32px;
        font-weight: bold;
        color: #808080;
      }
    }
  }
  .receive-amount {
    margin-top: 10px;
  }
}
</style>
