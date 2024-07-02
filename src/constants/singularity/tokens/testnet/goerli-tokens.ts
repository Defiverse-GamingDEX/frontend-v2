import usdcIcon from '@/assets/images/bridge/tokens/usdc.png';
import usdtIcon from '@/assets/images/bridge/tokens/usdt.png';
export const GOERLI_TOKENS = [
  {
    name: 'Tether',
    address: '0xf4b2cbc3ba04c478f0dc824f4806ac39982dce73',
    logoURI: usdtIcon,
    symbol: 'USDT',
    decimals: 6,
    is_native: false,
    rpc: 'https://goerli.blockpi.network/v1/rpc/public',
  },
  {
    name: 'USD Coin',
    address: '0xcbe56b00d173a26a5978ce90db2e33622fd95a28',
    logoURI: usdcIcon,
    symbol: 'USDC',
    decimals: 6,
    is_native: false,
    rpc: 'https://goerli.blockpi.network/v1/rpc/public',
  },
];
