
<script setup lang="ts">
import { computed } from 'vue';
import { isSameAddress, scale } from '@/lib/utils';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import BigNumber from 'bignumber.js';
import useNumbers from '@/composables/useNumbers';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import { useI18n } from 'vue-i18n';
import {
  isVotingTimeLocked,
  remainingVoteLockTime,
} from '@/composables/useVeBAL';
import TimelockIcon from '@/components/_global/icons/TimelockIcon.vue';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';
import { formatNumberToCurrency } from '@/lib/utils/index';
/**
 * TYPES
 */
type Props = {
  gauge: VotingGaugeWithVotes;
  isGaugeAprLoading: boolean;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum2 } = useNumbers();
const { gaugesUsingUnderUtilizedVotingPower } = useVotingEscrowLocks();

const myVotes = computed(() => {
  const normalizedVotes = scale(new BigNumber(props.gauge.userVotes), -4);
  return fNum2(normalizedVotes.toString(), {
    style: 'percent',
    maximumFractionDigits: 2,
  });
});
const myVotesValue = computed(() => {
  return formatNumberToCurrency(props.gauge.myVotes || '0', 10);
});
console.log(myVotesValue.value, 'myVotesValue');
const poolHasUnderUtilizedVotingPoewer = computed<boolean>(
  () =>
    !!gaugesUsingUnderUtilizedVotingPower.value.find(gauge =>
      isSameAddress(gauge.address, props.gauge.address)
    )
);
</script>

<template>
  <div
    :class="{
      'flex justify-end items-center': true,
      'text-red-600': poolHasUnderUtilizedVotingPoewer,
    }"
  >
    <div>
      <div class="mb-2 text-right">{{ myVotes }}</div>
      <BalLoadingBlock v-if="isGaugeAprLoading" class="w-12 h-4" />
      <template v-else-if="Number(myVotesValue) > 0">
        <div class="text-right">{{ myVotesValue }} (sZ)</div>
      </template>
      <template v-else><div class="text-right">-</div></template>
    </div>
    <BalTooltip
      v-if="isVotingTimeLocked(gauge.lastUserVoteTime)"
      textAlign="left"
    >
      <template #activator>
        <TimelockIcon />
      </template>
      <div>
        <span class="font-semibold">
          {{
            $t('veBAL.liquidityMining.popover.warnings.votedTooRecently.title')
          }}
        </span>
        <p class="text-gray-500">
          {{
            $t(
              'veBAL.liquidityMining.popover.warnings.votedTooRecently.description',
              [remainingVoteLockTime(gauge.lastUserVoteTime)]
            )
          }}
        </p>
      </div>
    </BalTooltip>
    <BalTooltip
      v-else-if="poolHasUnderUtilizedVotingPoewer"
      template
      textAlign="left"
      width="60"
    >
      <template #activator>
        <BalIcon class="ml-1" name="alert-triangle" size="sm" />
      </template>
      <div class="flex flex-col gap-1">
        <span class="font-semibold"
          >{{ t('veBAL.liquidityMining.resubmit.hint.title') }}
        </span>
        <span>
          {{ t('veBAL.liquidityMining.resubmit.hint.description') }}
        </span>
      </div>
    </BalTooltip>
  </div>
</template>

