<script setup lang="ts">
import { PoolToken } from '@defiverse/balancer-sdk';
import { computed, ref, onBeforeMount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import BalAssetSet from '@/components/_global/BalAsset/BalAssetSet.vue';
import BalChipExpired from '@/components/chips/BalChipExpired.vue';
import BalChipNew from '@/components/chips/BalChipNew.vue';
import IconLimit from '@/components/icons/IconLimit.vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useBreakpoints from '@/composables/useBreakpoints';
import { getNetworkSlug } from '@/composables/useNetwork';
import {
  isStableLike,
  isUnknownType,
  orderedPoolTokens,
  poolURLFor,
  totalAprLabel,
} from '@/composables/usePool';
import { oneSecondInMs } from '@/composables/useTime';
import { orderedTokenURIs } from '@/composables/useVotingGauges';
import { isSameAddress } from '@/lib/utils';
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import useWeb3 from '@/services/web3/useWeb3';
import { differenceInWeeks } from 'date-fns';
import DistributeRewardsBtn from './DistributeRewardsBtn.vue';
import GaugesTableMyVotes from './GaugesTableMyVotes.vue';
import GaugesTableVoteBtn from './GaugesTableVoteBtn.vue';
import GaugeVoteInfo from './GaugeVoteInfo.vue';
import useNumbers from '@/composables/useNumbers';
import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useNetwork from '@/composables/useNetwork';
import gaugeApi from '@/composables/gaugeReward/gauge.api';
import { useTokens } from '@/providers/tokens.provider';
import VotingRewardsModal from '@/components/contextual/pages/pool/VotingRewardsModal.vue';
/**
 * TYPES
 */
type Props = {
  expiredGauges?: Readonly<string[]>;
  data?: VotingGaugeWithVotes[];
  isLoading?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  filterText?: string;
  tabSelect?: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  expiredGauges: () => [] as never[],
  showPoolShares: false,
  noPoolsLabel: 'No pools',
  filterText: '',
  isPaginated: false,
  tabSelect: 'gauge',
  data: () => [],
});
const emit = defineEmits<{
  (e: 'clickedVote', value: VotingGaugeWithVotes): void;
}>();

/**
 * STATE
 */
const adminAddress = ref('');
const gaugesWithApr = ref<VotingGaugeWithVotes[]>([]);
const loadingAprGaugeIds = ref<Set<string>>(new Set());
const hasLoadedPoolDetails = ref(false);
const showVotingRewardsModal = ref(false);
const selectedGaugeForReward = ref<VotingGaugeWithVotes | null>(null);

/**
 * COMPOSABLES
 */
const router = useRouter();
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const { isWalletReady, account } = useWeb3();
const { getAdminAddress } = usePoolCreation();
const { fNum2 } = useNumbers();
const { networkId } = useNetwork();
const { getToken } = useTokens();

/**
 * DATA
 */
