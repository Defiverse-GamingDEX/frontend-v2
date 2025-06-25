<script lang="ts" setup>
import { computed } from 'vue';

// import DarkModeToggle from '@/components/btns/DarkModeToggle.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useSidebar } from '@/composables/useSidebar';
import useWeb3 from '@/services/web3/useWeb3';
import { useRoute } from 'vue-router';
import { PATH_NAME_USE_NAV_SWITCH_NETWORK } from '@/constants/links';

import AppNavAccountBtn from './AppNavAccountBtn.vue';
import AppNavActivityBtn from './AppNavActivityBtn/AppNavActivityBtn.vue';
import AppNavNetworkSelect from './AppNavNetworkSelect.vue';
import AppNavNetworkSelectForSwitch from './AppNavNetworkSelectForSwitch.vue';
import { Goals, trackGoal } from '@/composables/useFathom';

/**
 * COMPOSABLES
 */
// const { isMobile, isDesktop } = useBreakpoints();
const { isMobile } = useBreakpoints();
const { account, connector, startConnectWithInjectedProvider } = useWeb3();
const { setSidebarOpen } = useSidebar();
const route = useRoute();

/**
 * COMPUTED
 */
const isSwitchNetwork = computed(() =>
  PATH_NAME_USE_NAV_SWITCH_NETWORK.includes(route?.name?.toString() || '')
);
const hideNetworkSelect = computed(
  () => connector.value?.id === 'gnosis' || isSwitchNetwork.value
);

/**
 * METHODS
 */
function connectWalletHandler() {
  trackGoal(Goals.ClickNavConnectWallet);
  startConnectWithInjectedProvider();
}
</script>

<template>
  <div class="grid grid-rows-1 grid-flow-col gap-2">
    <!-- <DarkModeToggle v-if="isDesktop" /> -->
    <AppNavActivityBtn v-if="account" />
    <AppNavAccountBtn v-if="account" />
    <BalBtn
      v-else
      color="white"
      :size="isMobile ? 'md' : 'sm'"
      @click="connectWalletHandler"
    >
      <WalletIcon class="mr-2" />
      <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
      <span class="lg:hidden" v-text="$t('connect')" />
    </BalBtn>
    <AppNavNetworkSelect v-if="!hideNetworkSelect" />
    <AppNavNetworkSelectForSwitch v-if="isSwitchNetwork" />
    <BalBtn
      v-if="isMobile"
      color="white"
      flat
      circle
      @click="setSidebarOpen(true)"
    >
      <BalIcon name="menu" size="lg" />
    </BalBtn>
  </div>
</template>
