<script lang="ts" setup>
import { useTokens } from '@/providers/tokens.provider';
import useWeb3 from '@/services/web3/useWeb3';
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
const isATF = ref(false);
/**
 * COMPOSABLES
 */
const { getAntiTraderInfo } = useTokens();
const { account } = useWeb3();
watch(
  () => props.address,
  async () => {
    checkIsAFT();
  }
);
/**
 * METHODS
 */
async function checkIsAFT() {
  try {
    let rs = await getAntiTraderInfo(props?.address, account?.value);
    isATF.value = rs.isProtectedToken;
  } catch (error) {
    console.log(error, 'error=>checkIsAFT');
  }
}
onBeforeMount(() => {
  checkIsAFT();
});
</script>

<template>
  <span
    v-if="isATF === true"
    class="py-0.5 px-2.5 mr-0.5 ml-1 text-xs font-medium text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900 rounded-full atf-badge"
    >ATF</span
  >
</template>
<style scoped>
.atf-badge {
  //font-size: 12px;
}
</style>