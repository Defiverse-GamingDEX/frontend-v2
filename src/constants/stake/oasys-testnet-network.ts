import oasIcon from '@/assets/images/bridge/networks/oas.png';
import { OASYS_TESTNET_TOKENS } from './oasys-testnet-tokens';
export const OASYS_TESTNET_NETWORK = {
  chain_id: '0x249C',
  chain_id_decimals: 9372,
  img_url: oasIcon,
  name: 'OASYS Testnet',
  gasPrice: null,
  explorer: 'https://explorer.testnet.oasys.games/',
  rpc: 'https://rpc.testnet.oasys.games/',
  bridgeContract: '0x4200000000000000000000000000000000000010',
  tokens: OASYS_TESTNET_TOKENS,
  nativeCurrency: {
    name: 'OASYS',
    symbol: 'OAS',
    decimals: 18,
  },
};
