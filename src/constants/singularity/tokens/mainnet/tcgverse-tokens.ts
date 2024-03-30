import oasIcon from '@/assets/images/bridge/tokens/oas.png';
import tcgcIcon from '@/assets/images/bridge/tokens/tcgc.png';
const rpc = 'https://rpc.tcgverse.xyz';
export const TCGVERSE_TOKENS = [
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
    address: '0xA29b548056c3fD0f68BAd9d4829EC4E66f22f796',
    logoURI: tcgcIcon,
    symbol: 'TCGC',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
];
