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
  {
    id: 'megaeth-testnet',
    chainId: 6343,
    chainIdHex: '0x18C7',
    gaugeRewardContractAddress: '0x1AC444064Da49947742c2180Cd44b89886717C4C',
  },
];
const GAUGE_REWARD_NETWORKS_MAINNET = [
  {
    id: 'oasys',
    chainId: 248,
    chainIdHex: '0xf8',
    gaugeRewardContractAddress: '0xd5FcBEDaAb0C49EEd82835f1052B319eE4828E46',
  },
  {
    id: 'defiverse',
    chainId: 16116,
    chainIdHex: '0x3EF4',
    gaugeRewardContractAddress: '0xEbAB4820901a5383b7F305C278cF501c7cfBd73f',
  },
  {
    id: 'megaeth',
    chainId: 4326,
    chainIdHex: '0x10E6',
    gaugeRewardContractAddress: '0xb61f122AB285f8ab046C75b6F2852BBf1F6F70c8',
  },
  {
    id: 'hyperevm',
    chainId: 999,
    chainIdHex: '0x3E7',
    gaugeRewardContractAddress: '0xd51319f906d4831Ec78d7B2807088a76a0cc06aa',
  },
];
const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';

export const GAUGE_REWARD_NETWORKS =
  IS_TESTNET == 'false'
    ? GAUGE_REWARD_NETWORKS_MAINNET
    : GAUGE_REWARD_NETWORKS_TESTNET;
