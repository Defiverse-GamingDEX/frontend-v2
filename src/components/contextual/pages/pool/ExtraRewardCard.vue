<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import useNetwork from '@/composables/useNetwork';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useConfig from '@/composables/useConfig';
/**
 * TYPES
 */
type Props = {
  pool: Pool;
  gaugeAddress: string;
  streamerAddress: string;
};
/**
 * STATS
 */
// const gaugeAddress = ref('');
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

function openAddRewardsPage() {
  router.push({
    path: `/${networkSlug}/user-gauge-reward/${props.pool.id}`,
    query: {
      returnRoute: 'pool',
      gaugeAddress: props.gaugeAddress,
      streamer: props.streamerAddress,
    },
  });
}
/**
 * CYCLES
 */
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