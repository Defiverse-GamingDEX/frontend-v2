import { UseQueryOptions } from 'react-query/types';
import { reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { gaugesSubgraphService } from '@/services/balancer/gauges/gauges-subgraph.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';

import axios from 'axios';
const MAINNET_API_URL = 'https://price-api.gaming-dex.com/api';
const TESTNET_API_URL = 'https://price-api-testnet.gaming-dex.com/api';
// const TESTNET_API_URL = 'http://localhost:3001/api';

const isTestnet = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
const domain = isTestnet == 'false' ? MAINNET_API_URL : TESTNET_API_URL;

/**
 * TYPES
 */
type QueryResponse = SubgraphGauge[];

/**
 * @summary Fetches guages list from subgraph
 */
export default function useGaugesQuery(
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * QUERY KEY
   */
  // const queryKey = reactive(QUERY_KEYS.Gauges.All.Static());
  const queryKey = reactive(QUERY_KEYS.Gauges.All.Api());

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      // return await gaugesSubgraphService.gauges.get();
      const rs = await axios.get(`${domain}/v1/pools/gauges/hyperevm`);
      return rs?.data.data.liquidityGauges;
    } catch (error) {
      console.error('Failed to fetch gauges', error);
      return [];
    }
  };

  /**
   * QUERY OPTIONS
   */
  // const queryOptions = reactive({
  //   enabled: !isDefiverse.value,
  //   ...options,
  // });

  // Hung: Check me
  const queryOptions = reactive({
    enabled: true,
    ...options,
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
