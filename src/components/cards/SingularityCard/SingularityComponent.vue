<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
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
// // COMPOSABLES
const {
  account,
  getSigner,
  chainId,
  isWalletReady,
  isMismatchedNetwork,
  startConnectWithInjectedProvider,
} = useWeb3();
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
 * FUNCTIONs
 */
const openBuyCryptoModal = () => {
  console.log('openBuyCryptoModal');
  openTokenModal.value = true;
};
const initTokenList = chainId => {
  console.log(SINGULARITY_NETWORKS, ' SINGULARITY_NETWORKS');
  console.log(chainId, ' chainId');
  networkChoose.value = SINGULARITY_NETWORKS.find(
    item => item.chain_id_decimals === chainId
  );
  console.log(networkChoose.value, ' networkChoose.value');
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
/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  initTokenList(chainId.value);
});
</script>
<template>
  <BalCard
    class="relative mt-6 card-container bg-blue"
    :shadow="swapCardShadow"
    noBorder
  >
    <div class="buy-crypto-container">
      <div class="label">{{ $t('singularity.buyTitle') }}</div>
      <BalBtn
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
  }
}
</style>
