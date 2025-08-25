<script setup lang="ts">
import { getAddress } from '@ethersproject/address';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';

import StakePreviewModal from './StakePreviewModal.vue';
import { StakeAction } from '@/components/contextual/pages/pool/staking/StakePreview.vue';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import MigrateGaugeModal from './MigrateGaugeModal.vue';
import { useBridge } from '@/composables/bridge/useBridge';
import useWeb3 from '@/services/web3/useWeb3';
import useConfig from '@/composables/useConfig';
type Props = {
  pool: Pool;
  gaugeInfo: any; // New prop to receive gauge info
};
const props = defineProps<Props>();

/**
 * STATE
 */
const isMigrateModalVisible = ref(false);
const isStakePreviewVisible = ref(false);
const stakeAction = ref<StakeAction>('stake');

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum2 } = useNumbers();
const { balanceFor } = useTokens();
const {
  isStakablePool,
  isLoading: isLoadingStakingData,
  isRefetchingStakedShares,
  stakedShares,
  hasNonPrefGaugeBalance,
} = usePoolStaking();
const { getBalance } = useBridge();
const { account } = useWeb3();
const legacyStakedShares = ref<any>(0);
const { networkConfig } = useConfig();
/**
 * COMPUTED
 */
const fiatValueOfStakedShares = computed(() => {
  return bnum(props.pool.totalLiquidity) // total $ of gauge
    .div(props.pool.totalShares) // total LP gauge
    .times((stakedShares.value || 0).toString())
    .toString();
});

const fiatValueOfUnstakedShares = computed(() => {
  return bnum(props.pool.totalLiquidity)
    .div(props.pool.totalShares)
    .times(balanceFor(getAddress(props.pool.address)))
    .toString();
});
console.log('🚀 ~ props.pool.address:', props.pool.address);
console.log(
  '🚀 ~ balanceFor(getAddress(props.pool.address))',
  balanceFor(getAddress(props.pool.address))
);
console.log(
  '🚀 ~ fiatValueOfUnstakedShares.value:',
  fiatValueOfUnstakedShares.value
);

// Remove headerTitle computed - we always show 'Staking incentives' as title

const hasLegacyStakedShares = computed(() => {
  return Number(legacyStakedShares.value) > 0;
});

/**
 * METHODS
 */
function showStakePreview() {
  if (fiatValueOfUnstakedShares.value === '0') return;
  stakeAction.value = 'stake';
  isStakePreviewVisible.value = true;
}

function showUnstakePreview() {
  if (fiatValueOfStakedShares.value === '0') return;
  stakeAction.value = 'unstake';
  isStakePreviewVisible.value = true;
}

function handlePreviewClose() {
  isStakePreviewVisible.value = false;
}

function showMigrateModal() {
  isMigrateModalVisible.value = true;
}

function handleMigrateSuccess() {
  // isMigrateModalVisible.value = false;
  // Optionally refresh data here
}

function handleMigrateClose() {
  isMigrateModalVisible.value = false;
}
async function getLegacyStakedShares() {
  console.log(props.gaugeInfo, 'LegacyStakedShares=> props.gaugeInfo');
  const legacy_gauge = props.gaugeInfo?.legacy_gauge;
  console.log('🚀 ~ getLegacyStakedShares ~ legacy_gauge:', legacy_gauge);
  console.log('🚀 ~ getLegacyStakedShares ~ networkConfig:', networkConfig);
  const token = {
    address: legacy_gauge,
    chainId: networkConfig.chainId,
    rpc: networkConfig.rpc,
  };
  const legacy_gauge_user_balane = await getBalance(token, account.value);
  console.log(
    '🚀 ~ getLegacyStakedShares ~ legacy_gauge_user_balane:',
    legacy_gauge_user_balane
  );
  legacyStakedShares.value = legacy_gauge_user_balane;
}
onBeforeMount(() => {
  getLegacyStakedShares();
});
</script>

