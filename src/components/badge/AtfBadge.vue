<script lang="ts" setup>
import { ATF_LIST } from '@/constants/atfList';
import { computed } from 'vue';
/**
 * TYPES
 */
type Props = {
  address: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const isATF = computed((): boolean => {
  let atf_token = ATF_LIST.find(item => item.address === props.address);
  if (atf_token) {
    return true;
  }
  return false;
});

/**
 * METHODS
 */
</script>

<template>
  <span
    v-if="isATF"
    class="py-0.5 px-2.5 mr-2 ml-1 text-xs font-medium text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900 rounded-full atf-badge"
    >ATF</span
  >
</template>
<style scoped>
.atf-badge {
  //font-size: 12px;
}
</style>