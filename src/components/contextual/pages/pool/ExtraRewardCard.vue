<script setup lang="ts">
import { useRouter } from 'vue-router';
import BigNumber from 'bignumber.js';
import useNetwork from '@/composables/useNetwork';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import { useGaugeReward } from '@/composables/gaugeReward/useGaugeReward';
/**
 * TYPES
 */
type Props = {
  pool: Pool;
  gaugeAddress: string;
  streamerAddress: string;
};
/**
 * STATS
 */
// const gaugeAddress = ref('');
/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { isWalletReady, startConnectWithInjectedProvider, getProvider } =
  useWeb3();
const { networkSlug } = useNetwork();
const router = useRouter();
const { getRewardAmounts } = useGaugeReward();
const { getToken } = useTokens();

const rewardList = ref<any>([]);

async function getGaugeRewardAmounts() {
  if (!props.gaugeAddress) {
    rewardList.value = [];
    return;
  }
  try {
    const provider = getProvider();
    let rs = await getRewardAmounts(props.gaugeAddress, provider);
    if (rs) {
      const data = rs.map(item => {
        const token = getToken(item.token);
        if (!token) return null;

        const convertedAmount = BigNumber(item.amount)
          .div(10 ** token.decimals)
          .toFixed();
        return {
          ...item,
          convertedAmount,
          token,
        };
      });

      if (data) {
        rewardList.value = data.filter(t => !!t) || [];
      }
    }
  } catch (error) {
    console.log('getGaugeRewardAmounts error :', error);
  }
}

/**
 * METHODS
 */

function openAddRewardsPage() {
  router.push({
    path: `/${networkSlug}/user-gauge-reward/${props.pool.id}`,
    query: {
      returnRoute: 'pool',
      gaugeAddress: props.gaugeAddress,
      streamer: props.streamerAddress,
    },
  });
}
/**
 * CYCLES
 */
watch(
  () => props.gaugeAddress,
  newVal => {
    getGaugeRewardAmounts();
  }
);
/**
 * EXPOSE
 */
// defineExpose({ getTokenList });
</script>

<template>
  <BalCard v-if="gaugeAddress" shadow="2xl" noPad class="rounded-xl">
    <template #header>
      <div class="card-header">
        <h5>{{ $t('Extra Rewards') }}</h5>
      </div>
    </template>
    <div class="py-2">
      <BalStack vertical spacing="sm" class="py-2 px-4">
        <BalStack
          v-for="(item, index) in rewardList"
          :key="index"
          horizontal
          justify="between"
        >
          <span>{{ item.token.name }}</span>
          <BalStack horizontal spacing="sm" align="center">
            <span>{{ item.convertedAmount }} </span>
          </BalStack>
        </BalStack>
      </BalStack>
      <BalStack spacing="sm" class="px-4 mt-2">
        <BalBtn
          v-if="isWalletReady"
          color="gradient"
          block
          @click.prevent="openAddRewardsPage"
        >
          {{ $t('Add Rewards') }}
        </BalBtn>

        <BalBtn
          v-else
          :label="$t('connectWallet')"
          color="gradient"
          block
          @click="startConnectWithInjectedProvider"
        />
      </BalStack>
    </div>
  </BalCard>
</template>

<style scoped>
.card-header {
  @apply p-4 w-full flex items-center justify-between;
  @apply border-b dark:border-gray-700;
}
</style> 