<script setup lang="ts">
import { computed } from 'vue';

import useNumbers from '@/composables/useNumbers';
import { bnum, scale } from '@/lib/utils';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
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
const props = withDefaults(defineProps<Props>(), {});

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */

const votesThisPeriod = computed<string>(() =>
  formatVotesAsPercent(props.gauge.votes)
);

const votesNextPeriod = computed<string>(() =>
  formatVotesAsPercent(props.gauge.votesNextPeriod)
);

const voteDifference = computed<number>(() => {
  return Number(props.gauge.votesNextPeriod) - Number(props.gauge.votes);
});

const voteDifferenceText = computed<string>(() => {
  const text = formatVotesAsPercent(voteDifference.value.toString());
  const prefix = voteDifference.value > 0 ? '+' : '';
  return `${prefix}${text}`;
});

const voteTextClass = computed(() => {
  return {
    'text-green-600': voteDifference.value > 0,
    'text-red-600': voteDifference.value < 0,
  };
});

/**
 * METHODS
 */
function formatVotesAsPercent(votes: string): string {
  const normalizedVotes = scale(bnum(votes), -18);
  return fNum2(normalizedVotes.toString(), {
    style: 'percent',
    maximumFractionDigits: 2,
    fixedFormat: true,
  });
}
</script>

<template>
  <BalTooltip textAlign="left">
    <template #activator>
      <div :class="voteTextClass">
        <div class="mb-2">{{ votesNextPeriod }}</div>
        <BalLoadingBlock v-if="isGaugeAprLoading" class="w-12 h-4" />
        <template v-else-if="gauge.poolVotes">
          <div class="text-right">
            {{ formatNumberToCurrency(gauge.poolVotes) }} (sZ)
          </div>
        </template>
        <template v-else><div class="text-right">-</div></template>
      </div>
    </template>
    <div>
      <div class="mb-2 text-sm font-semibold">
        {{ $t('veBAL.liquidityMining.votesTooltip.title') }}
      </div>
      <div class="text-xs font-normal">
        <div class="mb-2">
          {{
            $t('veBAL.liquidityMining.votesTooltip.thisPeriod', [
              votesThisPeriod,
            ])
          }}
        </div>
        <div class="mb-2">
          {{
            $t('veBAL.liquidityMining.votesTooltip.nextPeriod', [
              votesNextPeriod,
            ])
          }}
          <span :class="voteTextClass">{{ voteDifferenceText }}</span>
        </div>
      </div>
    </div>
  </BalTooltip>
</template>
