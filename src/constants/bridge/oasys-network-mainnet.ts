import oasIcon from '@/assets/images/bridge/networks/oas.png';
import { BRIDGE_OASYS_TOKENS_MAINNET } from './oasys-tokens-mainnet';
export const OASYS_NETWORK_MAINNET = {
  chain_id: '0xf8',
  chain_id_decimals: 248,
  img_url: oasIcon,
  name: 'OASYS Mainnet',
  gasPrice: null,
  explorer: 'https://explorer.oasys.games',
  rpc: 'https://oasys.blockpi.network/v1/rpc/public',
  bridgeContract: '0x5200000000000000000000000000000000000015',
  type: 'L1',
  isOnlyDefiBridge: false,
  tokens: BRIDGE_OASYS_TOKENS_MAINNET,
  nativeCurrency: {
    name: 'OASYS',
    symbol: 'OAS',
    decimals: 18,
  },
};
