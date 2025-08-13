<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import VerifiedIcon from '@/assets/images/pools/verified.png';
import YukichiIcon from '@/assets/images/pools/yukichi.png';
import PoolPageHero from '@/components/heros/PoolPageHero.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import FeaturedProtocols from '@/components/sections/FeaturedProtocols.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import usePoolFilters from '@/composables/pools/usePoolFilters';

import poolPriceApi from '@/composables/pools/pool.price.api.js';
import useBreakpoints from '@/composables/useBreakpoints';
import useNetwork from '@/composables/useNetwork';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';
import axios from 'axios';
import { format } from 'date-fns';

const { account } = useWeb3();
// STATES
const adminAddress = ref<string | null>(null);
const priceLastUpdated = ref('');
const filterState = reactive({
  isVerified: false,
  isPermissionless: false,
  isYukichi: false,
});
// COMPOSABLES
const { getAdminAddress } = usePoolCreation();
const router = useRouter();
const { appNetworkConfig, chainId: userNetworkId } = useWeb3();
const isElementSupported = appNetworkConfig.supportsElementPools;
const { selectedTokens, addSelectedToken, removeSelectedToken } =
  usePoolFilters();

const poolsSortField = ref('totalLiquidity');

const filterOptions = computed(() => {
  return {
    isVerified: filterState.isVerified,
    isPermissionless: filterState.isPermissionless,
    isYukichi: filterState.isYukichi,
  };
});

// New pools state using the searchPoolList API
const rawPools = ref<any[]>([]);
const isLoading = ref(false);
const poolsIsFetchingNextPage = ref(false);
const poolsHasNextPage = ref(false);
const currentOffset = ref(0);
const pageSize = 30;

// Function to transform API response to Pool format
const transformApiPoolToPool = (apiPool: any) => {
  return {
    id: apiPool.id || '',
    name: apiPool.name || '',
    address: apiPool.address || '',
    chainId: apiPool.chainId || userNetworkId.value, // missing chainId
    poolType: apiPool.poolType || '',
    poolTypeVersion: apiPool.poolTypeVersion || null,
    swapFee: apiPool.swapFee || '0',
    swapEnabled: apiPool.swapEnabled || false,
    protocolYieldFeeCache: apiPool.protocolYieldFeeCache || '',
    protocolSwapFeeCache: apiPool.protocolSwapFeeCache || '',
    owner: apiPool.owner || '',
    factory: apiPool.factory || '',
    symbol: apiPool.symbol || '',
    tokens: apiPool.tokens || [],
    tokensList: apiPool.tokensList || [],
    tokenAddresses: apiPool.tokenAddresses || [], // missing tokenAddresses
    totalLiquidity: apiPool.totalLiquidity || '0',
    totalShares: apiPool.totalShares || '0',
    totalSwapFee: apiPool.totalSwapFee || '0',
    totalSwapVolume: apiPool.totalSwapVolume || '0',
    priceRateProviders: apiPool.priceRateProviders || [],
    createTime: apiPool.createTime || null,
    totalWeight: apiPool.totalWeight || '0',
    lowerTarget: apiPool.lowerTarget || '',
    upperTarget: apiPool.upperTarget || '',
    isNew: apiPool.isNew || false, // missing isNew
    unwrappedTokens: apiPool.unwrappedTokens || [], // missing unwrappedTokens
    onchain: apiPool.onchain || null, // missing onchain
    feesSnapshot: apiPool.feesSnapshot || '0',
    volumeSnapshot: apiPool.volumeSnapshot || '0', // missing volumeSnapshot
    isVerified: apiPool.is_verified,
    isYukichi: apiPool.is_yukichi,
    apr: apiPool.apr || null, // missing apr
    // Add other required Pool properties with defaults
  };
};

// Computed property to properly unwrap and transform the pools array
const pools = computed(() => {
  console.log('🚀 ~ rawPools.value in computed:', rawPools.value);
  // Transform API response to Pool format and remove Vue proxy wrappers
  const transformedPools = rawPools.value.map(pool =>
    transformApiPoolToPool(pool)
  );
  console.log('🚀 ~ transformedPools[0]:', transformedPools[0]);
  const finalPools = JSON.parse(JSON.stringify(transformedPools));
  console.log('🚀 ~ finalPools[0]:', finalPools[0]);
  return finalPools;
});

