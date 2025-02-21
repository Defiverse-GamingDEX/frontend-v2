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
      orderBy: poolsSortField?.value || 'totalLiquidity',
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

    // if (queryArgs.where && filterOptions?.poolIds?.value) {
    //   queryArgs.where.id = { in: filterOptions.poolIds.value };
    // }
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
      fetchArgs.skip = pageParam;
    }
    return fetchArgs;
  }
  const isReady = ref(false);
  // Đồng bộ hóa currentFilterOptions trước khi khởi tạo poolsRepository
  watch(
    () => [filterTokens.value, poolsSortField?.value, filterOptions?.value],
    async (newValues, oldValues) => {
      if (filterOptions?.value) {
        currentFilterOptions.value = filterOptions.value;
        console.log(
          '🚀 ~ currentFilterOptions.value :',
          currentFilterOptions.value
        );
        isReady.value = true;
        try {
          // Khởi tạo repository trước
          poolsRepository = initializePoolsRepository();
          await nextTick();
          // Sau đó mới set isCalling và gọi query
          await queryFn({ pageParam: 0 });
          isReady.value = false;
        } catch (e) {
          console.error('Error fetching pools', e);
          isReady.value = false;
        }
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
    if (!isReady.value) {
      const savedPools = poolsStoreService.pools.value;
      return { pools: savedPools || [], skip: 0 };
    }
    // Bỏ check isCalling ở đây
    if (!poolsRepository) {
      poolsRepository = initializePoolsRepository();
    }

    const fetchOptions = getFetchOptions(pageParam);
    let skip = 0;
    try {
      const pools: Pool[] = await poolsRepository.fetch(fetchOptions);
      console.log('🚀 ~ queryFn ~ pools:', pools);
      skip = poolsRepository.currentProvider?.skip || 0;
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

  options.getNextPageParam = (lastPage: PoolsQueryResponse) => lastPage.skip;

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, options);
}
