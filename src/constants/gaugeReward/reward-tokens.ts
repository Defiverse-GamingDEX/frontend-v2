import ethIcon from '@/assets/images/bridge/tokens/eth.png';
import wbtcIcon from '@/assets/images/bridge/tokens/wbtc.png';
import usdtIcon from '@/assets/images/bridge/tokens/usdt.png';
import usdcIcon from '@/assets/images/bridge/tokens/usdc.png';
import oasIcon from '@/assets/images/bridge/tokens/oas.png';
import bCCPIcon from '@/assets/images/bridge/tokens/bCCP.png';

export const GAUGE_REWARD_TOKENS = [
  {
    name: 'ETH',
    address: '0x668B5Cf2f13AE8bFb5619E48f2091040b6985d5c',
    logoURI: ethIcon,
    symbol: 'ETH',
    decimals: 18,
    is_native: false,
    rpc: 'https://rpc-testnet.defi-verse.org',
  },
  {
    name: 'Wrap BTC',
    address: '0x19f01c4794599B36541B6F1f45dB1d0BB7F52Ff7',
    logoURI: wbtcIcon,
    symbol: 'WBTC',
    decimals: 18,
    is_native: false,
    rpc: 'https://rpc-testnet.defi-verse.org',
  },
  {
    name: 'Tether USD',
    address: '0x66b8e41F428A9a7DbC7595b11d54462Be1A454Cb',
    logoURI: usdtIcon,
    symbol: 'USDT',
    decimals: 18,
    is_native: false,
    rpc: 'https://rpc-testnet.defi-verse.org',
  },
  {
    name: 'USD Coin',
    address: '0x9C9a2a20e96eAae6dF4ae3C7d8CD1a65Fe7D0F18',
    logoURI: usdcIcon,
    symbol: 'USDC',
    decimals: 18,
    is_native: false,
    rpc: 'https://rpc-testnet.defi-verse.org',
  },
  {
    name: 'bCCP',
    address: '0xafC07721d053e6895d0Ce4C5Dd7ff5525EA723d2',
    logoURI: bCCPIcon,
    symbol: 'bCCP',
    decimals: 18,
    is_native: false,
    rpc: 'https://rpc-testnet.defi-verse.org',
  },
];
