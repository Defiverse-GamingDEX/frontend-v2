<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import { isL2 } from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { useUserStaking } from '@/providers/local/user-staking.provider';
import { Pool } from '@/services/pool/types';
import { useUserPools } from '@/providers/local/user-pools.provider';
import StakePreviewModal from '../pool/staking/StakePreviewModal.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';

/**
 * STATE
 */
const showUnstakeModal = ref(false);
const poolToUnstake = ref<Pool | undefined>();

/**
 * PROVIDERS
 */
providePoolStaking();

/**
 * COMPOSABLES
 */
const {
  stakedPools,
  poolBoostsMap,
  stakedShares,
  isLoading,
  isLazyLoading,
  lazyLoadPoolData,
} = useUserStaking();
const { refetchAllUserPools } = useUserPools();
const { isWalletReady, isWalletConnecting } = useWeb3();
const { t } = useI18n();
const networkName = configService.network.shortName;

/**
 * COMPUTED
 */
const noPoolsLabel = computed(() => {
  return isWalletReady.value || isWalletConnecting.value
    ? t('noStakedInvestments', [networkName])
    : t('connectYourWallet');
});

const hiddenColumns = computed(() => {
  const _hiddenColumns = ['poolVolume', 'migrate', 'lockEndDate'];
  if (isL2.value) _hiddenColumns.push('myBoost');

  return _hiddenColumns;
});

const poolsToRenderKey = computed(() => JSON.stringify(stakedPools.value));

/**
 * METHODS
 */
function handleUnstake(pool: Pool) {
  showUnstakeModal.value = true;
  poolToUnstake.value = pool;
}

function handleModalClose() {
  refetchAllUserPools();
  showUnstakeModal.value = false;
}

async function handleUnstakeSuccess() {
  await refetchAllUserPools();
}

// Lazy load APR and TotalLiquidity after initial render
watch(
  () => stakedPools.value,
  pools => {
    if (pools && pools.length > 0 && !isLoading.value && !isLazyLoading.value) {
      nextTick(() => {
        console.log(
          '[StakedPoolsTable] Triggering lazy load for',
          pools.length,
          'pools'
        );
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
        {{ $t('staking.stakedPools') }}
      </h5>
      <PoolsTable
        :key="poolsToRenderKey"
        class="staked-pools"
        :data="stakedPools"
        :shares="stakedShares"
        :boosts="poolBoostsMap"
        poolsType="staked"
        :noPoolsLabel="noPoolsLabel"
        :isLoading="isLoading"
        :isLazyLoading="isLazyLoading"
        sortColumn="myBalance"
        :hiddenColumns="hiddenColumns"
        showPoolShares
        showBoost
        showActions
        @trigger-unstake="handleUnstake"
      />
    </BalStack>
    <StakePreviewModal
      v-if="poolToUnstake"
      :pool="poolToUnstake"
      :isVisible="showUnstakeModal"
      action="unstake"
      @close="handleModalClose"
      @success="handleUnstakeSuccess"
    />
  </div>
</template>
<style>
.staked-pools .content .max-w-full .overflow-hidden .table-fixed {
  min-width: 1440px;
}
.staked-pools .content .max-w-full .overflow-auto .table-fixed {
  min-width: 1440px;
}
</style> 