const columns = computed(() => {
  return [
    {
      name: t('veBAL.liquidityMining.table.chain'),
      id: 'chain',
      accessor: '',
      Header: 'chainColumnHeader',
      Cell: 'networkColumnCell',
      width: 50,
      noGrow: true,
    },
    {
      name: t('veBAL.liquidityMining.table.assets'),
      id: 'icons',
      accessor: 'uri',
      Header: 'iconColumnHeader',
      Cell: 'iconColumnCell',
      width: 100,
      noGrow: true,
    },
    {
      name: t('veBAL.liquidityMining.table.composition'),
      id: 'poolComposition',
      accessor: 'id',
      Cell: 'poolCompositionCell',
      width: 300,
    },
    {
      name: 'TVL',
      id: 'total_liquidity',
      accessor: 'total_liquidity',
      align: 'right',
      Cell: 'tvlCell',
      sortKey: gauge => Number(gauge.total_liquidity || 0),
      width: 100,
      cellClassName: 'font-numeric',
    },
    // {
    //   name: 'Swap fee',
    //   id: 'swap_fee_rate',
    //   accessor: 'swap_fee_rate',
    //   align: 'right',
    //   Cell: 'swapFeeCell',
    //   Header: 'swapFeeHeader',
    //   sortKey: gauge => Number(gauge.swap_fee_rate || 0),
    //   width: 80,
    //   cellClassName: 'font-numeric',
    // },
    // {
    //   name: 'Next Emission',
    //   id: 'nextEmission',
    //   accessor: 'nextEmission',
    //   align: 'right',
    //   Cell: 'nextEmissionCell',
    //   sortKey: gauge => Number(gauge.nextEmission || 0),
    //   width: 80,
    //   cellClassName: 'font-numeric',
    // },
    {
      name: t('veBAL.liquidityMining.table.nextPeriodVotes'),
      accessor: 'id',
      align: 'right',
      id: 'nextPeriodVotes',
      Cell: 'nextPeriodVotesCell',
      sortKey: gauge => Number(gauge.votesNextPeriod),
      width: 160,
      cellClassName: 'font-numeric',
    },
    {
      name: t('veBAL.liquidityMining.table.myVotes'),
      accessor: 'myVotes',
      align: 'right',
      id: 'myVotes',
      sortKey: gauge => Number(gauge.userVotes),
      width: 60,
      Cell: 'myVotesCell',
      cellClassName: 'font-numeric',
      hidden: !isWalletReady.value,
    },
    {
      name: t('veBAL.liquidityMining.table.nextPeriodApr'),
      Cell: 'nextPeriodAprCell',
      accessor: gauge => gauge.pool?.nextPeriodApr?.min.toString() || '0',
      align: 'right',
      id: 'nextPeriodApr',
      sortKey: gauge => {
        let nextPeriodApr = 0;
        if (gauge.nextPeriodApr) {
          nextPeriodApr = Number(gauge.nextPeriodApr.min || 0);
        }
        return isFinite(nextPeriodApr) ? nextPeriodApr : 0;
      },
      width: 150,
    },
    {
      name: 'Vote Incentives',
      id: 'vote_incentives',
      accessor: 'vote_incentives',
      align: 'right',
      Cell: 'voteIncentivesCell',
      width: 150,
      hidden: props?.tabSelect !== 'gauge',
    },
    {
      name: t('veBAL.liquidityMining.table.vote'),
      id: 'vote',
      accessor: 'id',
      align: 'right',
      Cell: 'voteColumnCell',
      width: 150,
      hidden: !isWalletReady.value || props?.tabSelect !== 'gauge',
    },
    {
      name: t('veBAL.liquidityMining.table.additionalReward'),
      id: 'gaugeReward',
      accessor: 'gaugeReward',
      align: 'right',
      Cell: 'RewardColumnCell',
      width: 110,
      hidden:
        !isWalletReady.value ||
        props?.tabSelect !== 'gauge-reward' ||
        !isAdmin.value,
    },
  ];
});

const dataKey = computed(() =>
  JSON.stringify([gaugesWithApr.value.map(g => g.address), props.filterText])
);

const tableInitialState = computed(() => {
  // When filtering, disable table's internal sort to keep our custom sort order
  if (props.filterText && props.filterText.trim() !== '') {
    return {
      sortColumn: null,
      sortDirection: null,
    };
  }
  // Default sort by next period votes
  return {
    sortColumn: 'nextPeriodVotes',
    sortDirection: 'desc',
  };
});

// COMPUTED
const isAdmin = computed(() => {
  if (!adminAddress.value) {
    return false;
  }
  if (adminAddress.value === account.value) {
    return true;
  }
  return false;
});

/**
 * METHODS
 */
function isInternalUrl(_url: string): boolean {
  //return _url.includes('balancer.fi') || _url.includes('localhost');
  return true;
}

function openVotingRewardsModal(gauge: VotingGaugeWithVotes) {
  selectedGaugeForReward.value = gauge;
  showVotingRewardsModal.value = true;
}

function closeVotingRewardsModal() {
  showVotingRewardsModal.value = false;
  selectedGaugeForReward.value = null;
}

function formatTokenReward(tokenAddress: string, reward: string) {
  const token = getToken(tokenAddress);
  if (!token || !reward) return '-';

  // Convert reward amount from wei to readable format
  const amount = Number(reward) / Math.pow(10, token.decimals || 18);
  const symbol = token.symbol || token.name || 'Unknown';

  return `${fNum2(amount.toString())} ${symbol}`;
}

function redirectToPool(gauge: VotingGaugeWithVotes, inNewTab) {
  const redirectUrl = poolURLFor(gauge.pool, gauge.network);
  if (!isInternalUrl(redirectUrl)) {
    window.location.href = redirectUrl;
  } else {
    const route = router.resolve({
      name: 'pool',
      params: { id: gauge.pool.id, networkSlug: getNetworkSlug(gauge.network) },
    });
    inNewTab ? window.open(route.href) : router.push(route);
  }
}

