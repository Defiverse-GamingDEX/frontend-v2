<script setup lang="ts">
import StakedPoolsTable from '@/components/contextual/pages/pools/StakedPoolsTable.vue';
import UnstakedPoolsTable from '@/components/contextual/pages/pools/UnstakedPoolsTable.vue';
import SZManagementTable from '@/components/contextual/pages/pools/SZManagementTable.vue';
import PortfolioPageHero from '@/components/heros/PortfolioPageHero.vue';
import { useLock } from '@/composables/useLock';
import { providerUserPools } from '@/providers/local/user-pools.provider';
import { provideUserStaking } from '@/providers/local/user-staking.provider';
import useConfig from '@/composables/useConfig';
import { NAV_LINKS } from '@/constants/navLinks';
/**
 * PROVIDERS
 */
const userStaking = provideUserStaking();
providerUserPools(userStaking);

/**
 * COMPOSABLES
 */
// const { lockPool, lock } = useLock();
const { networkConfig } = useConfig();
const isShowSZManagement = computed(() => {
  if (
    networkConfig.chainId === 248 ||
    networkConfig.chainId === 9372 ||
    networkConfig.chainId === 6343
  ) {
    return true;
  }
  return false;
});
console.log(
  '🚀 ~ isShowSZManagement ~ isShowSZManagement:',
  isShowSZManagement
);
</script>

<template>
  <div>
    <PortfolioPageHero />
    <div class="xl:container xl:px-4 pt-10 md:pt-12 xl:mx-auto">
      <BalStack vertical>
        <div class="px-4 xl:px-0 text-white">
          <BalStack horizontal justify="between" align="center">
            <h3>{{ $t('myLiquidityInBalancerPools') }}</h3>
          </BalStack>
        </div>
        <BalStack vertical spacing="2xl">
          <UnstakedPoolsTable />
          <StakedPoolsTable />
          <!-- <VeBalPoolTable
            v-if="lockPool && Number(lock?.lockedAmount) > 0"
            :lock="lock"
            :lockPool="lockPool"
          /> -->

          <SZManagementTable v-if="isShowSZManagement" />
        </BalStack>
      </BalStack>
    </div>
  </div>
</template>
