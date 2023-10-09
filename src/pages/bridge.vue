<script setup lang="ts">
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import BridgeComponent from '@/components/contextual/pages/bridge/BridgeComponent.vue';
import RedeemComponent from '@/components/contextual/pages/bridge/RedeemComponent.vue';
import BridgeAdminComponent from '@/components/contextual/pages/bridge/BridgeAdminComponent.vue';
/**
 * STATE
 */
const tabSelect = ref('bridge'); // bridge, redeem, admin

/**
 * METHODS
 */

function changeTab(tab) {
  tabSelect.value = tab;
}
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
        :class="{ active: tabSelect === 'redeem' }"
        @click="changeTab('redeem')"
      >
        Redeem
      </BalBtn>
      <BalBtn
        classCustom="outline-3"
        class="mr-5 hero-btn"
        :class="{ active: tabSelect === 'admin' }"
        @click="changeTab('admin')"
      >
        Admin
      </BalBtn>
    </div>
    <Col3Layout offsetGutters mobileHideGutters class="mt-10">
      <div v-if="tabSelect === 'bridge'" class="section">
        <BridgeComponent />
      </div>
      <div v-if="tabSelect === 'redeem'" class="section">
        <RedeemComponent />
      </div>
      <div v-if="tabSelect === 'admin'" class="section">
        <BridgeAdminComponent />
      </div>
    </Col3Layout>
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
</style>