function getPoolExternalUrl(gauge: VotingGaugeWithVotes) {
  const poolUrl = poolURLFor(gauge.pool, gauge.network);
  return isInternalUrl(poolUrl) ? null : poolUrl;
}

function getIsGaugeNew(addedTimestamp: number): boolean {
  return differenceInWeeks(Date.now(), addedTimestamp * oneSecondInMs) < 2;
}

function getIsGaugeExpired(gaugeAddress: string): boolean {
  return !!props.expiredGauges.some(item => isSameAddress(gaugeAddress, item));
}

function getHasUserVotes(userVotes: string): boolean {
  return !!Number(userVotes);
}

function getTableRowClass(gauge: VotingGaugeWithVotes): string {
  return getHasUserVotes(gauge.userVotes) && getIsGaugeExpired(gauge.address)
    ? 'expired-gauge-row'
    : '';
}

function normalizeSymbol(symbol: string | undefined): string {
  if (!symbol) return '';
  // Convert WOAS to OAS for matching (same logic as TokenPills display)
  return symbol === 'WOAS' ? 'OAS' : symbol;
}

function getSelectedTokens(tokens: PoolToken[]) {
  const filterTextLower = props.filterText?.toLowerCase() || '';
  const selected = tokens
    .filter(token => {
      const normalizedSymbol = normalizeSymbol(token.symbol);
      return normalizedSymbol.toLowerCase() === filterTextLower;
    })
    .map(item => item.address);

  if (selected.length > 0) {
    console.log(
      'Selected tokens for filter "' + props.filterText + '":',
      selected
    );
  }
  return selected;
}

function getPickedTokens(tokens: PoolToken[]) {
  if (!props.filterText) return [];

  const filterTextLower = props.filterText.toLowerCase();
  const picked = tokens
    .filter(token => {
      const normalizedSymbol = normalizeSymbol(token.symbol);
      return normalizedSymbol.toLowerCase().includes(filterTextLower);
    })
    .map(item => item.address);

  return picked;
}

function sortGaugesByFilterText() {
  if (!props.filterText || props.filterText.trim() === '') {
    // Don't reset to props.data if we've already loaded APR data
    // Just keep the current order with APR intact
    console.log('No filter text, keeping current gaugesWithApr order');
    return;
  }

  const filterTextLower = props.filterText.toLowerCase();
  console.log('Sorting by filter text:', filterTextLower);

  // Create a new sorted array
  const sorted = [...gaugesWithApr.value].sort((gaugeA, gaugeB) => {
    const tokensA = gaugeA.pool?.tokens || [];
    const tokensB = gaugeB.pool?.tokens || [];

    // Check for exact match (with WOAS -> OAS conversion)
    const hasExactMatchA = tokensA.some(token => {
      const normalizedSymbol = normalizeSymbol(token.symbol);
      return normalizedSymbol.toLowerCase() === filterTextLower;
    });
    const hasExactMatchB = tokensB.some(token => {
      const normalizedSymbol = normalizeSymbol(token.symbol);
      return normalizedSymbol.toLowerCase() === filterTextLower;
    });

    if (hasExactMatchA && !hasExactMatchB) return -1;
    if (!hasExactMatchA && hasExactMatchB) return 1;

    // Check for partial match (with WOAS -> OAS conversion)
    const hasPartialMatchA = tokensA.some(token => {
      const normalizedSymbol = normalizeSymbol(token.symbol);
      return normalizedSymbol.toLowerCase().includes(filterTextLower);
    });
    const hasPartialMatchB = tokensB.some(token => {
      const normalizedSymbol = normalizeSymbol(token.symbol);
      return normalizedSymbol.toLowerCase().includes(filterTextLower);
    });

    if (hasPartialMatchA && !hasPartialMatchB) return -1;
    if (!hasPartialMatchA && hasPartialMatchB) return 1;

    return 0; // Keep original order
  });

  gaugesWithApr.value = sorted;
  console.log(
    'Sorted. First 3 gauges:',
    gaugesWithApr.value.slice(0, 3).map(g => ({
      tokens: g.pool?.tokens?.map(t => normalizeSymbol(t.symbol)),
    }))
  );
}

