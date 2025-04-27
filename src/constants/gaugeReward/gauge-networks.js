const GAUGE_REWARD_NETWORKS_TESTNET = [
  {
    id: 'oasys-testnet',
    chainId: 9372,
    chainIdHex: '0x249C',
    gaugeRewardContractAddress: '0x46382d0Fb856E898223Cdbc80766b9c58b6f1714',
  },
  {
    id: 'defiverse-testnet',
    chainId: 17117,
    chainIdHex: '0x42DD',
    gaugeRewardContractAddress: '0xfeE8F38BB6C9aa8D2828a7d8542612e4E725aC69',
  },
];
const GAUGE_REWARD_NETWORKS_MAINNET = [
  {
    id: 'oasys',
    chainId: 248,
    chainIdHex: '0xf8',
    gaugeRewardContractAddress: '',
  },
  {
    id: 'defiverse',
    chainId: 16116,
    chainIdHex: '0x3EF4',
    gaugeRewardContractAddress: '',
  },
];
const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';

export const GAUGE_REWARD_NETWORKS =
  IS_TESTNET == 'false'
    ? GAUGE_REWARD_NETWORKS_MAINNET
    : GAUGE_REWARD_NETWORKS_TESTNET;
