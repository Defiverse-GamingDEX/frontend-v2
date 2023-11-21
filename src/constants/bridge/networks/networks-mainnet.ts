import ethereumIcon from '@/assets/images/bridge/networks/ethereum.png';
import polygonIcon from '@/assets/images/bridge/networks/polygon.png';
import defiIcon from '@/assets/images/bridge/networks/defi.png';
import mchIcon from '@/assets/images/bridge/networks/mch.png';
import tcgIcon from '@/assets/images/bridge/networks/tcg.png';
import homeIcon from '@/assets/images/bridge/networks/home.png';
import chainIcon from '@/assets/images/bridge/networks/chain.png';
import saakuruIcon from '@/assets/images/bridge/networks/saakuru.png';
import avalancheIcon from '@/assets/images/bridge/networks/avalanche.png';

import { BRIDGE_ETHEREUM_TOKENS } from '../tokens/mainnet/ethereum-tokens';
import { BRIDGE_POLYGON_TOKENS } from '../tokens/mainnet/polygon-tokens';
import { BRIDGE_DEFIVERSE_TOKENS } from '../tokens/mainnet/defiverse-tokens';
import { BRIDGE_MCHVERSE_TOKENS } from '../tokens/mainnet/mchverse-tokens';
import { BRIDGE_TCGVERSE_TOKENS } from '../tokens/mainnet/tcgverse-tokens';
import { BRIDGE_HOMEVERSE_TOKENS } from '../tokens/mainnet/homeverse-tokens';
import { BRIDGE_CHAINVERSE_TOKENS } from '../tokens/mainnet/chainverse-tokens';
import { BRIDGE_SAKUURU_TOKENS } from '../tokens/mainnet/sakuuru-tokens';

export const BRIDGE_NETWORKS_MAINNET = [
  {
    chain_id: '0x1',
    chain_id_decimals: 1,
    img_url: ethereumIcon,
    name: 'Ethereum',
    gasPrice: null,
    explorer: 'https://etherscan.io',
    rpc: 'https://mainnet.infura.io/v3/',
    bridgeContract: '0x358234b325ef9ea8115291a8b81b7d33a2fa762d',
    type: 'external-chain',
    isOnlyDefiBridge: false,
    isTestnet: false,
    tokens: BRIDGE_ETHEREUM_TOKENS,
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },

  {
    chain_id: '0x89',
    chain_id_decimals: 137,
    img_url: polygonIcon,
    name: 'Polygon',
    gasPrice: null,
    explorer: 'https://polygonscan.com',
    rpc: 'https://polygon-mainnet.infura.io',
    bridgeContract: '0x9B36f165baB9ebe611d491180418d8De4b8f3a1f',
    type: 'external-chain',
    isOnlyDefiBridge: false,
    isTestnet: false,
    tokens: BRIDGE_POLYGON_TOKENS,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000010',
    },
  },
  {
    chain_id: '0x3EF4',
    chain_id_decimals: 16116,
    img_url: defiIcon,
    name: 'Defiverse',
    gasPrice: 5000000000000,
    explorer: 'https://scan.defi-verse.org/',
    rpc: 'https://rpc.defi-verse.org',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    type: 'L2',
    isOnlyDefiBridge: false,
    isTestnet: false,
    tokens: BRIDGE_DEFIVERSE_TOKENS,
    nativeCurrency: {
      name: 'OASYS',
      symbol: 'OAS',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000010',
    },
  },
  {
    chain_id: '0x736C',
    chain_id_decimals: 29548,
    name: 'MCHVerse',
    img_url: mchIcon,
    gasPrice: null,
    explorer: 'https://explorer.oasys.mycryptoheroes.net',
    rpc: 'https://rpc.oasys.mycryptoheroes.net',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    type: 'L2',
    isOnlyDefiBridge: true,
    isTestnet: false,
    tokens: BRIDGE_MCHVERSE_TOKENS,
    nativeCurrency: {
      name: 'OASYS',
      symbol: 'OAS',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000010',
    },
  },
  {
    chain_id: '0x960',
    chain_id_decimals: 2400,
    name: 'TCGVerse',
    img_url: tcgIcon,
    gasPrice: null,
    explorer: 'https://explorer.tcgverse.xyz',
    rpc: 'https://rpc.tcgverse.xyz',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    type: 'L2',
    isOnlyDefiBridge: true,
    isTestnet: false,
    tokens: BRIDGE_TCGVERSE_TOKENS,
    nativeCurrency: {
      name: 'OASYS',
      symbol: 'OAS',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000010',
    },
  },
  {
    chain_id: '0x4a43',
    chain_id_decimals: 19011,
    name: 'HOMEVerse',
    img_url: homeIcon,
    gasPrice: null,
    explorer: 'https://explorer.oasys.homeverse.games',
    rpc: 'https://rpc.mainnet.oasys.homeverse.games',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    type: 'L2',
    isOnlyDefiBridge: true,
    isTestnet: false,
    tokens: BRIDGE_HOMEVERSE_TOKENS,
    nativeCurrency: {
      name: 'OASYS',
      symbol: 'OAS',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000010',
    },
  },
  {
    chain_id: '0x15b3',
    chain_id_decimals: 5555,
    name: 'ChainVerse',
    img_url: chainIcon,
    gasPrice: null,
    explorer: 'https://explorer.chainverse.info',
    rpc: 'https://rpc.chainverse.info',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    type: 'L2',
    isOnlyDefiBridge: true,
    isTestnet: false,
    tokens: BRIDGE_CHAINVERSE_TOKENS,
    nativeCurrency: {
      name: 'OASYS',
      symbol: 'OAS',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000010',
    },
  },
  {
    chain_id: '0x6E4216',
    chain_id_decimals: 7225878,
    name: 'SaakuruVerse',
    img_url: saakuruIcon,
    gasPrice: null,
    explorer: 'https://explorer.saakuru.network',
    rpc: 'https://rpc.saakuru.network',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    type: 'L2',
    isOnlyDefiBridge: true,
    isTestnet: false,
    tokens: BRIDGE_SAKUURU_TOKENS,
    nativeCurrency: {
      name: 'OASYS',
      symbol: 'OAS',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000010',
    },
  },
];
