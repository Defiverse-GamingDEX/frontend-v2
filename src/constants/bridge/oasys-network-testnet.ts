import oasIcon from '@/assets/images/bridge/networks/oas.png';
import { BRIDGE_OASYS_TOKENS_TESTNET } from './oasys-tokens-testnet';
export const OASYS_NETWORK_TESTNET = {
  chain_id: '0x249C',
  chain_id_decimals: 9372,
  img_url: oasIcon,
  name: 'OASYS Testnet',
  gasPrice: null,
  explorer: 'https://explorer.testnet.oasys.games/',
  rpc: 'https://rpc.testnet.oasys.games/',
  bridgeContract: '0x4200000000000000000000000000000000000010',
  type: 'L1',
  isOnlyDefiBridge: false,
  tokens: BRIDGE_OASYS_TOKENS_TESTNET,
  nativeCurrency: {
    name: 'OASYS',
    symbol: 'OAS',
    decimals: 18,
  },
};
