<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import { useI18n } from 'vue-i18n';
import { useGaugeReward } from '@/composables/gaugeReward/useGaugeReward';

import useNotifications from '@/composables/useNotifications';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { getProvider, account, getSigner, chainId } = useWeb3();

const { startDistributions } = useGaugeReward();
const { addNotification } = useNotifications();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();
/**
 * STATE
 */

const provider = getProvider();
const isLoading = ref(false);

// FUNCTIONS

async function handleDistributeButton() {
  try {
    isLoading.value = true;
    const signer = getSigner();
    let tx = await startDistributions(
      account.value,
      signer,
      provider,
      chainId.value
    );

    const summary = `Start distribute token success!`;
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'startDistribute',
      summary,
    });
    txListener(tx, {
      onTxConfirmed: async () => {
        isLoading.value = false;
      },
      onTxFailed: () => {
        isLoading.value = false;
      },
    });
  } catch (error) {
    console.log(error, 'error=>handleDistributeButton');
    isLoading.value = false;
    addNotification({
      type: 'error',
      title: '',
      message: error?.message ? error.message : JSON.stringify(error),
    });
  }
}
</script>

<template>
  <BalBtn
    :label="$t('distributionReward')"
    :loading="isLoading"
    classCustom="pink-white-shadow btn-distribute"
    block
    @click.prevent="handleDistributeButton"
  />
</template>

<style scoped lang="scss">
.btn-distribute {
  width: 300px;
}
</style>
