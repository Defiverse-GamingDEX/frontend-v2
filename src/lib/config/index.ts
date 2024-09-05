import { Network } from '@defiverse/balancer-sdk';

import arbitrum from './arbitrum.json';
import defiverseTestnet from './defiverse-testnet.json';
import defiverse from './defiverse.json';
import docker from './docker.json';
import goerli from './goerli.json';
import homestead from './homestead.json';
import optimism from './optimism.json';
import polygon from './polygon.json';
import test from './test.json';

// network for bridge
import avalancheTestnet from './avalanche-testnet.json';
import chainverse from './chainverse.json';
import homeverse from './homeverse.json';
import mchverse from './mchverse.json';
import oasys from './oasys.json';
import oasysTestnet from './oasys-testnet.json';
import saakuru from './saakuru.json';
import tcgverse from './tcgverse.json';
export interface Config {
  key: string;
  chainId: Network | 12345 | 17;
  chainName: string;
  name: string;
  shortName: string;
  slug: string;
  network: string;
  unknown: boolean;
  rpc: string;
  priceUrl?: string;
  publicRpc?: string;
  ws: string;
  explorer: string;
  explorerName: string;
  subgraph: string;
  balancerApi?: string;
  poolsUrlV2: string;
  subgraphs: {
    main: string[];
    aave: string;
    gauge: string;
    blocks: string;
  };
  supportsEIP1559: boolean;
  supportsElementPools: boolean;
  blockTime: number;
  nativeAsset: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    deeplinkId: string;
    logoURI: string;
    minTransactionBuffer: string;
  };
  addresses: {
    merkleRedeem: string;
    merkleOrchard: string;
    multicall: string;
    vault: string;
    weightedPoolFactory: string;
    stablePoolFactory: string;
    weth: string;
    rETH: string;
    stMATIC: string;
    stETH: string;
    wstETH: string;
    lidoRelayer: string;
    balancerHelpers: string;
    batchRelayer: string;
    batchRelayerV4: string;
    veBAL: string;
    gaugeController: string;
    gaugeFactory: string;
    balancerMinter: string;
    tokenAdmin: string;
    veDelegationProxy: string;
    veBALHelpers: string;
    feeDistributor: string;
    feeDistributorDeprecated: string;
    faucet: string;
    gaugeRewardsHelper?: string;
    oracle?: string;
  };
  keys: {
    infura: string;
    alchemy: string;
    graph?: string;
    balancerApi?: string;
  };
  strategies: Record<
    string,
    {
      type: string;
      name: string;
    }
  >;
  gauges: {
    type: number;
    weight: number;
  };
}

const config: Record<Network | number, Config> = {
  [Network.MAINNET]: homestead,
  [Network.GOERLI]: goerli,
  [Network.POLYGON]: polygon,
  [Network.ARBITRUM]: arbitrum,
  [Network.OPTIMISM]: optimism,
  [Network.DEFIVERSE]: defiverse,
  [Network.DEFIVERSE_TESTNET]: defiverseTestnet,
  [Network.OASYS]: oasys,
  [Network.OASYS_TESTNET]: oasysTestnet,
  12345: test,
  // @ts-ignore
  17: docker,
  29548: mchverse,
  2400: tcgverse,
  19011: homeverse,
  5555: chainverse,
  7225878: saakuru,
  43113: avalancheTestnet,
};

export default config;
