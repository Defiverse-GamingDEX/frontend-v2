<script lang="ts">
// Add a default export to make the component importable with default import
export default {
  name: 'StakingInfo',
};
</script>
<script setup lang="ts">
import { ref } from 'vue';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useRouter } from 'vue-router';
import useWeb3 from '@/services/web3/useWeb3';
import { useStakeZ } from '@/composables/stakeZ/useStakeZ';
import { STAKE_Z_NETWORKS } from '@/constants/stakeZ';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import BigNumber from 'bignumber.js';
const myZ = ref<number | unknown>(undefined);
const myLockedZ = ref<number | unknown>(undefined);
const mySZ = ref<number | unknown>(undefined);
/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { upToLargeBreakpoint } = useBreakpoints();
const router = useRouter();
const { account, chainId, getProvider } = useWeb3();
const STAKE_Z_NETWORK = computed(() => {
  return (
    STAKE_Z_NETWORKS.find(network => network.chain_id === chainId.value) || null
  );
});
const { getTokenBalance, getLockedZAmount } = useStakeZ();
/**
/**
 * FUNCTIONS
 */
const goToSwap = () => {
  router.push({ name: 'swap' });
};
const getZbalance = async () => {
  try {
    const provider = getProvider();
    const zBalance = await getTokenBalance({
      provider: provider,
      tokenAddress: STAKE_Z_NETWORK.value?.z_token_address,
      walletAddress: account.value,
      tokenDecimals: STAKE_Z_NETWORK.value?.z_token_decimals,
    });
    return zBalance;
  } catch (error) {
    console.log(error, 'getZbalance=>error');
    return 0;
  }
};
const getLockedZbalance = async () => {
  try {
    const provider = getProvider();
    const params = {
      provider: provider,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      walletAddress: account.value,
    };
    let lockedZAmount: any = await getLockedZAmount(params);
    lockedZAmount = BigNumber(lockedZAmount).div(
      10 ** (STAKE_Z_NETWORK.value?.z_token_decimals ?? 18)
    );
    console.log('🚀 ~ getLockedZbalance ~ lockedZAmount:', lockedZAmount);
    return lockedZAmount;
  } catch (error) {
    console.log(error, 'getLockedZbalance=>error');
    return 0;
  }
};
const getSZbalance = async () => {
  try {
    const provider = getProvider();
    const szBalance = await getTokenBalance({
      provider: provider,
      tokenAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      walletAddress: account.value,
      tokenDecimals: STAKE_Z_NETWORK.value?.sz_token_decimals,
    });
    console.log('🚀 ~ getSZbalance ~ szBalance:', szBalance);
    return szBalance;
  } catch (error) {
    console.log(error, 'getSZbalance=>error');
    return 0;
  }
};
const getStakeZInfo = async () => {
  try {
    if (!account.value || !chainId.value) {
      return;
    }
    myZ.value = await getZbalance();
    myLockedZ.value = await getLockedZbalance();
    mySZ.value = await getSZbalance();
  } catch (error) {
    console.log(error, 'getStakeZInfo=>error');
  }
};
const reloadStakeZInfo = async () => {
  await getStakeZInfo();
};
/**
 * LIFE CYCLES
 */
onMounted(async () => {
  await getStakeZInfo();
  (window as any).emitter?.on('reloadStakeZInfo', reloadStakeZInfo);
});
</script>

<template>
  <div class="staking-info">
    <h5 class="staking-info-title">My sZ</h5>

    <div class="flex flex-col gap-5">
      <!-- My Z -->
      <BalCard noBorder :square="upToLargeBreakpoint">
        <div class="card-content">
          <div class="title">My Z</div>
          <div class="flex justify-between items-center">
            <div class="amount">
              {{ fNum2(myZ?.toString() || '0', FNumFormats.token) }}
            </div>
            <div class="flex gap-1 items-center">
              <BalIcon
                name="plus-circle"
                class="mr-2 transition-all cursor-pointer link plus-circle"
                @click="goToSwap()"
              />
            </div>
          </div>
          <div class="separator">-</div>
        </div>
      </BalCard>

      <!-- My locked Z -->
      <BalCard noBorder :square="upToLargeBreakpoint">
        <div class="card-content">
          <div class="title">My locked Z</div>
          <div class="flex justify-between items-center">
            <div class="amount">
              {{ fNum2(myLockedZ?.toString() || '0', FNumFormats.token) }}
            </div>
            <!-- <div class="flex gap-1 items-center">
              <img :src="ZIcon" alt="Z Token" class="w-4 h-4" />
              <span class="token">Z</span>
            </div> -->
          </div>
          <div class="separator">-</div>
        </div>
      </BalCard>

      <!-- My sZ -->
      <BalCard noBorder :square="upToLargeBreakpoint">
        <div class="card-content">
          <div class="title">My sZ</div>
          <div class="flex justify-between items-center">
            <div class="amount">
              {{ fNum2(mySZ?.toString() || '0', FNumFormats.token) }}
            </div>
            <div class="flex gap-1 items-center">
              <router-link
                :to="{
                  name: 'portfolio',
                }"
                class="transition-all cursor-pointer link"
                >Manage</router-link
              >
            </div>
          </div>
          <div class="separator">-</div>
        </div>
      </BalCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.staking-info {
  .staking-info-title {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .card-content {
    .title {
      color: #314472;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .amount {
      color: #314472;
      font-size: 28px;
      font-weight: bold;
    }
    .token {
      @apply text-xl font-bold text-gray-800;
    }

    .separator {
      color: #314472;
    }
    .link {
      color: #2563eb;
    }
  }
}
</style>