function openConfigReward(gauge) {
  router.push({
    name: 'gauge-reward',
    params: {
      id: gauge.pool.id,
      networkSlug: getNetworkSlug(gauge.network),
    },
    query: { returnRoute: 'vebal', gaugeAddress: gauge.address },
  });
}

/**
 * Fetch voting pool details for specific gauges
 */
async function fetchVotingPoolDetailsForGauges(gaugesToFetch: any[]) {
  if (!gaugesToFetch || gaugesToFetch.length === 0) return;

  // Process gauges in batches to avoid too many simultaneous requests
  const batchSize = 5;
  for (let i = 0; i < gaugesToFetch.length; i += batchSize) {
    const batch = gaugesToFetch.slice(i, i + batchSize);

    // Mark these gauges as loading APR
    batch.forEach(gauge => {
      loadingAprGaugeIds.value.add(gauge.pool.id);
    });

    // Create promises for each gauge in the batch
    const promises = batch.map(async (gauge: any) => {
      try {
        const chainId = gauge.network || networkId.value;
        const poolIds = [gauge.pool.id];
        const gaugeIds = [gauge.id];
        const userAddress = account.value;
        const params = {
          chain_id: chainId,
          pool_ids: poolIds,
          gauge_ids: gaugeIds,
          user_address: userAddress,
        };
        const votingPoolDetails = await gaugeApi.getVotingPoolDetails(params);

        if (votingPoolDetails) {
          const detail = votingPoolDetails[`${gauge.pool.id}`];
          return { ...detail, gaugeAddress: gauge.address };
        }
        return null;
      } catch (error) {
        console.error(`Failed to fetch APR for pool ${gauge.pool.id}:`, error);
        return null;
      } finally {
        loadingAprGaugeIds.value.delete(gauge.pool.id);
      }
    });

    // Wait for all promises in the batch to resolve
    const results = await Promise.all(promises);

    // Update gauges with new APR data
    const updatedGauges = gaugesWithApr.value.map(currentGauge => {
      const detail = results.find(
        result => result && result.gaugeAddress === currentGauge.address
      );

      if (detail) {
        return {
          ...currentGauge,
          ...detail,
          pool: {
            ...currentGauge.pool,
            nextPeriodApr: detail.nextPeriodApr,
          },
        };
      }

      return currentGauge;
    });

    gaugesWithApr.value = updatedGauges;
  }

  // Re-apply sorting after fetching pool details
  sortGaugesByFilterText();
}

/**
 * Fetch next period voting pool details
 */
async function fetchVotingPoolDetails() {
  if (!props.data || props.data.length === 0) return;

  // Initialize with all gauges
  gaugesWithApr.value = [...props.data];

  // Process gauges in batches to avoid too many simultaneous requests
  const batchSize = 5;
  for (let i = 0; i < props.data.length; i += batchSize) {
    const batch = props.data.slice(i, i + batchSize);

    // Mark these gauges as loading APR
    batch.forEach(gauge => {
      loadingAprGaugeIds.value.add(gauge.pool.id);
    });

    // Create promises for each gauge in the batch
    const promises = batch.map(async (gauge: any) => {
      try {
        // Fetch the actual pool data using our custom method
        const chainId = gauge.network || networkId.value;
        const poolIds = [gauge.pool.id];
        const gaugeIds = [gauge.address];
        const userAddress = account.value;
        const params = {
          chain_id: chainId,
          pool_ids: poolIds,
          gauge_ids: gaugeIds,
          user_address: userAddress,
        };
        const votingPoolDetails = await gaugeApi.getVotingPoolDetails(params);

        if (votingPoolDetails) {
          const detail = votingPoolDetails[`${gauge.pool.id}`];
          return { ...detail, gaugeAddress: gauge.address }; // Return detail with gaugeAddress
        }
        return null;
      } catch (error) {
        console.error(`Failed to fetch APR for pool ${gauge.pool.id}:`, error);
        return null;
      } finally {
        // Remove this gauge from loading state
        loadingAprGaugeIds.value.delete(gauge.pool.id);
      }
    });

    // Wait for all promises in the batch to resolve
    const results = await Promise.all(promises);
    console.log(
      `Batch ${i / batchSize + 1} results:`,
      results.filter(r => r !== null).length,
      'successful'
    );

    // Update all gauges in one go to avoid race conditions
    const updatedGauges = gaugesWithApr.value.map(currentGauge => {
      // Find if this gauge has updated data in results
      const detail = results.find(
        result => result && result.gaugeAddress === currentGauge.address
      );

      if (detail) {
        console.log(
          `Updating gauge ${currentGauge.address} with APR:`,
          detail.nextPeriodApr
        );
        return {
          ...currentGauge,
          ...detail,
          pool: {
            ...currentGauge.pool,
            nextPeriodApr: detail.nextPeriodApr,
          },
        };
      }

      return currentGauge;
    });

    // Update gaugesWithApr once with all changes
    gaugesWithApr.value = updatedGauges;
    console.log(
      `After batch ${i / batchSize + 1}, total gauges:`,
      gaugesWithApr.value.length
    );
  }

  // Re-apply sorting after fetching pool details
  sortGaugesByFilterText();
}

