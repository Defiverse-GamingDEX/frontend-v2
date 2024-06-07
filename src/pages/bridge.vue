<script setup lang="ts">
import BridgeComponent from '@/components/contextual/pages/bridge/BridgeComponent.vue';
import HistoryComponent from '@/components/contextual/pages/bridge/HistoryComponent.vue';
import LastTxComponent from '@/components/contextual/pages/bridge/LastTxComponent.vue';
import MiniHistoryComponent from '@/components/contextual/pages/bridge/MiniHistoryComponent.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useAlerts from '@/composables/useAlerts';
import useWeb3 from '@/services/web3/useWeb3';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
const WHITELIST_ADDRESSES = [
  '0xf9209B6F49BB9fD73422BA834f4cD444aE7ceacE',
  '0x343eCF760a020936eEE8D655b43C5cBD40769A05',
  '0xE026Ec8A3bDaE1b171c162aF556F6dC73917D3D0',
];
/**
 * STATE
 */
const tabSelect = ref('bridge'); // bridge, redeem, admin
const adminAddress = ref(null);

// COMPOSABLES
const { t } = useI18n();
const { addAlert, removeAlert } = useAlerts();
const { getAdminAddress } = usePoolCreation();

const { account, chainId } = useWeb3();

const route = useRoute();
const router = useRouter();

// COMPUTED
const isAdmin = computed(() => {
  if (!adminAddress.value) {
    return false;
  }
  if (adminAddress.value === account.value) {
    return true;
  }
  return false;
});

// WATCHS
watch(isAdmin, () => {
  if (!isAdmin.value) {
    tabSelect.value = 'bridge';
  }
});
watch(chainId, () => {
  checkMisMatch();
  checkWhileList();
});
watch(route?.name, () => {
  checkMisMatch();
});

watch(account, () => {
  checkWhileList();
});
// FUNCTIONS
const checkMisMatch = () => {
  if (route?.name === 'bridge') {
    // not check mismath in bridge page
    removeAlert('network-mismatch');
    return;
  }
};
const checkWhileList = () => {
  if (!account.value || !chainId.value) {
    router.push({ name: 'home' });
  } else {
    const isIncluded = WHITELIST_ADDRESSES.map(a => a.toLowerCase()).includes(
      account.value.toLowerCase()
    );
    if (!isIncluded) {
      router.push({ name: 'home' });
    }
  }
};
function changeTab(tab) {
  tabSelect.value = tab;
}
// LIFE CYCLES
onBeforeMount(async () => {
  adminAddress.value = await getAdminAddress();
  checkMisMatch();
  checkWhileList();
});
</script>

<template>
  <div>
    <div class="flex justify-center mt-16 nav-tabs">
      <BalBtn
        classCustom="outline-3"
        class="mr-5 hero-btn"
        :class="{ active: tabSelect === 'bridge' }"
        @click="changeTab('bridge')"
      >
        Bridge
      </BalBtn>
      <BalBtn
        classCustom="outline-3"
        class="mr-5 hero-btn"
        :class="{ active: tabSelect === 'history' }"
        @click="changeTab('history')"
      >
        History
      </BalBtn>
      <!-- <BalBtn
        classCustom="outline-3"
        class="mr-5 hero-btn"
        :class="{ active: tabSelect === 'redeem' }"
        @click="changeTab('redeem')"
      >
        Redeem
      </BalBtn>
      <BalBtn
        v-if="isAdmin"
        classCustom="outline-3"
        class="mr-5 hero-btn"
        :class="{ active: tabSelect === 'admin' }"
        @click="changeTab('admin')"
      >
        Admin
      </BalBtn> -->
    </div>
    <Col3Layout
      v-if="
        tabSelect === 'bridge' ||
        tabSelect === 'redeem' ||
        tabSelect === 'admin'
      "
      offsetGutters
      class="mt-10"
      :class="{ 'bridge-page-layout': tabSelect === 'bridge' }"
    >
      <template #gutterLeft>
        <div v-if="tabSelect === 'bridge'" class="tx-status">
          <LastTxComponent />
        </div>
      </template>

      <div v-if="tabSelect === 'bridge'" class="section">
        <BridgeComponent />
      </div>

      <!-- <div v-if="tabSelect === 'redeem'" class="section">
        <RedeemComponent />
      </div>
      <div v-if="tabSelect === 'admin'" class="section">
        <BridgeAdminComponent />
      </div> -->
      <template #gutterRight>
        <div v-if="tabSelect === 'bridge'" class="mini-history">
          <MiniHistoryComponent />
        </div>
      </template>
    </Col3Layout>
    <div
      v-if="tabSelect === 'history'"
      class="mt-10 section bridge-page-history-layout"
    >
      <HistoryComponent />
    </div>
  </div>
</template>

<style scoped lang='scss'>
.nav-tabs {
  .bal-btn {
    box-shadow: 0px 3px 6px #00000029;
    border-radius: 14px;
    font-size: 20px;
    line-height: 24px;
    &.outline-3 {
      width: 178px;
    }
    &.active {
      background: #fafdff 0% 0% no-repeat padding-box;
      color: #048bc9;
    }
  }
}
.bridge-page-layout {
  max-width: 76rem;
  @media (max-width: 768px) {
    padding: 16px;
  }
  :deep {
    .gutter-col {
      &.mt-6 {
        margin-top: 0px;
      }
    }
    .card-container {
      width: 100%;
    }
  }
}
.bridge-page-history-layout {
  max-width: 80rem;
  margin: 0 auto;
  margin-top: 2.5rem;
}
</style>
