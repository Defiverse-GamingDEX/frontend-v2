import tcgcIcon from '@/assets/images/bridge/tokens/tcgc.png';
const rpc = 'https://eth.merkle.io';
export const BRIDGE_ETHEREUM_TOKENS = [
  {
    name: 'TCGC',
    address: '0x2FFdE077455f81E28bAa675a46B9c085740216d4',
    logoURI: tcgcIcon,
    symbol: 'TCGC',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
];
