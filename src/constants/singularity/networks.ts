import { NETWORKS_MAINNET } from './networks/networks-mainnet';
import { NETWORKS_TESTNET } from './networks/networks-testnet';
//const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
const IS_TESTNET = 'false';

export const SINGULARITY_NETWORKS =
  IS_TESTNET == 'false' ? NETWORKS_MAINNET : NETWORKS_TESTNET;
