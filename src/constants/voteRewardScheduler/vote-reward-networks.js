const VOTE_REWARD_SCHEDULER_NETWORKS_TESTNET = [
  {
    id: 'oasys-testnet',
    chainId: 9372,
    chainIdHex: '0x249C',
    voteRewardSchedulerContractAddress:
      '0x9750e90CD84Fda76E4b23E9411e6DE33b6716662',
  },
  {
    id: 'megaeth-testnet',
    chainId: 6343,
    chainIdHex: '0x18C7',
    voteRewardSchedulerContractAddress:
      '0x74B7Bc0dBe0d6cE27C1908242C4379a09eba21D3',
  },
];

const VOTE_REWARD_SCHEDULER_NETWORKS_MAINNET = [
  {
    id: 'oasys',
    chainId: 248,
    chainIdHex: '0xf8',
    voteRewardSchedulerContractAddress:
      '0x9750e90CD84Fda76E4b23E9411e6DE33b6716662', // Update this if different
  },
];

const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';

export const VOTE_REWARD_SCHEDULER_NETWORKS =
  IS_TESTNET == 'false'
    ? VOTE_REWARD_SCHEDULER_NETWORKS_MAINNET
    : VOTE_REWARD_SCHEDULER_NETWORKS_TESTNET;
