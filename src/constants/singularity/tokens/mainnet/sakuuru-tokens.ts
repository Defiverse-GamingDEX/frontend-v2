import defiIcon from '@/assets/images/bridge/tokens/defi.png';
import oasIcon from '@/assets/images/bridge/tokens/oas.png';
const rpc = 'https://rpc.saakuru.network';
export const SAKUURU_TOKENS = [
  {
    name: 'OASYS',
    address: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
    logoURI: oasIcon,
    symbol: 'OAS',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
  {
    name: 'DFC',
    address: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3',
    logoURI: defiIcon,
    symbol: 'DFC',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
];