/**
 * Check if a specific gauge's APR is loading
 */
function isGaugeAprLoading(gauge: VotingGaugeWithVotes): boolean {
  return loadingAprGaugeIds.value.has(gauge.pool.id);
}
function isGaugeAprLoadingFromPoolId(poolId: string): boolean {
  return loadingAprGaugeIds.value.has(poolId);
}

/**
 * WATCHERS
 */
watch(
  () => props.filterText,
  () => {
    console.log('Filter text changed to:', props.filterText);
    sortGaugesByFilterText();
  }
);

watch(
  () => props.data,
  async newData => {
    if (newData && newData.length > 0) {
      // Fetch voting pool details only once when data is first available
      if (!hasLoadedPoolDetails.value) {
        console.log(
          'Fetching voting pool details for',
          newData.length,
          'gauges...'
        );
        gaugesWithApr.value = [...newData]; // Initialize only on first load
        hasLoadedPoolDetails.value = true;
        await fetchVotingPoolDetails();
      } else {
        console.log(
          'Props.data changed but APR already loaded, filtering existing APR data'
        );
        // Filter gaugesWithApr to only show gauges that are in newData
        // This preserves APR data while respecting parent filters (like My Wallet filter)
        const newDataAddresses = new Set(newData.map(g => g.address));
        gaugesWithApr.value = gaugesWithApr.value.filter(gauge =>
          newDataAddresses.has(gauge.address)
        );

        // Add any new gauges from newData that aren't in gaugesWithApr yet
        const existingAddresses = new Set(
          gaugesWithApr.value.map(g => g.address)
        );
        const newGauges = newData.filter(
          g => !existingAddresses.has(g.address)
        );
        if (newGauges.length > 0) {
          console.log(
            'Adding',
            newGauges.length,
            'new gauges and fetching their APR...'
          );
          gaugesWithApr.value = [...gaugesWithApr.value, ...newGauges];
          // Fetch APR for new gauges
          await fetchVotingPoolDetailsForGauges(newGauges);
        }

        // Re-sort if needed
        sortGaugesByFilterText();
      }
    }
  },
  { immediate: true }
);

// LIFE CYCLES
onBeforeMount(async () => {
  adminAddress.value = await getAdminAddress();
});
</script>

