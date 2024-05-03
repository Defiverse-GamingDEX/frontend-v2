import { NETWORKS_MAINNET_RECEIVE } from './networks/networks-mainnet-receive';
import { NETWORKS_TESTNET_RECEIVE } from './networks/networks-testnet-receive';
const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
console.log(IS_TESTNET, import.meta.env.VITE_IS_TESTNET, 'IS_TESTNET');
export const NETWORKS_RECEIVE =
  IS_TESTNET == 'false' ? NETWORKS_MAINNET_RECEIVE : NETWORKS_TESTNET_RECEIVE;
