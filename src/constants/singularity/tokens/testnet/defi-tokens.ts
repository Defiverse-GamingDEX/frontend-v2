import ethIcon from '@/assets/images/bridge/tokens/eth.png';
import oasIcon from '@/assets/images/bridge/tokens/oas.png';
import usdcIcon from '@/assets/images/bridge/tokens/usdc.png';
import usdtIcon from '@/assets/images/bridge/tokens/usdt.png';
import wbtcIcon from '@/assets/images/bridge/tokens/wbtc.png';
export const DEFI_TOKENS = [
  {
    name: 'Ethereum',
    address: '0xA3496414a9900A9AE5960C1fEC30e563213b68bE',
    logoURI: ethIcon,
    symbol: 'ETH',
    decimals: 18,
    is_native: true,
    rpc: 'https://rpc.defi-verse.org',
  },
  {
    name: 'Wrap BTC',
    address: '0x7914aA2D50CC4E9B5A6fb6Ac58EC7095927B8897',
    logoURI: wbtcIcon,
    symbol: 'WBTC',
    decimals: 18,
    is_native: false,
    rpc: 'https://rpc.defi-verse.org',
  },
  {
    name: 'Tether',
    address: '0xf4b2cbc3ba04c478f0dc824f4806ac39982dce73',
    logoURI: usdtIcon,
    symbol: 'USDT',
    decimals: 18,
    is_native: false,
    rpc: 'https://rpc.defi-verse.org',
  },
  {
    name: 'USD Coin',
    address: '0xcbe56b00d173a26a5978ce90db2e33622fd95a28',
    logoURI: usdcIcon,
    symbol: 'USDC',
    decimals: 18,
    is_native: false,
    rpc: 'https://rpc.defi-verse.org',
  },
  {
    name: 'OASYS',
    address: '0xCC90040a931a8147cc2A4411c68348a5a3a363a0',
    logoURI: oasIcon,
    symbol: 'OAS',
    decimals: 18,
    is_native: false,
    rpc: 'https://rpc.defi-verse.org',
  },
];
