<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import useBreakpoints from '@/composables/useBreakpoints';
import useNotifications from '@/composables/useNotifications';
import { buildNetworkIconURL } from '@/lib/utils/urls';
import i18n from '@/plugins/i18n';
import configs from '@/lib/config';
import useWeb3 from '@/services/web3/useWeb3';

import networksSupport from '@/constants/networksToSelect';

export interface NetworkOption {
  chainId: string;
  name: string;
}

// COMPOSABLES
const { upToLargeBreakpoint } = useBreakpoints();

const { chainId, account, switchNetwork } = useWeb3();
const route = useRoute();
const { addNotification } = useNotifications();

// COMPUTED
const allNetworks = computed(() => {
  if (route.name == 'transfer-nft')
    return networksSupport.networksFortransferNft;
  if (route.name == 'transfer-token')
    return networksSupport.networksFortransferToken;
  return [];
});

const activeNetwork = computed((): NetworkOption | undefined =>
  allNetworks.value.find(network => {
    return isActive(network);
  })
);

// METHODS
function onSwitchNetwork(network: NetworkOption) {
  try {
    if (configs[network.chainId]) {
      return switchNetwork(configs[network.chainId]);
    }
    throw i18n.global.t('transfer.errorMissingNetworkConfig');
  } catch (error: any) {
    addNotification({
      type: 'error',
      title: '',
      message: error?.message || error,
    });
  }
}

function isActive(network: NetworkOption): boolean {
  return Number(chainId.value) === Number(network.chainId);
}
</script>

<template>
  <BalPopover v-if="account" noPad>
    <template #activator>
      <BalBtn color="white" :size="upToLargeBreakpoint ? 'md' : 'sm'">
        <img
          v-if="activeNetwork?.chainId"
          :src="buildNetworkIconURL(activeNetwork.chainId)"
          :alt="activeNetwork?.name || 'Unknown'"
          class="w-6 h-6 rounded-full"
        />
        <span class="ml-2 lh-20">
          {{ activeNetwork?.name || 'Unsupported network' }}
        </span>
        <BalIcon name="chevron-down" size="sm" class="ml-2" />
      </BalBtn>
    </template>
    <div class="flex overflow-hidden flex-col w-60 rounded-lg">
      <div
        class="py-2 px-3 text-sm font-medium text-gray-500 whitespace-nowrap bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-900"
      >
        {{ $t('networkSelection') }}:
      </div>
      <button
        v-for="network in allNetworks"
        :key="network.chainId"
        class="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
        @click="onSwitchNetwork(network)"
      >
        <div class="flex items-center">
          <img
            :src="buildNetworkIconURL(network.chainId)"
            :alt="network.name"
            class="mr-2 w-6 h-6 rounded-full"
          />
          <span class="ml-1 font-medium">
            {{ network.name }}
          </span>
        </div>
        <BalIcon
          v-if="isActive(network)"
          name="check"
          class="text-blue-500 dark:text-blue-400"
        />
      </button>
    </div>
  </BalPopover>
</template>
<style scoped lang="scss">
.lh-20 {
  @media (max-width: 767px) {
    display: none;
  }
}
</style>

