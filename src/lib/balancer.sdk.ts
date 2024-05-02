import { isTestMode } from '@/plugins/modes';
import { configService } from '@/services/config/config.service';
import { BalancerSDK, Network } from '@defiverse/balancer-sdk';
import { ref } from 'vue';

const network = ((): Network => {
  switch (configService.network.key) {
    case '1':
      return Network.MAINNET;
    case '5':
      return Network.GOERLI;
    case '137':
      return Network.POLYGON;
    case '42161':
      return Network.ARBITRUM;
    case '16116':
      return Network.DEFIVERSE;
    case '17117':
      return Network.DEFIVERSE_TESTNET;
    default:
      return Network.MAINNET;
  }
})();

export const balancer = new BalancerSDK({
  network,
  rpcUrl: configService.rpc,
  customSubgraphUrl: configService.network.subgraph,
});

export const hasFetchedPoolsForSor = ref(false);

export async function fetchPoolsForSor() {
  if (hasFetchedPoolsForSor.value) return;
  try {
    await balancer.swaps.fetchPools();
    hasFetchedPoolsForSor.value = true;
  } catch (error) {
    console.log("🚀 ~ fetchPoolsForSor ~ error:", error)
    
  }
 
}

if (!isTestMode()) fetchPoolsForSor();
