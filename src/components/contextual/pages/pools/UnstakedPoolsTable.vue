<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserPools } from '@/providers/local/user-pools.provider';
import StakePreviewModal from '@/components/contextual/pages/pool/staking/StakePreviewModal.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';

/**
 * STATE
 */
const showStakeModal = ref(false);
const stakePool = ref<Pool | undefined>();
const networkName = configService.network.shortName;
const hiddenColumns = ['poolVolume', 'migrate', 'lockEndDate'];

/**
 * PROVIDERS
 */
providePoolStaking();

/**
 * COMPOSABLES
 */
const { isWalletReady, isWalletConnecting } = useWeb3();
const { t } = useI18n();
const {
  unstakedPools,
  userPoolShares,
  refetchAllUserPools,
  isLoading: isLoadingPools,
  isLazyLoading,
  lazyLoadPoolData,
} = useUserPools();

/**
 * COMPUTED
 */
const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noUnstakedInvestments', [networkName])
    : t('connectYourWallet');
});

const poolsToRenderKey = computed(() => JSON.stringify(unstakedPools.value));

/**
 * METHODS
 */
function handleStake(pool: Pool) {
  showStakeModal.value = true;
  stakePool.value = pool;
}

function handleModalClose() {
  refetchAllUserPools();
  showStakeModal.value = false;
}

async function handleStakeSuccess() {
  await refetchAllUserPools();
}

onMounted(() => {
  refetchAllUserPools();
});

// Lazy load APR and TotalLiquidity after initial render
watch(
  () => unstakedPools.value,
  (pools) => {
    if (pools && pools.length > 0 && !isLoadingPools.value && !isLazyLoading.value) {
      // Use nextTick to ensure table is rendered first
      nextTick(() => {
        console.log('[UnstakedPoolsTable] Triggering lazy load for', pools.length, 'pools');
        lazyLoadPoolData(pools);
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <BalStack vertical spacing="sm">
      <h5 class="px-4 xl:px-0 text-white">
        {{ $t('staking.unstakedPools') }}
      </h5>
      <PoolsTable
        :key="poolsToRenderKey"
        class="unstaked-pools"
        :isLoading="isLoadingPools"
        :isLazyLoading="isLazyLoading"
        :data="unstakedPools"
        :shares="userPoolShares"
        :noPoolsLabel="noPoolsLabel"
        sortColumn="myBalance"
        :hiddenColumns="hiddenColumns"
        showPoolShares
        showActions
        @trigger-stake="handleStake"
      />
    </BalStack>
    <StakePreviewModal
      v-if="stakePool"
      :pool="stakePool"
      :isVisible="showStakeModal"
      action="stake"
      @close="handleModalClose"
      @success="handleStakeSuccess"
    />
  </div>
</template>
<style>
.unstaked-pools .content .max-w-full .overflow-hidden .table-fixed {
  min-width: 1440px;
}
.unstaked-pools .content .max-w-full .overflow-auto .table-fixed {
  min-width: 1440px;
}
</style>