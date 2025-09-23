<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Network } from '@defiverse/balancer-sdk';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import useVeBAL from '@/composables/useVeBAL';
import { getNetworkSlug } from '@/composables/useNetwork';

/**
 * STATE
 */
const redirectModal = ref<typeof BalModal>();
const isTestnet = import.meta.env.VITE_IS_TESTNET == 'true' ? 'true' : 'false';

const networkName = computed(() => (isTestnet ? 'Oasys Testnet' : 'Oasys'));
const network = computed(() =>
  isTestnet ? Network.OASYS_TESTNET : Network.MAINNET
);
/**
 * COMPOSABLES
 */
const { showRedirectModal, setShowRedirectModal } = useVeBAL();
const router = useRouter();

/**
 * METHODS
 */
function handleInternalClose() {
  redirectModal?.value?.hide();
  router.push({
    name: 'home',
  });
}
function handleExternalClose() {
  setShowRedirectModal(false);
  router.push({
    name: 'home',
  });
}
</script>

<template>
  <BalModal
    ref="redirectModal"
    :show="showRedirectModal"
    @close="handleExternalClose"
  >
    <template #header>
      <h3>
        {{ $t('modals.veBalRedirectModal.title') }}
      </h3>
    </template>
    <div>
      <p class="whitespace-pre-line">
        {{ $t('modals.veBalRedirectModal.description', { networkName }) }}
      </p>

      <div class="grid grid-cols-2 grid-rows-1 gap-4 mt-4">
        <BalBtn
          tag="a"
          :label="$t('proceed')"
          color="gradient"
          @click="
            router.push({
              name: 'vebal',
              params: { networkSlug: getNetworkSlug(network) },
            })
          "
        />
        <BalBtn
          color="gray"
          :label="$t('cancel')"
          outline
          @click="handleInternalClose"
        />
      </div>
    </div>
  </BalModal>
</template>
