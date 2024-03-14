<script lang="ts">
import Notifications from '@/components/notifications/Notifications.vue';
import ThirdPartyServicesModal from '@/components/web3/ThirdPartyServicesModal.vue';
import WalletSelectModal from '@/components/web3/WalletSelectModal.vue';
import useWeb3Watchers from '@/composables/watchers/useWeb3Watchers';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';
import * as Layouts from '@/pages/_layouts';
import useWeb3 from '@/services/web3/useWeb3';
import BigNumber from 'bignumber.js';
import { VueQueryDevTools } from 'vue-query/devtools';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import GlobalModalContainer from './components/modals/GlobalModalContainer.vue';
import AppSidebar from './components/navs/AppNav/AppSidebar/AppSidebar.vue';
import SanctionedWalletModal from './components/web3/SanctionedWalletModal.vue';
import useBackgroundColor from './composables/useBackgroundColor';
import useGnosisSafeApp from './composables/useGnosisSafeApp';
import useNavigationGuards from './composables/useNavigationGuards';
import { useSidebar } from './composables/useSidebar';
import useExploitWatcher from './composables/watchers/useExploitWatcher';
import useGlobalQueryWatchers from './composables/watchers/useGlobalQueryWatchers';
import usePoolCreationWatcher from './composables/watchers/usePoolCreationWatcher';

BigNumber.config({ DECIMAL_PLACES: DEFAULT_TOKEN_DECIMALS });

export const isThirdPartyServicesModalVisible = ref(false);

export default defineComponent({
  components: {
    ...Layouts,
    VueQueryDevTools,
    WalletSelectModal,
    SanctionedWalletModal,
    ThirdPartyServicesModal,
    Notifications,
    AppSidebar,
    GlobalModalContainer,
  },

  setup() {
    /**
     * STATE
     */
    const layout = ref('DefaultLayout');
    /**
     * COMPOSABLES
     */
    useWeb3Watchers();
    usePoolCreationWatcher();
    useGlobalQueryWatchers();
    useGnosisSafeApp();
    useExploitWatcher();
    useNavigationGuards();
    const { isWalletSelectVisible, toggleWalletSelectModal, isBlocked } =
      useWeb3();
    const route = useRoute();
    const store = useStore();
    const { newRouteHandler: updateBgColorFor } = useBackgroundColor();
    const { sidebarOpen } = useSidebar();

    // ADD FEATURE ALERT HERE
    // const featureAlert: Alert = {
    //   id: 'vebal-gap',
    //   priority: AlertPriority.LOW,
    //   label: t('alerts.vebalL2'),
    //   type: AlertType.FEATURE,
    //   rememberClose: false,
    //   actionOnClick: false
    // };
    // addAlert(featureAlert);
    const initSingularity = params => {
      window.document.body.addEventListener('Singularity-mounted', () => {
        console.log('----------singularity mounted--------');
        // let key;
        // if (searchParams.get('key')) {
        //   console.log('using key through url');
        //   key = searchParams.get('key');
        // } else if (localStorage.getItem('singularity-key')) {
        //   console.log('using key through localStorage');
        //   key = localStorage.getItem('singularity-key');
        // } else {
        //   console.log('using default key value');
        //   key = 2; // default key
        // }
        // localStorage.setItem('singularity-key', key);

        window.Singularity.init(
          'yPfA6XtgVRV9KUeG1bxOzh0dTDzNpRFq',
          async () => {
            console.log('----------singularity init callback--------');
            window.SingularityEvent.subscribe('SingularityEvent-logout', () => {
              console.log('logout event received');
              navigate('/');
              window.SingularityEvent.close();
            });

            window.SingularityEvent.subscribe('SingularityEvent-open', () =>
              setDrawerOpen(true)
            );

            window.SingularityEvent.subscribe('SingularityEvent-close', () => {
              console.log('subscribe close drawer ');
              setDrawerOpen(false);
            });

            window.SingularityEvent.subscribe(
              'SingularityEvent-onTransactionApproval',
              data => {
                console.log('Txn approved', JSON.parse(data));
              }
            );
            window.SingularityEvent.subscribe(
              'SingularityEvent-onTokenExpired',
              data => {
                console.log('Token expired', JSON.parse(data));
              }
            );
            window.SingularityEvent.subscribe(
              'SingularityEvent-onTransactionSuccess',
              data => {
                console.log('Txn Successfull', JSON.parse(data));
              }
            );
            window.SingularityEvent.subscribe(
              'SingularityEvent-onTransactionFailure',
              data => {
                console.log('Txn failed', JSON.parse(data));
              }
            );

            window.SingularityEvent.subscribe(
              'SingularityEvent-login',
              data => {
                console.log('login data --->', data);
              }
            );
          }
        );
      });
    };
    /**
     * CALLBACKS
     */
    onBeforeMount(async () => {
      store.dispatch('app/init');
    });
    onMounted(async () => {
      initSingularity();
    });
    function handleThirdPartyModalToggle(value: boolean) {
      isThirdPartyServicesModalVisible.value = value;
    }

    /**
     * WATCHERS
     */
    watch(route, newRoute => {
      updateBgColorFor(newRoute);
      if (newRoute.meta.layout) {
        layout.value = newRoute.meta.layout as string;
      } else {
        layout.value = 'DefaultLayout';
      }
    });

    return {
      // state
      layout,
      isBlocked,
      isThirdPartyServicesModalVisible,
      // computed
      isWalletSelectVisible,
      sidebarOpen,
      // methods
      toggleWalletSelectModal,
      handleThirdPartyModalToggle,
    };
  },
});
</script>

<template>
  <div id="modal" />
  <div id="app">
    <component :is="layout" />
    <VueQueryDevTools />
    <WalletSelectModal
      :isVisible="isWalletSelectVisible"
      :onShowThirdParty="() => handleThirdPartyModalToggle(true)"
      @close="toggleWalletSelectModal"
    />
    <SanctionedWalletModal :isVisible="isBlocked" />
    <ThirdPartyServicesModal
      :isVisible="isThirdPartyServicesModalVisible"
      @close="handleThirdPartyModalToggle(false)"
    />
    <AppSidebar v-if="sidebarOpen" />
    <Notifications />
  </div>
  <GlobalModalContainer />
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}
</style>
