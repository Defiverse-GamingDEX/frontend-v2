<script setup lang="ts">
import { isSoftMigratablePool } from '@/components/forms/pool_actions/MigrateForm/constants';
import useWithdrawMath from '@/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath';
import { Goals, trackGoal } from '@/composables/useFathom';
import useNetwork from '@/composables/useNetwork';
import { isJoinsDisabled, usePool } from '@/composables/usePool';
import { useTokens } from '@/providers/tokens.provider';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { computed, toRef } from 'vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  missingPrices: boolean;
};
/**
 * STATES
 */
const isPoolWhiteList = ref(false);
/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { hasBpt } = useWithdrawMath(toRef(props, 'pool'));
const { isMigratablePool, hasNonApprovedRateProviders } = usePool(
  toRef(props, 'pool')
);
const {
  balanceFor,
  nativeAsset,
  wrappedNativeAsset,
  isLiquidityWhitelisted,
  getAntiTraderInfo,
} = useTokens();
const { isWalletReady, startConnectWithInjectedProvider, account } = useWeb3();
const { networkSlug } = useNetwork();

/**
 * COMPUTED
 */
const joinDisabled = computed(
  (): boolean =>
    isJoinsDisabled(props.pool.id) ||
    hasNonApprovedRateProviders.value ||
    (isMigratablePool(props.pool) && !isSoftMigratablePool(props.pool.id))
);
/**
 * WATCHS
 */
watch(
  () => account?.value,
  newVal => {
    if (account?.value) {
      checkIsLiquidityWhitelisted();
    }
  }
);
/***
 * FUNCTIONS
 */
async function checkIsLiquidityWhitelisted() {
  try {
    let multiCall = [];
    const tokenAddresses = props.pool?.tokenAddresses;
    if (tokenAddresses?.length > 0) {
      for (let i = 0; i < tokenAddresses?.length; i++) {
        multiCall.push(
          isLiquidityWhitelisted(tokenAddresses[i], account?.value)
        );
      }
    }
    let rs = await Promise.allSettled(multiCall);
    let isExistWhiteList = rs?.find(
      item => item?.value?.isLiquidityWhitelisted === true
    );
    if (isExistWhiteList) {
      isPoolWhiteList.value = true;
    } else {
      isPoolWhiteList.value = false;
    }
  } catch (error) {
    console.log(error, 'error=>checkIsLiquidityWhitelisted');
  }
}
/**
 * LIFECIRCYES
 */
onMounted(() => {
  checkIsLiquidityWhitelisted();
});
</script>

<template>
  <div
    class="p-4 w-full bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-900"
  >
    <BalBtn
      v-if="!isWalletReady"
      :label="$t('connectWallet')"
      color="gradient"
      block
      @click="startConnectWithInjectedProvider"
    />
    <div v-else class="grid grid-cols-2 gap-2">
      <BalBtn
        :tag="joinDisabled || !isPoolWhiteList ? 'div' : 'router-link'"
        :to="{ name: 'invest', params: { networkSlug } }"
        :label="$t('addLiquidity')"
        color="gradient"
        :disabled="joinDisabled || !isPoolWhiteList"
        block
        @click="trackGoal(Goals.ClickAddLiquidity)"
      />
      <BalBtn
        :tag="hasBpt ? 'router-link' : 'div'"
        :to="{ name: 'withdraw', params: { networkSlug } }"
        :label="$t('withdraw.label')"
        :disabled="!hasBpt"
        color="blue"
        outline
        block
        @click="trackGoal(Goals.ClickWithdraw)"
      />
    </div>
  </div>
</template>
