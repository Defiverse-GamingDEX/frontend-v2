import { BRIDGE_NETWORKS_TESTNET } from './networks/networks-testnet';
import { BRIDGE_NETWORKS_MAINNET } from './networks/networks-mainnet';
import { OASYS_NETWORK_TESTNET } from './oasys-network-testnet';
import { OASYS_NETWORK_MAINNET } from './oasys-network-mainnet';
const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
console.log(IS_TESTNET, import.meta.env.VITE_IS_TESTNET, 'IS_TESTNET');
export const BRIDGE_NETWORKS =
  IS_TESTNET == 'false' ? BRIDGE_NETWORKS_MAINNET : BRIDGE_NETWORKS_TESTNET;

export const OASYS_NETWORK =
  IS_TESTNET == 'false' ? OASYS_NETWORK_MAINNET : OASYS_NETWORK_TESTNET;
