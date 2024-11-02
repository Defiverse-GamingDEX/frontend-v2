import chainIcon from '@/assets/images/bridge/networks/chain.png';
import defiIcon from '@/assets/images/bridge/networks/defi.png';
import ethereumIcon from '@/assets/images/bridge/networks/ethereum.png';
import homeIcon from '@/assets/images/bridge/networks/home.png';
import mchIcon from '@/assets/images/bridge/networks/mch.png';
import oasIcon from '@/assets/images/bridge/networks/oas.png';
import polygonIcon from '@/assets/images/bridge/networks/polygon.png';
import saakuruIcon from '@/assets/images/bridge/networks/saakuru.png';
import tcgIcon from '@/assets/images/bridge/networks/tcg.png';
import { default as IL1StandardBridge } from '@/lib/abi/bridge/IL1StandardBridge.json';
import { default as IL2ERC20Bridge } from '@/lib/abi/bridge/IL2ERC20Bridge.json';
import { default as cBridgeABI } from '@/lib/abi/bridge/cBridge.json';
import { chain } from 'lodash';
export const BRIDGE_NETWORKS_MAINNET = [
  {
    chain_id: '0x1',
    chain_id_decimals: 1,
    chain_name: 'ethereum',
    img_url: ethereumIcon,
    name: 'Ethereum',
    gasPrice: null,
    explorer: 'https://etherscan.io',
    rpc: 'https://eth.merkle.io',
    bridgeContract: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820', // cBridge
    bridgeABI: cBridgeABI,
    type: 'external-chain',
    isOnlyDefiBridge: false,
    isTestnet: false,
    //tokens: BRIDGE_ETHEREUM_TOKENS,
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },

  {
    chain_id: '0x89',
    chain_id_decimals: 137,
    chain_name: 'polygon',
    img_url: polygonIcon,
    name: 'Polygon',
    gasPrice: null,
    explorer: 'https://polygonscan.com',
    rpc: 'https://polygon.rpc.subquery.network/public',
    bridgeContract: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78', //cBridge
    bridgeABI: cBridgeABI,
    type: 'external-chain',
    isOnlyDefiBridge: false,
    isTestnet: false,
    //tokens: BRIDGE_POLYGON_TOKENS,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000010',
    },
  },
  {
    chain_id: '0xf8',
    chain_id_decimals: 248,
    chain_name: 'oasys',
    img_url: oasIcon,
    name: 'OASYS Mainnet',
    gasPrice: null,
    explorer: 'https://explorer.oasys.games',
    rpc: 'https://oasys.blockpi.network/v1/rpc/public',
    bridgeContract: '', // get from router data API
    bridgeABI: IL1StandardBridge,
    bridgeABIExternal: cBridgeABI,
    type: 'oasys_to_verse', // will update from router data API
    isOnlyDefiBridge: false,
    //tokens: BRIDGE_OASYS_TOKENS_MAINNET,
    nativeCurrency: {
      name: 'OASYS',
      symbol: 'OAS',
      decimals: 18,
    },
  },
  {
    chain_id: '0x3EF4',
    chain_id_decimals: 16116,
    chain_name: 'defiverse',
    img_url: defiIcon,
    name: 'Defiverse',
    gasPrice: null,
    explorer: 'https://scan.defi-verse.org/',
    rpc: 'https://rpc.defi-verse.org',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    bridgeABI: IL2ERC20Bridge,
    type: 'verse-chain',
    isOnlyDefiBridge: false,
    isTestnet: false,
    //tokens: BRIDGE_DEFIVERSE_TOKENS,
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
    chain_name: 'mchverse',
    name: 'MCHVerse',
    img_url: mchIcon,
    gasPrice: null,
    explorer: 'https://explorer.oasys.mycryptoheroes.net',
    rpc: 'https://rpc.oasys.mycryptoheroes.net',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    bridgeABI: IL2ERC20Bridge,
    type: 'verse-chain',
    isOnlyDefiBridge: true,
    isTestnet: false,
    //tokens: BRIDGE_MCHVERSE_TOKENS,
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
    chain_name: 'tcgverse',
    name: 'TCGVerse',
    img_url: tcgIcon,
    gasPrice: null,
    explorer: 'https://explorer.tcgverse.xyz',
    rpc: 'https://rpc.tcgverse.xyz',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    bridgeABI: IL2ERC20Bridge,
    type: 'verse-chain',
    isOnlyDefiBridge: true,
    isTestnet: false,
    //tokens: BRIDGE_TCGVERSE_TOKENS,
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
    chain_name: 'homeverse',
    name: 'HOMEVerse',
    img_url: homeIcon,
    gasPrice: null,
    explorer: 'https://explorer.oasys.homeverse.games',
    rpc: 'https://rpc.mainnet.oasys.homeverse.games',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    bridgeABI: IL2ERC20Bridge,
    type: 'verse-chain',
    isOnlyDefiBridge: true,
    isTestnet: false,
    //tokens: BRIDGE_HOMEVERSE_TOKENS,
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
    chain_name: 'chainverse',
    name: 'ChainVerse',
    img_url: chainIcon,
    gasPrice: null,
    explorer: 'https://explorer.chainverse.info',
    rpc: 'https://rpc.chainverse.info',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    bridgeABI: IL2ERC20Bridge,
    type: 'verse-chain',
    isOnlyDefiBridge: true,
    isTestnet: false,
    //tokens: BRIDGE_CHAINVERSE_TOKENS,
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
    chain_name: 'saakuruverse',
    name: 'SaakuruVerse',
    img_url: saakuruIcon,
    gasPrice: null,
    explorer: 'https://explorer.saakuru.network',
    rpc: 'https://rpc.saakuru.network',
    bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
    bridgeABI: IL2ERC20Bridge,
    type: 'verse-chain',
    isOnlyDefiBridge: true,
    isTestnet: false,
    //tokens: BRIDGE_SAKUURU_TOKENS,
    nativeCurrency: {
      name: 'OASYS',
      symbol: 'OAS',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000010',
    },
  },
];
