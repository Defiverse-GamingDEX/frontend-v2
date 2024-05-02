<script setup lang="ts">
import StakeComponent from '@/components/contextual/pages/stake/StakeComponent.vue';
import UnstakeComponent from '@/components/contextual/pages/stake/UnstakeComponent.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
/**
 * STATE
 */
const tabSelect = ref('stake'); // stake, unstake

// COMPOSABLES
const { t } = useI18n();

const { account } = useWeb3();

const router = useRouter();
// COMPUTED

// LIFE CYCLES

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
        :class="{ active: tabSelect === 'stake' }"
        @click="changeTab('stake')"
      >
        Stake
      </BalBtn>
      <BalBtn
        classCustom="outline-3"
        class="mr-5 hero-btn"
        :class="{ active: tabSelect === 'unstake' }"
        @click="changeTab('unstake')"
      >
        Unstake
      </BalBtn>
    </div>
    <Col3Layout offsetGutters mobileHideGutters class="mt-10">
      <div v-if="tabSelect === 'stake'" class="section">
        <StakeComponent />
      </div>
      <div v-if="tabSelect === 'unstake'" class="section">
        <UnstakeComponent />
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
