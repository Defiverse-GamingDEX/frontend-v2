<script setup lang="ts">
type inputSelect = {
  chainId: number;
  tokenSymbol: string;
  balance: number;
};

type Props = {
  inputSelect?: inputSelect;
  chainsList: Array<any>;
  tokensList: Array<any>;
};
const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <div class="input-from-component">input from here</div>
</template>

<style scoped lang="scss">
.input-from-component {
}
</style>
