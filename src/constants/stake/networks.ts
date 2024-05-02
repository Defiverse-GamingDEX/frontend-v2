import { NETWORKS_MAINNET } from './networks/networks-mainnet';
import { NETWORKS_TESTNET } from './networks/networks-testnet';
const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
console.log(IS_TESTNET, import.meta.env.VITE_IS_TESTNET, 'IS_TESTNET');
export const NETWORKS =
  IS_TESTNET == 'false' ? NETWORKS_MAINNET : NETWORKS_TESTNET;
export const DEFAULT_CHAIN_ID =
  IS_TESTNET == 'false' ? 248 : 9372;