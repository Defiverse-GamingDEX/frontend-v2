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
interface Props {
  pool?: any;
  gaugeAddress?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pool: undefined,
  gaugeAddress: undefined,
});

/**
 * COMPOSABLES
 */
const {
  isWalletReady,
  startConnectWithInjectedProvider,
  getProvider,
  account,
} = useWeb3();
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
  console.log('🚀 ~ getVoteRewardAmounts ~ props.pool:', props.pool);
  console.log(
    '🚀 ~ getVoteRewardAmounts ~ props.gaugeAddress:',
    props.gaugeAddress
  );

  if (!props.gaugeAddress) {
    console.log('❌ ~ No gauge address available');
    rewardList.value = [];
    return;
  }

  try {
    const provider = getProvider();
    console.log('🚀 ~ getVoteRewardAmounts ~ provider:', provider);
    console.log('🚀 ~ getVoteRewardAmounts ~ account:', account.value);
    console.log(
      '🚀 ~ getVoteRewardAmounts ~ gauge_address:',
      props.gaugeAddress
    );

    let rs = await getRewardAmounts(props.gaugeAddress, provider);
    console.log('🚀 ~ getVoteRewardAmounts ~ raw response:', rs);

    if (rs) {
      const data = rs.map(item => {
        console.log('🚀 ~ processing item:', item);
        const token = getToken(item.token);
        console.log('🚀 ~ found token:', token, 'for address:', item.token);

        if (!token) {
          console.log('❌ ~ Token not found for address:', item.token);
          return null;
        }

        const convertedAmount = BigNumber(item.amount)
          .div(10 ** token.decimals)
          .toFixed();
        return {
          ...item,
          convertedAmount,
          token,
        };
      });
      console.log('🚀 ~ getVoteRewardAmounts ~ processed data:', data);

      if (data) {
        rewardList.value = data.filter(t => !!t) || [];
        console.log(
          '🚀 ~ getVoteRewardAmounts ~ final rewardList.value:',
          rewardList.value
        );
      }
    } else {
      console.log('❌ ~ getRewardAmounts returned empty/null');
    }
  } catch (error) {
    console.log('❌ ~ getVoteRewardAmounts error:', error);
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
        <!-- <div class="flex justify-between title-container">
          <div class="text-sm">Token</div>
          <div class="text-sm">Pending Rewards</div>
        </div> -->
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
      :pool="{
        ...props.pool,
        tokenLogoURIs: props.pool?.tokens?.reduce((acc: any, token: any) => {
          const tokenInfo = getToken(token.address);
          if (tokenInfo?.logoURI) {
            acc[token.address] = tokenInfo.logoURI;
          }
          return acc;
        }, {}) || {}
      }"
      :gaugeAddress="props.gaugeAddress"
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
