<script setup lang="ts">
import TokenSelectInput from './TokenSelectInput.vue';
import { cloneDeep } from 'lodash';
type inputSelect = {
  chainId: number;
  tokenSymbol: string;
  tokenAddress: string;
  balance: number;
};

// PROPS
type Props = {
  inputSelect?: inputSelect;
  chainsList: Array<any>;
  tokensList: Array<any>;
};
const props = withDefaults(defineProps<Props>(), {});

// EMITS
const emit = defineEmits<{
  (e: 'update:inputSelect', inputSelect: inputSelect): void;
}>();

// FUNCTIONS
function updateAddress(address) {
  console.log(props?.inputSelect, address, 'props?.inputSelect');
  let inputSelect = cloneDeep(props?.inputSelect);
  inputSelect.tokenAddress = address;
  emit('update:inputSelect', inputSelect);
}
</script>

<template>
  <div class="input-from-component">
    <div class="token-list">
      <TokenSelectInput
        :modelValue="props?.inputSelect?.tokenAddress"
        class="mr-2"
        @update:model-value="updateAddress"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.input-from-component {
}
</style>
