import { UseInfiniteQueryOptions } from 'react-query/types';
import { Ref, ref, watch, nextTick } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { POOLS, GAMING_DEX_OWNER_ADDRESS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { Pool } from '@/services/pool/types';
import { isBalancerApiDefined } from '@/lib/utils/balancer/api';
import { useTokens } from '@/providers/tokens.provider';
import { balancerAPIService } from '@/services/balancer/api/balancer-api.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { configService } from '@/services/config/config.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import {
  GraphQLArgs,
  PoolsFallbackRepository,
  PoolsRepositoryFetchOptions,
  PoolRepository as SDKPoolRepository,
} from '@defiverse/balancer-sdk';
import { flatten } from 'lodash';
import useNetwork from '../useNetwork';
import { tokenTreeLeafs } from '../usePool';

type PoolsQueryResponse = {
  pools: Pool[];
  skip?: number;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  poolAddresses?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
  gamingDexOwnerAddress?: string;
  isYukichi?: ComputedRef<boolean>;
  isPermissionless?: ComputedRef<boolean>;
  isVerified?: ComputedRef<boolean>;
};

export default function usePoolsQuery(
  filterTokens: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: Ref<FilterOptions>,
  poolsSortField?: Ref<string>
) {
  const currentFilterOptions = ref(filterOptions);
  const { injectTokens, tokens: tokenMeta } = useTokens();
  const { networkId } = useNetwork();
  let poolsRepository: PoolsFallbackRepository | null = null;

  // Khởi tạo poolsRepository ngay lập tức
  function initializePoolsRepository(): PoolsFallbackRepository {
    const fallbackRepository = new PoolsFallbackRepository(
      buildRepositories(),
      {
        timeout: 30 * 1000,
      }
    );
    return fallbackRepository;
  }

  function initializeDecoratedAPIRepository() {
    return {
      fetch: async (options: PoolsRepositoryFetchOptions): Promise<Pool[]> => {
        const pools = await balancerAPIService.pools.get(getQueryArgs(params));
        const tokens = flatten(
          pools.map(pool => [
            ...pool.tokensList,
            ...tokenTreeLeafs(pool.tokens),
            pool.address,
          ])
        );
        injectTokens(tokens);
        return pools;
      },
      get skip(): number {
        return balancerAPIService.pools.skip;
      },
    };
  }

  function initializeDecoratedSubgraphRepository() {
    return {
      fetch: async (options: PoolsRepositoryFetchOptions): Promise<Pool[]> => {
        const params = getQueryArgs(options);
        console.log('🚀 ~ fetch: ~ params:', params);
        const pools = await balancerSubgraphService.pools.get(params);
        const poolDecorator = new PoolDecorator(pools);
        let decoratedPools = await poolDecorator.decorate(tokenMeta.value);
        const tokens = flatten(
          pools.map(pool => [
            ...pool.tokensList,
            ...tokenTreeLeafs(pool.tokens),
            pool.address,
          ])
        );
        await injectTokens(tokens);
        decoratedPools = await poolDecorator.reCalculateTotalLiquidities();
        return decoratedPools;
      },
      get skip(): number {
        return balancerSubgraphService.pools.skip;
      },
    };
  }

  function buildRepositories() {
    const repositories: SDKPoolRepository[] = [];
    if (isBalancerApiDefined) {
      repositories.push(initializeDecoratedAPIRepository());
    }
    repositories.push(initializeDecoratedSubgraphRepository());
    return repositories;
  }

  function getQueryArgs(options: PoolsRepositoryFetchOptions): GraphQLArgs {
    const isVerified = currentFilterOptions.value?.isVerified ?? false;
    const isPermissionless =
      currentFilterOptions.value?.isPermissionless ?? false;
    const isYukichi = currentFilterOptions.value?.isYukichi ?? false;

    console.log(
      '🚀 ~ getQueryArgs ~  isVerified, isPermissionless, isYukichi:',
      isVerified,
      isPermissionless,
      isYukichi
    );

    const gameDexOwnerAddress = GAMING_DEX_OWNER_ADDRESS;
    const verifiedPools = POOLS.VerifiedPools || [];
    const tokensListFilterOperation = filterOptions?.isExactTokensList
      ? 'eq'
      : 'contains';
    const tokenListFormatted = filterTokens.value.map(address =>
      address.toLowerCase()
    );

    const queryArgs: GraphQLArgs = {
      chainId: configService.network.chainId,
      //orderBy: poolsSortField?.value || 'totalLiquidity',
      orderBy: 'totalLiquidity', // hard because volumne and apr not have in subgraph
      orderDirection: 'desc',
      where: {
        tokensList: { [tokensListFilterOperation]: tokenListFormatted },
        poolType: { not_in: POOLS.ExcludedPoolTypes },
        id: { not_in: POOLS.BlockList },
      },
    };

    if (queryArgs.where) {
      if (isVerified && isPermissionless) {
        delete queryArgs.where.id;
      } else if (isVerified) {
        queryArgs.where.id = { in: verifiedPools };
      } else if (isPermissionless) {
        queryArgs.where.id = { not_in: verifiedPools };
      }

      if (isYukichi) {
        queryArgs.where.owner = { not_in: [gameDexOwnerAddress] };
      }
    }

    if (queryArgs.where && filterOptions?.poolIds?.value) {
      queryArgs.where.id = { in: filterOptions.poolIds.value };
    }
    if (queryArgs.where && filterOptions?.poolAddresses?.value) {
      queryArgs.where.address = { in: filterOptions.poolAddresses.value };
    }
    if (options.first) {
      queryArgs.first = options.first;
    }
    if (options.skip) {
      queryArgs.skip = options.skip;
    }
    if (queryArgs.where) {
      if (isVerified && isPermissionless) {
        delete queryArgs.where.id;
      } else if (isVerified) {
        queryArgs.where.id = { in: verifiedPools };
      } else if (isPermissionless) {
        queryArgs.where.id = { not_in: verifiedPools };
      }

      if (isYukichi) {
        queryArgs.where.owner = { not_in: [gameDexOwnerAddress] };
      }
    }
    console.log('🚀 ~ getQueryArgs ~ queryArgs:', queryArgs);
    return queryArgs;
  }

  function getFetchOptions(pageParam = 0): PoolsRepositoryFetchOptions {
    const fetchArgs: PoolsRepositoryFetchOptions = {};
    if (!filterTokens.value.length) {
      fetchArgs.first = filterOptions?.pageSize || POOLS.Pagination.PerPage;
    }
    if (pageParam && pageParam > 0) {
      fetchArgs.skip = pageParam * POOLS.Pagination.PerPage;
      console.log('🚀 ~ getFetchOptions ~  fetchArgs.skip:', fetchArgs.skip);
    }
    return fetchArgs;
  }
  const isReady = ref(false);
  const isInitialLoad = ref(true);

  // Create ref to track result
  const currentData = ref<PoolsQueryResponse | null>(null);

  watch(
    () => [filterOptions?.value, filterTokens?.value, poolsSortField?.value],
    async (newValues, oldValues) => {
      console.log('🚀 ~ filterOptions?.value:', filterOptions?.value);

      currentFilterOptions.value = filterOptions.value;
      isReady.value = true;

      try {
        if (!poolsRepository) {
          poolsRepository = initializePoolsRepository();
        }

        await nextTick();
        const result = await queryFn({ pageParam: 0 });
        currentData.value = result; // save result to current data
        console.log('🚀 ~ result:', result);
        isInitialLoad.value = false;
        isReady.value = false;
      } catch (e) {
        console.error('Error fetching pools', e);
        isReady.value = false;
      }
    },
    { deep: true, immediate: true }
  );

  const queryKey = QUERY_KEYS.Pools.All(
    networkId,
    filterTokens,
    poolsSortField,
    filterOptions?.poolIds,
    filterOptions?.poolAddresses
  );

  const queryFn = async ({ pageParam = 0 }) => {
    console.log('🚀 ~ queryFn ~ pageParam:', pageParam);
    // if it is merge (pageParam > 0),
    if (pageParam > 0) {
      isReady.value = true;
    } else {
      // if it is filter reset data
      if (query.data?.value) {
        // Instead of directly modifying query.data, use query methods
        await query.remove.value();
        await nextTick();
        // Force a fresh fetch
        await query.refetch.value({
          refetchPage: (page, index) => index === 0,
        });
      }
    }

    if (!isReady.value) {
      const savedPools = poolsStoreService.pools.value;
      return { pools: savedPools || [], skip: 0 };
    }

    if (!poolsRepository) {
      poolsRepository = initializePoolsRepository();
    }

    const fetchOptions = getFetchOptions(pageParam);
    let skip = 0;

    try {
      // Clear store before fetch first time
      if (!isInitialLoad.value) {
        await nextTick();
        poolsStoreService.setPools([]);
      }

      const poolsRs: Pool[] = await poolsRepository.fetch(fetchOptions);
      const pools = poolsRs.map(pool => {
        const verifiedPools = POOLS.VerifiedPools || [];
        const isVerifiedPool = verifiedPools.includes(pool.id);
        return {
          ...pool,
          isVerified: isVerifiedPool || false,
        };
      });

      skip = fetchOptions?.skip || 0;

      await nextTick(); // wait Vue update DOM
      poolsStoreService.setPools(pools);

      return { pools, skip };
    } catch (e) {
      const savedPools = poolsStoreService.pools.value;
      if (savedPools && savedPools.length > 0) {
        return { pools: savedPools || [], skip };
      }
      throw e;
    }
  };

  const infiniteQueryOptions: UseInfiniteQueryOptions<PoolsQueryResponse> = {
    ...options,
    getNextPageParam: (lastPage: PoolsQueryResponse) => {
      console.log('🚀 ~ lastPage:', lastPage);
      return lastPage.skip / POOLS.Pagination.PerPage + 1;
    },
    onSuccess: data => {
      // update currentData
      if (data.pages?.length) {
        const latestPage = data.pages[data.pages.length - 1];
        currentData.value = latestPage;
      }
    },
    // Add these options to control query behavior
    refetchOnWindowFocus: false, // Prevent refetch when window gains focus
    refetchOnMount: false, // Prevent refetch when component mounts
    refetchOnReconnect: false, // Prevent refetch on reconnection
  };

  const query = useInfiniteQuery<PoolsQueryResponse>(
    queryKey,
    queryFn,
    infiniteQueryOptions
  );

  // Thêm currentData vào return value
  return {
    ...query,
    currentData,
  };
}
