import ethIcon from '@/assets/images/bridge/tokens/eth.png';
import wbtcIcon from '@/assets/images/bridge/tokens/wbtc.png';
import usdtIcon from '@/assets/images/bridge/tokens/usdt.png';
import usdcIcon from '@/assets/images/bridge/tokens/usdc.png';
import oasIcon from '@/assets/images/bridge/tokens/oas.png';
import defiIcon from '@/assets/images/bridge/tokens/defi.png';
import tcgcIcon from '@/assets/images/bridge/tokens/tcgc.png';
const rpc = 'https://rpc.mainnet.oasys.homeverse.games';
export const BRIDGE_HOMEVERSE_TOKENS = [
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
