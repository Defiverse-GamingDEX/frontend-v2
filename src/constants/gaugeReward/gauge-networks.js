const GAUGE_REWARD_NETWORKS_TESTNET = [
  {
    id: 'oasys-testnet',
    chainId: 9372,
    chainIdHex: '0x249C',
    gaugeRewardContractAddress: '',
  },
  {
    id: 'defiverse-testnet',
    chainId: 17117,
    chainIdHex: '0x42DD',
    gaugeRewardContractAddress: '0xc6016cf2fC03fcEC27eFF83A4218F98710Fa8F81',
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
