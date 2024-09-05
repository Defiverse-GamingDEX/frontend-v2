import tcgcIcon from '@/assets/images/bridge/tokens/tcgc.png';
import oasIcon from '@/assets/images/bridge/networks/oas.png';
const rpc = 'https://oasys.blockpi.network/v1/rpc/public';
export const BRIDGE_OASYS_TOKENS_MAINNET = [
  {
    name: 'OASYS',
    address: '0x0000000000000000000000000000000000000000',
    logoURI: oasIcon,
    symbol: 'OAS',
    decimals: 18,
    is_native: true,
    rpc: rpc,
  },
  {
    name: 'TCGC',
    address: '0xdDB07cc0f2F9fB7899DbA5a21964f3C6D2740e44',
    logoURI: tcgcIcon,
    symbol: 'USDT',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
];