<template>
  <div>
    <AnimatePresence :isVisible="!isLoadingStakingData">
      <div class="relative">
        <BalAccordion
          :class="['shadow-2xl', { handle: isStakablePool }]"
          :sections="[
            {
              title: $t('staking.stakingIncentives'),
              id: 'staking-incentives',
              handle: 'staking-handle',
              isDisabled: !isStakablePool,
            },
          ]"
          :reCalcKey="hasNonPrefGaugeBalance ? 0 : 1"
        >
          <template #staking-handle>
            <button
              class="p-4 w-full hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <BalStack horizontal justify="between" align="center">
                <BalStack spacing="sm" align="center">
                  <div
                    :class="[
                      'flex items-center p-1 text-white rounded-full',
                      {
                        'bg-green-500': isStakablePool,
                        'bg-gray-400': !isStakablePool,
                      },
                    ]"
                  >
                    <BalIcon v-if="isStakablePool" size="sm" name="check" />
                    <BalIcon v-else size="sm" name="x" />
                  </div>
                  <h6>{{ $t('staking.stakingIncentives') }}</h6>
                </BalStack>
                <BalStack
                  v-if="isStakablePool"
                  horizontal
                  spacing="sm"
                  align="center"
                >
                  <BalIcon name="chevron-down" class="text-blue-500" />
                </BalStack>
              </BalStack>
            </button>
          </template>
          <template #staking-incentives>
            <div class="relative bg-white dark:bg-gray-850 rounded-b-lg">
              <BalStack
                vertical
                spacing="sm"
                class="p-4 rounded-b-lg border-t dark:border-gray-900"
              >
                <!-- Staked LP tokens -->
                <BalStack horizontal justify="between" class="rounded-b-lg">
                  <span>{{ $t('staked') }} {{ $t('lpTokens') }}</span>
                  <BalStack horizontal spacing="sm" align="center">
                    <AnimatePresence :isVisible="isRefetchingStakedShares">
                      <BalLoadingBlock class="h-5" />
                    </AnimatePresence>
                    <AnimatePresence :isVisible="!isRefetchingStakedShares">
                      <span>
                        {{ fNum2(fiatValueOfStakedShares, FNumFormats.fiat) }}
                      </span>
                    </AnimatePresence>
                    <BalTooltip :text="$t('staking.stakedLpTokensTooltip')" />
                  </BalStack>
                </BalStack>

                <!-- Unstaked LP tokens -->
                <BalStack horizontal justify="between">
                  <span>{{ $t('unstaked') }} {{ $t('lpTokens') }}</span>
                  <BalStack horizontal spacing="sm" align="center">
                    <AnimatePresence :isVisible="isRefetchingStakedShares">
                      <BalLoadingBlock class="h-5" />
                    </AnimatePresence>
                    <AnimatePresence :isVisible="!isRefetchingStakedShares">
                      <span>
                        {{ fNum2(fiatValueOfUnstakedShares, FNumFormats.fiat) }}
                      </span>
                    </AnimatePresence>
                    <BalTooltip :text="$t('staking.unstakedLpTokensTooltip')" />
                  </BalStack>
                </BalStack>

                <!-- Normal Stake/Unstake buttons when no legacy tokens -->
                <BalStack horizontal spacing="sm" class="mt-2">
                  <BalBtn
                    color="gradient"
                    size="sm"
                    :disabled="
                      fiatValueOfUnstakedShares === '0' ||
                      hasNonPrefGaugeBalance
                    "
                    @click="showStakePreview"
                  >
                    {{ $t('stake') }}
                  </BalBtn>
                  <BalBtn
                    outline
                    color="blue"
                    size="sm"
                    :disabled="fiatValueOfStakedShares === '0'"
                    @click="showUnstakePreview"
                  >
                    {{ $t('unstake') }}
                  </BalBtn>
                </BalStack>

                <!-- Legacy LP tokens section - only shown when user has legacy staked tokens -->
                <template v-if="hasLegacyStakedShares">
                  <BalStack horizontal justify="between">
                    <span>{{ $t('migratePool.legacyLpTokens') }}</span>
                    <BalStack horizontal spacing="sm" align="center">
                      <AnimatePresence :isVisible="isRefetchingStakedShares">
                        <BalLoadingBlock class="h-5" />
                      </AnimatePresence>
                      <AnimatePresence :isVisible="!isRefetchingStakedShares">
                        <span>
                          {{ fNum2(legacyStakedShares, FNumFormats.number) }}
                        </span>
                      </AnimatePresence>
                    </BalStack>
                  </BalStack>

                  <!-- Migrate button - full width when legacy tokens exist -->
                  <BalBtn
                    color="gradient"
                    size="sm"
                    class="mt-2"
                    block
                    @click="showMigrateModal"
                  >
                    {{ $t('migrate') }}
                  </BalBtn>
                </template>

                <BalAlert
                  v-if="hasNonPrefGaugeBalance"
                  :title="$t('staking.restakeGauge')"
                  class="mt-2"
                >
                  {{ $t('staking.restakeGaugeDescription') }}
                </BalAlert>
              </BalStack>
            </div>
          </template>
        </BalAccordion>
      </div>
    </AnimatePresence>
    <AnimatePresence :isVisible="isLoadingStakingData" unmountInstantly>
      <BalLoadingBlock class="h-12" />
    </AnimatePresence>
    <StakePreviewModal
      :isVisible="isStakePreviewVisible"
      :pool="pool"
      :action="stakeAction"
      @close="handlePreviewClose"
    />
    <MigrateGaugeModal
      :isVisible="isMigrateModalVisible"
      :pool="pool"
      :gaugeInfo="gaugeInfo"
      @close="handleMigrateClose"
      @success="handleMigrateSuccess"
    />
  </div>
</template>

<style>
.handle {
  @apply overflow-hidden rounded-xl;
}

.handle::before {
  @apply absolute left-0 w-full opacity-100;

  content: '';
  top: -2px;
  height: calc(100% + 4px);
  background: linear-gradient(90deg, #4254ff, #f441a5, #ffeb3b, #4254ff);
  background-size: 400%;
  animation: anim-half 3s ease-out both;
  border-radius: 14px;
  z-index: -1;
}

.handle:hover::before {
  animation: anim 12s linear infinite;
}

.handle .bal-card {
  @apply mx-auto;

  width: calc(100% - 4px);
}

@keyframes anim-half {
  from {
    background-position: 0;
  }

  to {
    background-position: 125%;
  }
}

@keyframes anim {
  from {
    background-position: 125%;
  }

  to {
    background-position: 600%;
  }
}
</style>
