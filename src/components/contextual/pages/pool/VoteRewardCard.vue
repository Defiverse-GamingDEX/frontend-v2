<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import BigNumber from 'bignumber.js';
import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import { useVoteRewardScheduler } from '@/composables/voteRewardScheduler/useVoteRewardScheduler';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import VotingRewardsModal from './VotingRewardsModal.vue';

/**
 * TYPES
 */
// No props needed for VoteRewardCard

/**
 * COMPOSABLES
 */
const { isWalletReady, startConnectWithInjectedProvider, getProvider } =
  useWeb3();
const { getRewardAmounts } = useVoteRewardScheduler();
const { getToken } = useTokens();
const { fNum2 } = useNumbers();

/**
 * STATE
 */
const rewardList = ref<any>([]);
const isCollapsed = ref(false);
const showVotingRewardsModal = ref(false);

/**
 * METHODS
 */
async function getVoteRewardAmounts() {
  if (!isWalletReady.value) {
    rewardList.value = [];
    return;
  }
  try {
    const provider = getProvider();
    let rs = await getRewardAmounts(provider);
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
      console.log('🚀 ~ getVoteRewardAmounts ~ data:', data);

      if (data) {
        rewardList.value = data.filter(t => !!t) || [];
        console.log(
          '🚀 ~ getVoteRewardAmounts ~ rewardList.value:',
          rewardList.value
        );
      }
    }
  } catch (error) {
    console.log('getVoteRewardAmounts error :', error);
  }
}

function openVotingRewardsModal() {
  showVotingRewardsModal.value = true;
}

function closeVotingRewardsModal() {
  showVotingRewardsModal.value = false;
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

/**
 * WATCHERS
 */
watch(
  () => isWalletReady.value,
  () => {
    getVoteRewardAmounts();
  }
);

/**
 * LIFECYCLE
 */
onMounted(async () => {
  await getVoteRewardAmounts();
});
</script>

<template>
  <BalCard shadow="2xl" noPad class="rounded-xl">
    <template #header>
      <div class="flex justify-between items-center card-header">
        <h5>{{ $t('Voting Rewards') }}</h5>
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
          <div class="text-sm">Pending Rewards</div>
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
          @click.prevent="openVotingRewardsModal"
        >
          {{ $t('Add Reward') }}
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

    <!-- Voting Rewards Modal -->
    <VotingRewardsModal
      v-if="showVotingRewardsModal"
      @close="closeVotingRewardsModal"
      @success="getVoteRewardAmounts"
    />
  </BalCard>
</template>

<style scoped>
.card-header {
  @apply p-4 w-full flex items-center justify-between;
  @apply border-b dark:border-gray-700;
}
</style>
