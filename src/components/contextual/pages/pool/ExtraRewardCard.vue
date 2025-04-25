<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import useNetwork from '@/composables/useNetwork';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import gaugeApi from '@/composables/gaugeReward/gauge.api';
import useConfig from '@/composables/useConfig';
/**
 * TYPES
 */
type Props = {
  pool: Pool;
};
/**
 * STATS
 */
const gaugeAddress = ref('');
/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { isWalletReady, startConnectWithInjectedProvider } = useWeb3();
const { networkSlug } = useNetwork();
const router = useRouter();
const { networkConfig } = useConfig();

/**
 * METHODS
 */
async function getGaugeAddress() {
  try {
    const response = await gaugeApi.getGaugeAddress({
      poolId: props.pool.id,
      chain_id: networkConfig.chainId,
    });
    console.log('🚀 ~ getGaugeAddress ~ response:', response);
    gaugeAddress.value = response.gauge_address;
  } catch (error) {
    gaugeAddress.value = '0x19Dcc71E689eC9bfBb34028F465b7848e5298ee7';
    console.error(error);
  }
}
function openAddRewardsPage() {
  router.push({
    path: `/${networkSlug}/user-gauge-reward/${props.pool.id}`,
    query: { returnRoute: 'pool', gaugeAddress: props.pool.address },
  });
}
/**
 * CYCLES
 */
onMounted(() => {
  getGaugeAddress();
});
</script>

<template>
  <BalCard v-if="gaugeAddress" shadow="2xl" noPad class="rounded-xl">
    <template #header>
      <div class="card-header">
        <h5>{{ $t('Extra Rewards') }}</h5>
      </div>
    </template>
    <div class="py-2 px-4">
      <BalBtn
        v-if="isWalletReady"
        color="gradient"
        block
        @click.prevent="openAddRewardsPage"
      >
        {{ $t('Add Rewards') }}
      </BalBtn>
      <BalBtn
        v-else
        :label="$t('connectWallet')"
        color="gradient"
        block
        @click="startConnectWithInjectedProvider"
      />
    </div>
  </BalCard>
</template>

<style scoped>
.card-header {
  @apply p-4 w-full flex items-center justify-between;
  @apply border-b dark:border-gray-700;
}
</style> 