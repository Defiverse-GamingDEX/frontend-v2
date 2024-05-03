import oasIcon from '@/assets/images/bridge/networks/oas.png';
import { OASYS_MAINNET_TOKENS } from './oasys-mainnet-tokens';
export const OASYS_MAINNET_NETWORK = {
  chain_id: '0xF8',
  chain_id_decimals: 248,
  img_url: oasIcon,
  name: 'Oasys Mainnet',
  gasPrice: null,
  explorer: 'https://explorer.oasys.games/',
  rpc: 'https://rpc.mainnet.oasys.games',
  bridgeContract: '0x4200000000000000000000000000000000000010',
  tokens: OASYS_MAINNET_TOKENS,
  nativeCurrency: {
    name: 'OASYS',
    symbol: 'OAS',
    decimals: 18,
  },
};
