<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import PoolPageHero from '@/components/heros/PoolPageHero.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import FeaturedProtocols from '@/components/sections/FeaturedProtocols.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import usePools from '@/composables/pools/usePools';
import useBreakpoints from '@/composables/useBreakpoints';
import useNetwork from '@/composables/useNetwork';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';
import axios from 'axios';
import { format } from 'date-fns';

const { account } = useWeb3();
// STATES
const adminAddress = ref(null);
const priceLastUpdated = ref('');
// COMPOSABLES
const { getAdminAddress } = usePoolCreation();
const router = useRouter();
const { appNetworkConfig } = useWeb3();
const isElementSupported = appNetworkConfig.supportsElementPools;
const { selectedTokens, addSelectedToken, removeSelectedToken } =
  usePoolFilters();

const poolsSortField = ref('totalLiquidity');

const { pools, isLoading, poolsIsFetchingNextPage, loadMorePools } = usePools(
  selectedTokens,
  poolsSortField
);
const { upToMediumBreakpoint } = useBreakpoints();
const { networkSlug, networkConfig } = useNetwork();

const isPaginated = computed(() => pools.value.length >= 10);

const isCreatePool = computed(() => {
  if (!adminAddress.value) {
    return false;
  }
  if (adminAddress.value === account.value) {
    return true;
  }
  return false;
});

const lastUpdated = async () => {
  const priceUrl = configService.network.priceUrl;
  const endpoint = `${priceUrl}/price/last-update`;
  const data: any = await axios.get<any>(endpoint).then(({ data }) => {
    return data;
  });

  if (data) return format(new Date(data.last_update), 'yyyy-MM-dd hh:mm:ss');

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

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  adminAddress.value = await getAdminAddress();
  priceLastUpdated.value = await lastUpdated();
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
            <TokenSearchInput
              v-model="selectedTokens"
              class="w-full md:w-2/3"
              @add="addSelectedToken"
              @remove="removeSelectedToken"
            />
            <BalBtn
              v-if="!upToMediumBreakpoint && isCreatePool"
              classCustom="white-blue"
              size="sm"
              :class="{ 'mt-4': upToMediumBreakpoint }"
              :block="upToMediumBreakpoint"
              @click="navigateToCreatePool"
            >
              {{ $t('createAPool.title') }}
            </BalBtn>
          </div>
        </div>
        <PoolsTable
          :data="pools"
          :noPoolsLabel="$t('noPoolsFound')"
          :isLoading="isLoading"
          :selectedTokens="selectedTokens"
          class="mb-8"
          :hiddenColumns="['migrate', 'actions', 'lockEndDate']"
          :isLoadingMore="poolsIsFetchingNextPage"
          :isPaginated="isPaginated"
          skeletonClass="pools-table-loading-height"
          @on-column-sort="onColumnSort"
          @load-more="loadMorePools"
        />
        <div v-if="isElementSupported" class="p-4 xl:p-0 mt-16">
          <FeaturedProtocols />
        </div>
      </BalStack>
    </div>
  </div>
</template>

<style>
.pools-table-loading-height {
  height: 40rem;
}
</style>
