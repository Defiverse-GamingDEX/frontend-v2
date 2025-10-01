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
import useVotingGauges from '@/composables/useVotingGauges';
import { bnum, scale } from '@/lib/utils';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
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
const { unallocatedVotes, refetch: refetchVotingGauges } = useVotingGauges();
console.log(unallocatedVotes.value, 'unallocatedVotes');
const unallocatedVotesFormatted = computed<string>(() =>
  fNum2(scale(bnum(unallocatedVotes.value), -4).toString(), FNumFormats.percent)
);
const veBalLockInfoQuery = useVeBalLockInfoQuery();
const hasLock = computed(
  (): boolean =>
    !!veBalLockInfoQuery.data.value?.hasExistingLock &&
    !veBalLockInfoQuery.data.value?.isExpired
);
const hasExpiredLock = computed(
  (): boolean =>
    !!veBalLockInfoQuery.data.value?.hasExistingLock &&
    veBalLockInfoQuery.data.value?.isExpired
);
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
watch(account, () => {
  if (account.value) {
    getStakeZInfo();
  }
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
          <!-- <div class="separator">-</div> -->
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
          <!-- <div class="separator">-</div> -->
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
          <!-- <div class="separator">-</div> -->
        </div>
      </BalCard>
      <!-- My unallocated votes -->
      <BalCard noBorder :square="upToLargeBreakpoint">
        <div class="card-content">
          <div class="flex items-center title">
            My unallocated votes
            <BalTooltip
              :text="$t('veBAL.liquidityMining.myUnallocatedVotesTooltip')"
              iconClass="text-gray-400 dark:text-gray-600"
              iconSize="sm"
              width="72"
              class="mt-1 ml-2"
            />
          </div>
          <div class="flex justify-between items-center">
            <div class="amount">
              <p
                class="inline mr-1 text-lg font-semibold"
                :class="{ 'text-red-500': hasExpiredLock }"
              >
                <span v-if="hasLock">
                  {{ unallocatedVotesFormatted }}
                </span>
                <span v-else class="mr-1">—</span>
              </p>
              <BalTooltip
                v-if="hasExpiredLock"
                :text="$t('veBAL.liquidityMining.votingPowerExpiredTooltip')"
                iconSize="sm"
                :iconName="'alert-triangle'"
                :iconClass="'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors'"
                width="72"
                class="relative top-0.5"
              />
            </div>
          </div>
          <!-- <div class="separator">-</div> -->
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
    margin-bottom: 0.5rem;
  }
  .card-content {
    .title {
      color: #314472;
      font-size: 16px;
      font-weight: 500;
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
