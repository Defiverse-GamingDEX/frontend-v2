import oasIcon from '@/assets/images/bridge/tokens/oas.png';
import tcgcIcon from '@/assets/images/bridge/tokens/tcgc.png';
const rpc = 'https://rpc.oasys.mycryptoheroes.net';
export const MCHVERSE_TOKENS = [
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
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    logoURI: tcgcIcon,
    symbol: 'TCGC',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
];