console.log('🚀 ~ rawPools:', rawPools);
// Function to get filter type based on current filter state
const getFilterType = () => {
  if (filterOptions.value.isVerified) return 'verified';
  if (filterOptions.value.isYukichi) return 'yukichi';
  if (filterOptions.value.isPermissionless) return 'permission_less';
  return null; // default
};

// Function to get order field based on sort field
const getOrderField = () => {
  switch (poolsSortField.value) {
    case 'totalLiquidity':
      return 'total_liquidity';
    case 'totalSwapVolume':
      return 'total_swap_volume';
    default:
      return 'total_liquidity';
  }
};

// Function to get current chain ID
const getCurrentChainId = () => {
  const { networkId } = useNetwork();
  return networkId.value;
};

// Function to load pools
const loadPools = async (reset = false) => {
  try {
    if (reset) {
      currentOffset.value = 0;
      isLoading.value = true;
    } else {
      poolsIsFetchingNextPage.value = true;
    }

    const filterType = getFilterType();

    const response = await poolPriceApi.searchPoolList({
      filter_type: filterType,
      chain_id: getCurrentChainId(),
      order_field: getOrderField(),
      order_type: 'desc',
      offset: currentOffset.value,
      limit: pageSize,
    });

    // Handle different response structures
    const poolsData = response.pools || response.data || response || [];
    console.log('🚀 ~ loadPools ~ poolsData:', poolsData);
    console.log('🚀 ~ loadPools ~ poolsData[0]:', poolsData[0]);
    const poolRender = poolsData.map(pool => transformApiPoolToPool(pool));
    console.log('🚀 ~ loadPools ~ poolRender:', poolRender);
    if (reset) {
      rawPools.value = poolRender;
    } else {
      rawPools.value = [...rawPools.value, ...poolRender];
    }

    // Update pagination state
    poolsHasNextPage.value = poolRender.length === pageSize;
    currentOffset.value += pageSize;
  } catch (error) {
    console.error('Error loading pools:', error);
  } finally {
    isLoading.value = false;
    poolsIsFetchingNextPage.value = false;
  }
};

// Function to load more pools (for pagination)
const loadMorePools = () => {
  if (!poolsIsFetchingNextPage.value && poolsHasNextPage.value) {
    loadPools(false);
  }
};

const { upToMediumBreakpoint } = useBreakpoints();
const { networkSlug, networkConfig } = useNetwork();

const isPaginated = computed(() => poolsHasNextPage?.value);

const isCreatePool = computed(() => {
  // if (!adminAddress.value) {
  //   return false;
  // }
  // if (adminAddress.value === account.value) {
  //   return true;
  // }
  // return false;
  return true;
});

const lastUpdated = async () => {
  const priceUrl = configService.network.priceUrl;
  const endpoint = `${priceUrl}/price/last-update`;
  const data: any = await axios.get<any>(endpoint).then(({ data }) => {
    return data;
  });

  if (data) return format(new Date(data.last_update), 'yyyy-MM-dd HH:mm:ss');

  return '';
};

/**
 * METHODS
 */
function navigateToCreatePool() {
  router.push({ name: 'create-pool', params: { networkSlug } });
}

function onColumnSort(columnId: string) {
  poolsSortField.value = columnId;
}

// Handlers cho các toggle events
function onVerifiedChange(value: boolean) {
  filterState.isVerified = value;
}

function onPermissionlessChange(value: boolean) {
  filterState.isPermissionless = value;
}

function onYukichiChange(value: boolean) {
  filterState.isYukichi = value;
}

function loadMore() {
  loadMorePools();
}

// Watch for filter changes and reload pools
watch(
  [filterOptions, poolsSortField],
  () => {
    loadPools(true);
  },
  { deep: true }
);

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  adminAddress.value = await getAdminAddress();
  priceLastUpdated.value = await lastUpdated();
  // Load initial pools
  await loadPools(true);
});
</script>

