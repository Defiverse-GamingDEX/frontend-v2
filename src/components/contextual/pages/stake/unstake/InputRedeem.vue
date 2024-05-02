<script setup lang="ts">
import { cloneDeep } from 'lodash';
import NetworkSelectInput from '../StakeCard/NetworkSelectInput.vue';
// TYPES
type InputValue = string | number;

type inputSelect = {
  chainId: number;
  txId: string;
};

// PROPS
type Props = {
  chainsList: Array<any>;
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
const _txId = ref<string>('');

/**
 * WATCHERS
 */
watchEffect(() => {
  _txId.value = props?.inputSelect?.txId;
});

// FUNCTIONS

function updateNetWork(chainId) {
  let inputSelect = cloneDeep(props?.inputSelect);

  inputSelect.chainId = chainId;

  emit('update:inputSelect', inputSelect);
}

function handleTxChange(txId) {
  let inputSelect = cloneDeep(props?.inputSelect);
  inputSelect.txId = txId;
  emit('update:inputSelect', inputSelect);
}
</script>

<template>
  <div class="input-redeem-component">
    <NetworkSelectInput
      :networkList="chainsList"
      :modelValue="inputSelect?.chainId"
      class="mb-3"
      @update:model-value="updateNetWork"
    />
    <div class="tx-id">
      <BalTextInput
        :modelValue="inputSelect?.txId"
        name="txId"
        placeholder="Source Tx (paste here)"
        type="text"
        validateOn="input"
        autocomplete="off"
        autocorrect="off"
        step="any"
        spellcheck="false"
        v-bind="$attrs"
        inputAlignRight
        @update:model-value="handleTxChange($event)"
      >
      </BalTextInput>
    </div>
  </div>
</template>

<style scoped lang="scss">
.input-redeem-component {
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
        font-size: 14px;
        line-height: 17px;
        font-weight: bold;
        color: #808080;
        opacity: 0.8;
        text-align: left;
      }
    }
  }
  .receive-amount {
    margin-top: 10px;
  }
}
</style>
