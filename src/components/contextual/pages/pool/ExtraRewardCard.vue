<script setup lang="ts">
import { useRouter } from 'vue-router';
import BigNumber from 'bignumber.js';
import useNetwork from '@/composables/useNetwork';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import { useGaugeReward } from '@/composables/gaugeReward/useGaugeReward';
import { ref } from 'vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
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
const { fNum2 } = useNumbers();
const rewardList = ref<any>([]);
const isCollapsed = ref(false);

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
      console.log('🚀 ~ getGaugeRewardAmounts ~ data:', data);

      if (data) {
        rewardList.value = data.filter(t => !!t) || [];
        console.log(
          '🚀 ~ getGaugeRewardAmounts ~ rewardList.value:',
          rewardList.value
        );
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

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
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
onMounted(async () => {
  await getGaugeRewardAmounts();
});
/**
 * EXPOSE
 */
// defineExpose({ getTokenList });
</script>

<template>
  <BalCard v-if="gaugeAddress" shadow="2xl" noPad class="rounded-xl">
    <template #header>
      <div class="flex justify-between items-center card-header">
        <h5>{{ $t('Extra Rewards') }}</h5>
        <span class="cursor-pointer" @click="toggleCollapse">
          <svg
            :class="{ 'rotate-180': !isCollapsed, 'rotate-0': isCollapsed }"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
            />
          </svg>
        </span>
      </div>
    </template>
    <div class="py-2">
      <BalStack v-show="!isCollapsed" vertical spacing="sm" class="py-2 px-4">
        <div class="flex justify-between title-container">
          <div class="text-sm">Token</div>
          <div class="text-sm">Remaining</div>
        </div>
        <BalStack
          v-for="(item, index) in rewardList"
          :key="index"
          horizontal
          justify="between"
        >
          <span class="flex items-center">
            <BalAsset
              :address="item.token.address"
              :iconURI="item.token.logoURI"
              :size="24"
              class="!mr-2"
            />
            <span class="font-bold text-gray-800">{{ item.token.name }}</span>
          </span>
          <BalStack horizontal spacing="sm" align="center">
            <span class="font-bold text-gray-800">
              {{ fNum2(item.convertedAmount, FNumFormats.token) }}
            </span>
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