<template>
  <div>
    <PoolPageHero />
    <div class="xl:container xl:px-4 pt-10 md:pt-8 xl:mx-auto">
      <BalStack vertical>
        <div class="px-4 xl:px-0">
          <div class="flex justify-between items-end mb-2 text-white">
            <h3>
              {{ networkConfig.chainName }}
              <span class="lowercase">{{ $t('pools') }}</span>
            </h3>

            <div v-if="priceLastUpdated">
              <span style="font-size: 14px">Token price last updated: </span>
              <span style="font-size: 14px">{{ priceLastUpdated }}</span>
            </div>

            <BalBtn
              v-if="upToMediumBreakpoint && isCreatePool"
              color="blue"
              size="sm"
              outline
              :class="{ 'mt-4': upToMediumBreakpoint }"
              @click="navigateToCreatePool"
            >
              {{ $t('createAPool.title') }}
            </BalBtn>
          </div>

          <div
            class="flex flex-col md:flex-row justify-between items-end lg:items-center w-full"
          >
            <div class="flex flex-col md:flex-row gap-4 w-full">
              <TokenSearchInput
                v-model="selectedTokens"
                @add="addSelectedToken"
                @remove="removeSelectedToken"
              />

              <div class="flex gap-6 items-center">
                <div class="flex gap-2 items-center toggle-custom">
                  <BalToggle
                    :modelValue="filterState.isVerified"
                    name="verified"
                    :showLabel="false"
                    @update:model-value="onVerifiedChange"
                  />
                  <span class="flex items-center text-sm text-white">
                    <img
                      :src="VerifiedIcon"
                      alt="Verified Pool"
                      class="verified-icon"
                    />Verified</span
                  >
                </div>

                <div class="flex gap-2 items-center toggle-custom">
                  <BalToggle
                    :modelValue="filterState.isPermissionless"
                    name="permissionless"
                    :showLabel="false"
                    @update:model-value="onPermissionlessChange"
                  />
                  <span class="text-sm text-white">Permissionless</span>
                </div>

                <div class="flex gap-2 items-center toggle-custom">
                  <BalToggle
                    :modelValue="filterState.isYukichi"
                    name="yukichi"
                    :showLabel="false"
                    @update:model-value="onYukichiChange"
                  />
                  <span class="flex items-center text-sm text-white">
                    <img
                      :src="YukichiIcon"
                      alt="yukichi Pool"
                      class="mr-1 verified-icon"
                    />Yukichi</span
                  >
                </div>
              </div>
            </div>
            <div class="flex gap-4 items-center">
              <BalBtn
                v-if="!upToMediumBreakpoint && isCreatePool"
                classCustom="white-blue w-max"
                size="sm"
                :class="{ 'mt-4': upToMediumBreakpoint }"
                :block="upToMediumBreakpoint"
                @click="navigateToCreatePool"
              >
                {{ $t('createAPool.title') }}
              </BalBtn>
            </div>
          </div>
        </div>
        <PoolsTable
          :data="rawPools"
          :noPoolsLabel="$t('noPoolsFound')"
          :isLoading="isLoading"
          :selectedTokens="selectedTokens"
          class="mb-8"
          :hiddenColumns="['migrate', 'actions', 'lockEndDate']"
          :isLoadingMore="poolsIsFetchingNextPage"
          :isPaginated="isPaginated"
          skeletonClass="pools-table-loading-height"
          @on-column-sort="onColumnSort"
          @load-more="loadMore"
        />
        <div v-if="isElementSupported" class="p-4 xl:p-0 mt-16">
          <FeaturedProtocols />
        </div>
      </BalStack>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pools-table-loading-height {
  height: 40rem;
}
.toggle-custom {
  :deep(.bal-toggle) {
    width: initial;
  }
  :deep(.bal-toggle-track) {
    background: #003852;
    width: 48px;
  }
  :deep(.bal-toggle-checkbox) {
    border-color: #fff;
  }
  :deep(.bal-toggle-checkbox:checked) {
    border-color: #fff;
  }
  :deep(.bal-toggle-checkbox:checked + .toggle-icon + .bal-toggle-track) {
    background: orange;
  }
}
</style>
