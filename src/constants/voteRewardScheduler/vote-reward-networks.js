const VOTE_REWARD_SCHEDULER_NETWORKS_TESTNET = [
  {
    id: 'oasys-testnet',
    chainId: 9372,
    chainIdHex: '0x249C',
    voteRewardSchedulerContractAddress:
      '0xd3aD8d3fC418641dBe58F1f1c80c18185d699cDE',
  },
];

const VOTE_REWARD_SCHEDULER_NETWORKS_MAINNET = [
  {
    id: 'oasys',
    chainId: 248,
    chainIdHex: '0xf8',
    voteRewardSchedulerContractAddress:
      '0xA201Cc73E2803D2576e57087a65A8A4DACeeA1BF',
  },
];

const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';

export const VOTE_REWARD_SCHEDULER_NETWORKS =
  IS_TESTNET == 'false'
    ? VOTE_REWARD_SCHEDULER_NETWORKS_MAINNET
    : VOTE_REWARD_SCHEDULER_NETWORKS_TESTNET;
