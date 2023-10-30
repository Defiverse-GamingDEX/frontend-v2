import ethereumIcon from '@/assets/images/bridge/networks/ethereum.png';
import polygonIcon from '@/assets/images/bridge/networks/polygon.png';
import defiIcon from '@/assets/images/bridge/networks/defi.png';
import mchIcon from '@/assets/images/bridge/networks/mch.png';
import tcgIcon from '@/assets/images/bridge/networks/tcg.png';
import homeIcon from '@/assets/images/bridge/networks/home.png';
import chainIcon from '@/assets/images/bridge/networks/chain.png';
import saakuruIcon from '@/assets/images/bridge/networks/saakuru.png';
import avalancheIcon from '@/assets/images/bridge/networks/avalanche.png';

import { BRIDGE_DEFI_TOKENS } from '../tokens/testnet/defi-tokens';
import { BRIDGE_GOERLI_TOKENS } from '../tokens/testnet/goerli-tokens';

export const BRIDGE_NETWORKS_TESTNET = [
  {
    chain_id: '0x5',
    chain_id_decimals: 5,
    img_url: ethereumIcon,
    name: 'Ethereum Testnet',
    gasPrice: null,
    explorer: 'https://goerli.etherscan.io/',
    rpc: 'https://goerli.blockpi.network/v1/rpc/public',
    bridgeContract: '0x358234b325ef9ea8115291a8b81b7d33a2fa762d',
    type: 'L1',
    isOnlyDefiBridge: false,
    isTestnet: true,
    tokens: BRIDGE_GOERLI_TOKENS,
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    chain_id: '0xA869',
    chain_id_decimals: 43113,
    img_url: avalancheIcon,
    name: 'AVAX Testnet',
    gasPrice: null,
    explorer: 'https://testnet.snowtrace.io/',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    bridgeContract: '0xe95e3a9f1a45b5eda71781448f6047d7b7e31cbf',
    type: 'L1',
    isOnlyDefiBridge: false,
    isTestnet: true,
    tokens: [],
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
  },

  {
    chain_id: '0x42DD',
    chain_id_decimals: 17117,
    name: 'Defiverse Testnet',
    img_url: defiIcon,
    gasPrice: 50000000000,
    explorer: 'https://scan-testnet.defi-verse.org',
    rpc: 'https://rpc-testnet.defi-verse.org',
    bridgeContract: '0x4200000000000000000000000000000000000010',
    type: 'L2',
    isOnlyDefiBridge: false,
    isTestnet: true,
    tokens: [],
    nativeCurrency: {
      name: 'OASYS',
      symbol: 'OAS',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000010',
    },
  },
];
