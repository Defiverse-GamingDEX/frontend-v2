<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import useSingularity from '@/composables/useSingularity';
import { SINGULARITY_NETWORKS } from '@/constants/singularity/networks';

import useWeb3 from '@/services/web3/useWeb3';
import BuyCryptoModal from './BuyCryptoModal.vue';

/**
 * STATES
 */
const { bp } = useBreakpoints();
const openTokenModal = ref(false);
const networkChoose = ref(null);
const tokensList = ref(null);
const token = ref(null);
const isLoading = ref(true);
// // COMPOSABLES
const {
  account,
  getSigner,
  chainId,
  isWalletReady,
  isMismatchedNetwork,
  startConnectWithInjectedProvider,
} = useWeb3();

const { initSingularity, connectWalletConnectProvider, singularityLogout } =
  useSingularity();
/**
 * COMPUTED
 */
const swapCardShadow = computed(() => {
  switch (bp.value) {
    case 'xs':
      return 'none';
    case 'sm':
      return 'lg';
    default:
      return 'xl';
  }
});

/**
 * WATCHS
 */
watch(
  () => chainId.value,
  () => {
    if (chainId.value) {
      initTokenList(chainId.value);
    }
  }
);
watch(
  () => account.value,
  async () => {
    if (account.value) {
      connectWalletConnectProvider();
    } else {
      singularityLogout();
    }
  }
);
/**
 * FUNCTIONs
 */
const openBuyCryptoModal = () => {
  openTokenModal.value = true;
};
const initTokenList = chain => {
  networkChoose.value = SINGULARITY_NETWORKS.find(
    item => item.chain_id_decimals === 16116
  );

  let tokens =
    networkChoose.value?.tokens?.map(token => {
      return {
        ...token,
        chainInfo: {
          ...networkChoose.value,
        },
      };
    }) || [];

  tokensList.value = tokens;
};
const checkSingularityLoaded = payload => {
  isLoading.value = false;
};
/**
 * LIFECYCLE
 */
onMounted(async () => {
  if (window.Singularity?.isMounted) {
    isLoading.value = false;
  }
  window.emitter?.on('SingularityLoaded', checkSingularityLoaded);
  if (chainId.value) {
    initTokenList(chainId.value);
  }
});
</script>
<template>
  <BalCard
    class="relative mt-6 card-container bg-blue"
    :shadow="swapCardShadow"
    noBorder
  >
    <div class="buy-crypto-container">
      <div class="label">
        {{ $t('singularity.buyTitle') }}
      </div>
      <BalBtn
        :disabled="isLoading || !account"
        :loading="isLoading"
        :loadingLabel="$t('loading')"
        :label="$t('singularity.buyBtnLabel')"
        classCustom="pink-white-shadow"
        block
        @click.prevent="openBuyCryptoModal"
      />
    </div>
    <teleport to="#modal">
      <BuyCryptoModal
        v-if="openTokenModal"
        :tokensList="tokensList"
        :tokenChoose="token"
        @close="openTokenModal = false"
      />
    </teleport>
  </BalCard>
</template>


<style scoped lang="scss">
.buy-crypto-container {
  display: flex;
  align-items: center;
  .pink-white-shadow {
    margin-left: auto;
    display: block;
    height: 32px;
    font-size: 12px;
    width: auto;
    padding: 4px 8px;
    &:disabled {
      height: 32px;
      font-size: 12px;
      width: auto;
      padding: 4px 8px;
    }
  }
}
</style>
