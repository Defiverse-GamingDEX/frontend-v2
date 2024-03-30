import oasIcon from '@/assets/images/bridge/tokens/oas.png';
import tcgcIcon from '@/assets/images/bridge/tokens/tcgc.png';
const rpc = 'https://rpc.mainnet.oasys.homeverse.games';
export const HOMEVERSE_TOKENS = [
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
    name: 'TCGC',
    address: '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3',
    logoURI: tcgcIcon,
    symbol: 'TCGC',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
];
