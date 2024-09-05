import { BRIDGE_NETWORKS_MAINNET } from './networks/networks-mainnet';
import { BRIDGE_NETWORKS_TESTNET } from './networks/networks-testnet';
import { OASYS_NETWORK_MAINNET } from './oasys-network-mainnet';
import { OASYS_NETWORK_TESTNET } from './oasys-network-testnet';
const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';

export const BRIDGE_NETWORKS =
  IS_TESTNET == 'false' ? BRIDGE_NETWORKS_MAINNET : BRIDGE_NETWORKS_TESTNET;

export const OASYS_NETWORK =
  IS_TESTNET == 'false' ? OASYS_NETWORK_MAINNET : OASYS_NETWORK_TESTNET;

export const ORDER_NETWORKS_LIST = [
  { chain_id_decimals: 248, name: 'OASYS Mainnet' },
  { chain_id_decimals: 16116, name: 'Defiverse' },
  { chain_id_decimals: 29548, name: 'MCHVerse' },
  { chain_id_decimals: 1, name: 'Ethereum' },
  { chain_id_decimals: 137, name: 'Polygon' },
  { chain_id_decimals: 2400, name: 'TCGVerse' },
  { chain_id_decimals: 19011, name: 'HOMEVerse' },
];
