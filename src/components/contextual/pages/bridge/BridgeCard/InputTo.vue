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
  disabled?: boolean;
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
    inputSelect.tokenAddress = networkChoose.tokens[0].address; // TODO
    //inputSelect.isOnlyDefiBridge = networkChoose.isOnlyDefiBridge;
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
      :disabled="disabled"
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
