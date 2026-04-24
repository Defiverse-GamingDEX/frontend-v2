<script setup lang="ts">
import { computed, ref, reactive, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import VerifiedIcon from '@/assets/images/pools/verified.png';
import YukichiIcon from '@/assets/images/pools/yukichi.png';
import PoolPageHero from '@/components/heros/PoolPageHero.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import FeaturedProtocols from '@/components/sections/FeaturedProtocols.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import usePools from '@/composables/pools/usePools';
import poolPriceApi from '@/composables/pools/pool.price.api.js';
import useBreakpoints from '@/composables/useBreakpoints';
import { getBalancer } from '@/dependencies/balancer-sdk';
import { getTimeTravelBlock } from '@/composables/useSnapshots';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { bnum } from '@/lib/utils';
import PoolService from '@/services/pool/pool.service';
import type { Pool } from '@/services/pool/types';
import usePoolAprQuery from '@/composables/queries/usePoolAprQuery';
import useNetwork from '@/composables/useNetwork';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';
import axios from 'axios';
import { format } from 'date-fns';
import { EXCLUDED_POOL_IDS } from '@/constants/excludedPools';

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
console.log('🚀 ~ selectedTokens:', selectedTokens);

const poolsSortField = ref('totalLiquidity');

const filterOptions = computed(() => {
  return {
    isVerified: filterState.isVerified,
    isPermissionless: filterState.isPermissionless,
    isYukichi: filterState.isYukichi,
  };
});
const {
  pools: rawPools2,
  isLoading: isLoading2,
  poolsIsFetchingNextPage: poolsIsFetchingNextPage2,
  poolsHasNextPage: poolsHasNextPage2,
  loadMorePools: loadMorePools2,
} = usePools(selectedTokens, poolsSortField, filterOptions);

// New pools state using the searchPoolList API
const rawPools = ref<any[]>([]);
const isLoading = ref(false);
const poolsIsFetchingNextPage = ref(false);
const poolsHasNextPage = ref(false);
const currentOffset = ref(0);
const isFetchingApr = ref(false);
const isFetchingSnapshots = ref(false);
const snapshotsCache = ref<any[]>([]);
const pageSize = 30;

// Computed property to filter out the excluded pools
const filteredPools = computed(() => {
  const filtered = rawPools.value.filter(
    pool => !EXCLUDED_POOL_IDS.includes(pool.id)
  );
  const excludedCount = rawPools.value.length - filtered.length;
  if (excludedCount > 0) {
    console.log(
      `🚫 Excluded ${excludedCount} pool(s) from the excluded pools list`
    );
  }
  return filtered;
});

// Function to clean and validate token address
const cleanTokenAddress = (address: string) => {
  if (!address) return '';

  // Remove double 0x prefix if it exists
  let cleanedAddress = address.replace(/^0x0x/, '0x');

  // Ensure address starts with 0x
  if (!cleanedAddress.startsWith('0x')) {
    cleanedAddress = '0x' + cleanedAddress;
  }

  // Validate address format (should be 42 characters: 0x + 40 hex chars)
  if (!/^0x[a-fA-F0-9]{40}$/.test(cleanedAddress)) {
    console.warn('Invalid token address format:', address, '→', cleanedAddress);
  }

  return cleanedAddress;
};

// Function to fetch pool snapshots from 24h ago
const fetchPoolSnapshots = async (poolIds: string[]) => {
  try {
    const blockNumber = await getTimeTravelBlock();
    const block = { number: blockNumber };
    const isInPoolIds = { id: { in: poolIds } };

    const snapshots = await balancerSubgraphService.pools.get({
      where: isInPoolIds,
      block,
    });

    console.log('🕐 Fetched pool snapshots from 24h ago:', snapshots.length);
    return snapshots;
  } catch (error) {
    console.error('❌ Failed to fetch pool snapshots:', error);
    return [];
  }
};

// Function to calculate 24h volume snapshot using subgraph data
const calculateVolumeSnapshot = (currentPool: any, poolSnapshot: any) => {
  if (!poolSnapshot) {
    return '0'; // No snapshot data available
  }

  const currentVolume = bnum(currentPool.totalSwapVolume || '0');
  const snapshotVolume = bnum(poolSnapshot.totalSwapVolume || '0');
  const volumeSnapshot = currentVolume.minus(snapshotVolume).toString();

  return volumeSnapshot;
};

// Function to update pools with volumeSnapshot
const updatePoolsWithVolumeSnapshot = async (pools: any[], reset: boolean) => {
  if (pools.length === 0) return;

  try {
    let snapshots: any[] = [];

    if (reset) {
      // Fetch fresh snapshots for new data
      isFetchingSnapshots.value = true;
      const poolIds = pools.map(pool => pool.id);
      snapshots = await fetchPoolSnapshots(poolIds);
      snapshotsCache.value = snapshots;
      console.log('✅ Fetched fresh snapshots');
    } else if (snapshotsCache.value.length > 0) {
      // Use cached snapshots for pagination
      snapshots = snapshotsCache.value;
      console.log('✅ Using cached snapshots');
    } else {
      // No snapshots available, set default values
      pools.forEach(pool => {
        pool.volumeSnapshot = '0';
      });
      return;
    }

    // Update pools with calculated volumeSnapshot
    pools.forEach(pool => {
      const snapshot = snapshots.find(s => s.id === pool.id);
      pool.volumeSnapshot = calculateVolumeSnapshot(pool, snapshot);
    });

    console.log('✅ Updated pools with volumeSnapshot');
  } catch (error) {
    console.error('❌ Failed to calculate volumeSnapshot:', error);
    // Set default volumeSnapshot if calculation fails
    pools.forEach(pool => {
      pool.volumeSnapshot = '0';
    });
  } finally {
    if (reset) {
      isFetchingSnapshots.value = false;
    }
  }
};

// Function to transform API response to Pool format
const transformApiPoolToPool = (apiPool: any) => {
  // Clean and transform tokens
  const cleanedTokens = (apiPool.tokens || []).map((token: any) => {
    const originalAddress = token.address;
    const cleanedAddress = cleanTokenAddress(token.address);

    if (originalAddress !== cleanedAddress) {
      console.log(
        '🔧 Cleaned token address:',
        originalAddress,
        '→',
        cleanedAddress
      );
    }

    return {
      ...token,
      address: cleanedAddress,
    };
  });

  // Create clean tokensList from cleaned tokens
  const cleanedTokensList = cleanedTokens.map((token: any) => token.address);

  return {
    id: apiPool.id || '',
    name: apiPool.name || '',
    address: cleanTokenAddress(apiPool.address || ''),
    chainId: apiPool.chainId || userNetworkId.value,
    poolType: apiPool.poolType || 'Weighted',
    poolTypeVersion: apiPool.poolTypeVersion || 0,
    swapFee: apiPool.swapFee || '0',
    swapEnabled: apiPool.swapEnabled !== false,
    protocolYieldFeeCache: apiPool.protocolYieldFeeCache || '',
    protocolSwapFeeCache: apiPool.protocolSwapFeeCache || '',
    owner: apiPool.owner || '',
    factory: apiPool.factory || '',
    symbol: apiPool.symbol || '',
    tokens: cleanedTokens,
    tokensList: cleanedTokensList,
    tokenAddresses: apiPool.tokenAddresses || cleanedTokensList,
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
    volumeSnapshot: apiPool.volumeSnapshot || '0', // API should provide 24h volume
    isVerified: apiPool.is_verified,
    isYukichi: apiPool.is_yukichi,
    apr: apiPool.apr || null,
  };
};

// Function to get filter type based on current filter state
const getFilterType = () => {
  if (filterOptions.value.isVerified) return 'verified';
  if (filterOptions.value.isYukichi) return 'yukichi';
  if (filterOptions.value.isPermissionless) return 'permission_less';
  return null; // default to verified if no filter selected
};

// Function to get order field based on sort field
const getOrderField = () => {
  console.log(
    '🚀 ~ getOrderField ~ poolsSortField.value:',
    poolsSortField.value
  );
  switch (poolsSortField.value) {
    case 'totalLiquidity':
      return 'total_liquidity';
    case 'volume':
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
  console.log(
    '🚀 loadPools called with reset:',
    reset,
    'Stack:',
    new Error().stack?.split('\n')[2]
  );
  try {
    if (reset) {
      currentOffset.value = 0;
      isLoading.value = true;
    } else {
      poolsIsFetchingNextPage.value = true;
    }

    const filterType = getFilterType();
    console.log('🔍 Using filter type:', filterType);

    // Prepare token addresses for filtering
    const tokenAddresses = selectedTokens.value.filter(Boolean);
    console.log('🔍 Token addresses for filtering:', tokenAddresses);

    const apiParams = {
      filter_type: filterType,
      chain_id: getCurrentChainId(),
      order_field: getOrderField(),
      order_type: 'desc',
      offset: currentOffset.value,
      limit: pageSize,
      tokens: tokenAddresses.length > 0 ? tokenAddresses : undefined,
    };

    console.log('🚀 API call params:', apiParams);
    const response = await poolPriceApi.searchPoolList(apiParams);

    // Handle different response structures
    const poolsData = response.pools || response.data || response || [];
    const poolRender = poolsData.map(pool => transformApiPoolToPool(pool));
    if (reset) {
      rawPools.value = poolRender;
    } else {
      rawPools.value = [...rawPools.value, ...poolRender];
    }

    // Update pagination state
    poolsHasNextPage.value = poolRender.length === pageSize;
    currentOffset.value += pageSize;

    // Update pools with volumeSnapshot
    await updatePoolsWithVolumeSnapshot(poolRender, reset);

    // Fetch APR data after pools are loaded and table is rendered
    if (poolRender.length > 0) {
      // Use nextTick to ensure table is rendered before fetching APR
      await nextTick();
      console.log('🚀 Table rendered, starting APR fetch...');
      fetchAprData();
    }
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
 * Build repositories for a specific chainId to fetch complete pool data
 */
const buildRepositoriesForChainId = (chainId: number, targetPoolId: string) => {
  const repositories: any[] = [];

  // Create a subgraph repository for the specific chainId
  const subgraphRepository = {
    fetch: async (): Promise<any[]> => {
      try {
        // Get the network config for the chainId
        const networkConfig = configService.getNetworkConfig(chainId);

        // Use the first subgraph URL from the network config
        const subgraphUrl = networkConfig.subgraphs.main[0];

        const response = await fetch(subgraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetPool($id: String!) {
                pool(id: $id) {
                  id
                  address
                  poolType
                  swapFee
                  totalShares
                  totalLiquidity
                  totalSwapVolume
                  totalSwapFee
                  tokens {
                    address
                    balance
                    weight
                    symbol
                    name
                    decimals
                  }
                  swapsCount
                  holdersCount
                }
              }
            `,
            variables: {
              id: targetPoolId.toLowerCase(),
            },
          }),
        });

        const data = await response.json();

        if (data.errors) {
          console.error('Subgraph query errors:', data.errors);
          return [];
        }

        if (!data.data.pool) {
          console.warn(`Pool ${targetPoolId} not found in subgraph`);
          return [];
        }

        // Convert the response to a Pool object
        const pool = {
          ...data.data.pool,
          chainId,
        };

        console.log(`📊 Fetched complete pool data for ${targetPoolId}:`, pool);
        return [pool];
      } catch (error) {
        console.error('Error fetching from subgraph:', error);
        return [];
      }
    },
    get skip(): number {
      return 0;
    },
  };

  repositories.push(subgraphRepository);
  return repositories;
};

// Function to fetch complete pool data from subgraph
const fetchCompletePoolData = async (poolId: string, chainId: number) => {
  try {
    const repositories = buildRepositoriesForChainId(chainId, poolId);
    const pools = await repositories[0].fetch();
    return pools.length > 0 ? pools[0] : null;
  } catch (error) {
    console.error(`Failed to fetch complete pool data for ${poolId}:`, error);
    return null;
  }
};

// Function to fetch APR data for pools after table is rendered
const fetchAprData = async () => {
  try {
    console.log('🚀 ~ fetchAprData ~ rawPools.value:', rawPools.value);
    isFetchingApr.value = true;

    // Process pools in batches to avoid overwhelming the API
    const batchSize = 5;
    const pools = rawPools.value;

    for (let i = 0; i < pools.length; i += batchSize) {
      const batch = pools.slice(i, i + batchSize);

      // Process batch in parallel using direct SDK call
      const aprPromises = batch.map(async (pool, index) => {
        try {
          // Fetch complete pool data first
          const completePoolData = await fetchCompletePoolData(
            pool.id,
            pool.chainId || getCurrentChainId()
          );

          const poolToUse = completePoolData
            ? {
                ...pool,
                ...completePoolData,
              }
            : pool;

          console.log(
            `🚀 ~ fetchAprData ~ poolToUse[${i + index}]:`,
            poolToUse
          );

          // Fetch APR data from Balancer SDK directly
          const aprData = await getBalancer().pools.apr(poolToUse);
          console.log(`🚀 ~ fetchAprData ~ pool[${i + index}] APR:`, aprData);

          // Update the pool with APR data
          const poolIndex = rawPools.value.findIndex(p => p.id === pool.id);
          if (poolIndex !== -1) {
            rawPools.value[poolIndex].apr = aprData;
          }
        } catch (error) {
          console.error(`❌ Failed to fetch APR for pool ${pool.id}:`, error);
        }
      });

      // Wait for current batch to complete
      await Promise.all(aprPromises);

      // Small delay between batches to be nice to the API
      if (i + batchSize < pools.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('✅ APR fetch completed for all pools');
  } catch (error) {
    console.error('❌ Error fetching APR data:', error);
  } finally {
    isFetchingApr.value = false;
  }
};

/**
 * METHODS
 */
function navigateToCreatePool() {
  router.push({ name: 'create-pool', params: { networkSlug } });
}

function onColumnSort(columnId: string) {
  console.log('🚀 ~ onColumnSort ~ columnId:', columnId);
  poolsSortField.value = columnId;
}

// Handlers cho các toggle events
function onVerifiedChange(value: boolean) {
  if (value) {
    // Nếu chọn Verified, tắt 2 cái còn lại
    filterState.isVerified = true;
    filterState.isPermissionless = false;
    filterState.isYukichi = false;
  } else {
    filterState.isVerified = false;
  }
  // Reload pools với filter mới
  loadPools(true);
}

function onPermissionlessChange(value: boolean) {
  if (value) {
    // Nếu chọn Permissionless, tắt 2 cái còn lại
    filterState.isVerified = false;
    filterState.isPermissionless = true;
    filterState.isYukichi = false;
  } else {
    filterState.isPermissionless = false;
  }
  // Reload pools với filter mới
  loadPools(true);
}

function onYukichiChange(value: boolean) {
  if (value) {
    // Nếu chọn Yukichi, tắt 2 cái còn lại
    filterState.isVerified = false;
    filterState.isPermissionless = false;
    filterState.isYukichi = true;
  } else {
    filterState.isYukichi = false;
  }
  // Reload pools với filter mới
  loadPools(true);
}

function loadMore() {
  loadMorePools();
}

// Watch for sort field changes and reload pools
watch(poolsSortField, (newSort, oldSort) => {
  console.log('� Sort changed:', oldSort, '→', newSort);
  if (newSort === 'totalLiquidity') {
    loadPools(true);
  }
});

// Watch for selected tokens changes and reload pools
watch(
  selectedTokens,
  (newTokens, oldTokens) => {
    console.log('🔄 Selected tokens changed:', oldTokens, '→', newTokens);
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

                <!-- <div class="flex gap-2 items-center toggle-custom">
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
                </div> -->
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
          :data="filteredPools"
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
        <!-- <div v-if="isElementSupported" class="p-4 xl:p-0 mt-16">
          <FeaturedProtocols />
        </div> -->
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