<template>
  <BalCard
    shadow="lg"
    class="mt-4"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :key="dataKey"
      :columns="columns"
      :data="gaugesWithApr"
      :isLoading="isLoading"
      skeletonClass="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :isPaginated="isPaginated"
      :href="{ getHref: gauge => getPoolExternalUrl(gauge) }"
      :onRowClick="redirectToPool"
      :getTableRowClass="getTableRowClass"
      :initialState="tableInitialState"
      :pin="{
        pinOn: 'address',
        pinnedData: ['0xE867AD0a48e8f815DC0cda2CDb275e0F163A480b'],
      }"
    >
      <template #chainColumnHeader>
        <div class="flex items-center">
          <NetworkIcon />
        </div>
      </template>
      <template #networkColumnCell="{ network }">
        <div v-if="!isLoading" class="py-4 px-6">
          <div
            class="flex justify-center items-center w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded shadow-sm"
          >
            <img
              :src="buildNetworkIconURL(getNetworkSlug(network))"
              :alt="network"
              class="w-6 h-6"
            />
          </div>
        </div>
      </template>
      <template #iconColumnHeader>
        <div class="flex items-center">
          <CompositionIcon />
        </div>
      </template>
      <template #iconColumnCell="gauge">
        <div v-if="!isLoading" class="py-4 px-6">
          <BalAssetSet :logoURIs="orderedTokenURIs(gauge)" :width="100" />
        </div>
      </template>
      <template
        #poolCompositionCell="{ pool, address, addedTimestamp, swap_fee_rate }"
      >
        <div v-if="!isLoading" class="flex items-center py-4 px-6">
          <TokenPills
            :tokens="orderedPoolTokens(pool, pool.tokens)"
            :isStablePool="
              isStableLike(pool.poolType) || isUnknownType(pool.poolType)
            "
            :selectedTokens="getSelectedTokens(pool.tokens)"
            :pickedTokens="getPickedTokens(pool.tokens)"
          />
          <BalChipNew v-if="getIsGaugeNew(addedTimestamp)" class="ml-2" />
          <BalChipExpired v-if="getIsGaugeExpired(address)" class="ml-2" />
          <BalTooltip text="Swap Fee" :delayMs="50" width="auto" class="ml-2">
            <template #activator>
              <div class="text-black swap-fee-pill">
                <BalLoadingBlock
                  v-if="isGaugeAprLoadingFromPoolId(pool.id)"
                  class="w-16 h-4"
                />
                <template v-else-if="swap_fee_rate >= 0">
                  <div class="break-all">{{ swap_fee_rate || 0 }}%</div>
                </template>
                <template v-else> -%</template>
              </div>
            </template>
          </BalTooltip>
        </div>
      </template>
      <template #tvlCell="gauge">
        <div v-if="!isLoading" class="py-4 px-2 text-right">
          <BalLoadingBlock v-if="isGaugeAprLoading(gauge)" class="w-16 h-4" />
          <template v-else-if="gauge.total_liquidity >= 0">
            <div class="break-all">
              {{ fNum2(gauge.total_liquidity, { style: 'currency' }) }}
            </div>
          </template>
          <template v-else> - </template>
        </div>
      </template>
      <!-- <template #swapFeeCell="gauge">
        <div v-if="!isLoading" class="py-4 px-2 text-right">
          <BalLoadingBlock v-if="isGaugeAprLoading(gauge)" class="w-16 h-4" />
          <template v-else-if="gauge.swap_fee_rate >= 0">
            {{ gauge.swap_fee_rate }}%
          </template>
          <template v-else> - </template>
        </div>
      </template> -->
      <!-- <template #nextEmissionCell="gauge">
        <div v-if="!isLoading" class="py-4 px-2 text-right">
          <BalLoadingBlock v-if="isGaugeAprLoading(gauge)" class="w-16 h-4" />
          <template v-else-if="gauge.nextEmission">
            {{ fNum2(gauge.nextEmission, { style: 'decimal' }) }} sZ
          </template>
          <template v-else> - </template>
        </div>
      </template> -->
      <template #nextPeriodVotesCell="gauge">
        <!-- Put to BalLazy the most expensive to render component -->
        <BalLazy>
          <div v-if="!isLoading" class="flex justify-end py-4 px-6">
            <GaugeVoteInfo
              :gauge="gauge"
              :isGaugeAprLoading="isGaugeAprLoading(gauge)"
            />
            <div class="flex justify-end w-6">
              <IconLimit
                v-if="gauge.pool.symbol === 'veBAL'"
                size="sm"
                amount="10"
                :tooltip="
                  $t(
                    'veBAL.liquidityMining.limitsTooltip.distributionsCappedVeBAL'
                  )
                "
              />
              <IconLimit
                v-else-if="
                  gauge.relativeWeightCap !== 'null' &&
                  gauge.relativeWeightCap !== '1'
                "
                size="sm"
                :amount="(Number(gauge.relativeWeightCap) * 100).toFixed()"
                :tooltip="
                  $t(
                    'veBAL.liquidityMining.limitsTooltip.distributionsCappedAt',
                    [(Number(gauge.relativeWeightCap) * 100).toFixed()]
                  )
                "
              />
            </div>
          </div>
        </BalLazy>
      </template>
      <template #myVotesCell="gauge">
        <div v-if="!isLoading" class="py-4 px-2 text-right">
          <GaugesTableMyVotes
            :gauge="gauge"
            :isGaugeAprLoading="isGaugeAprLoading(gauge)"
          />
        </div>
      </template>
      <template #nextPeriodAprCell="gauge">
        <div class="flex justify-end py-4 px-2 text-right font-numeric">
          <BalLoadingBlock v-if="isGaugeAprLoading(gauge)" class="w-12 h-4" />
          <template v-else-if="gauge.pool?.nextPeriodApr">
            <span
              v-if="
                totalAprLabel(gauge.pool.nextPeriodApr, gauge.pool.boost) !== -1
              "
              >{{
                totalAprLabel(gauge.pool.nextPeriodApr, gauge.pool.boost)
              }}</span
            >
            <span v-else> &#8734; </span>
            <APRTooltip :pool="gauge.pool" :isNextPeriodApr="true" />
          </template>
          <template v-else> - </template>
        </div>
      </template>
      <template #voteIncentivesCell="gauge">
        <div class="px-4 text-xs text-right">
          <div v-if="gauge.vote_incentives?.tokens?.length" class="space-y-1">
            <div
              v-for="(tokenAddress, index) in gauge.vote_incentives.tokens"
              :key="tokenAddress"
              class="flex justify-end items-center space-x-1"
            >
              <BalAsset
                :address="tokenAddress"
                :iconURI="getToken(tokenAddress)?.logoURI"
                :size="16"
              />
              <span class="break-words">
                {{
                  formatTokenReward(
                    tokenAddress,
                    gauge.vote_incentives.rewards[index]
                  )
                }}
              </span>
            </div>
          </div>
          <div v-else class="text-gray-400">-</div>
        </div>
      </template>
      <template #voteColumnCell="gauge">
        <div v-if="isWalletReady" class="px-4 space-y-1">
          <GaugesTableVoteBtn
            :hasUserVotes="getHasUserVotes(gauge.userVotes)"
            :isGaugeExpired="getIsGaugeExpired(gauge.address)"
            @click.stop.prevent="emit('clickedVote', gauge)"
          />
          <div
            class="w-full text-xs text-blue-600 hover:text-blue-500 break-words cursor-pointer !mt-2"
            @click.stop.prevent="openVotingRewardsModal(gauge)"
          >
            <span class="block ml-6 break-words"
              >+ increase vote incentives</span
            >
          </div>
        </div>
      </template>
      <template #RewardColumnCell="gauge">
        <BalBtn
          size="sm"
          :label="$t('veBAL.liquidityMining.table.additionalReward')"
          classCustom="pink-white config-reward"
          block
          @click.stop.prevent="openConfigReward(gauge)"
        />
      </template>
      <template #swapFeeHeader>
        <div class="flex justify-end items-center">
          <h5 class="text-base">Swap fee</h5>
          <BalTooltip
            text="Swap Fee (this period)"
            iconSize="sm"
            iconClass="text-gray-400 dark:text-gray-600"
            width="72"
            class="ml-1"
          />
        </div>
      </template>
    </BalTable>
  </BalCard>
  <div
    v-if="isAdmin && tabSelect === 'gauge-reward'"
    class="mt-4 distribution-btn-container"
  >
    <DistributeRewardsBtn />
  </div>

  <!-- Voting Rewards Modal -->
  <VotingRewardsModal
    v-if="showVotingRewardsModal && selectedGaugeForReward"
    :pool="{
      tokens: selectedGaugeForReward.pool?.tokens || [],
      name: selectedGaugeForReward.pool?.symbol || 'Pool',
      id: selectedGaugeForReward.pool?.id || '',
      address: selectedGaugeForReward.pool?.address || '',
      tokenLogoURIs: selectedGaugeForReward.tokenLogoURIs || {},
    }"
    :gaugeAddress="selectedGaugeForReward.address"
    @close="closeVotingRewardsModal"
    @success="closeVotingRewardsModal"
  />
</template>

<style lang="scss">
tr.expired-gauge-row {
  @apply bg-red-50  hover:bg-red-100 dark:border-red-600 dark:border;
}
.config-reward {
  &.bal-btn {
    line-height: normal;
    font-size: 14px;
    padding-left: 0px;
    padding-right: 0px;
    width: 80%;
    margin: 0 auto;
  }
}
.distribution-btn-container {
  display: flex;
  justify-content: flex-end;
}
.swap-fee-pill {
  @apply flex items-center px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900 text-sm font-medium;
  @apply text-blue-700 dark:text-blue-200;
  @apply cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800;
}
.space-y-1 > * + * {
  margin-top: 0.25rem;
  @apply transition-colors duration-150;
}
</style>
