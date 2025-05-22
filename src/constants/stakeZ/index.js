const STAKE_Z_NETWORKS_MAINNET = [
  {
    chain_id: 248,
    name: 'OASYS Mainnet',
    z_token_address: '0xC683DA627fF9fD56740C72A703528861c33d3B3a',
    z_token_decimals: 18,
    sz_token_address: '0x2B726256AdD04e65403cEf6679A2f2dfF7DDe9F9',
    sz_token_decimals: 18,
  },
  {
    chain_id: 16116,
    name: 'Defiverse',
    z_token_address: '0x0000000000000000000000000000000000000000',
    z_token_decimals: 18,
    sz_token_address: '0x0000000000000000000000000000000000000000',
    sz_token_decimals: 18,
  },
];

const STAKE_Z_NETWORKS_TESTNET = [
  {
    chain_id: 9372,
    name: 'OASYS Testnet',
    z_token_address: '0x42DD917a3C8A14a766712Fabe7B048f0306246F6',
    z_token_decimals: 18,
    sz_token_address: '0x9288F664FEFc9f374A53C4307BD3c8F91e83f466',
    sz_token_decimals: 18,
  },
  {
    chain_id: 17117,
    name: 'Defiverse Testnet',
    z_token_address: '0x0000000000000000000000000000000000000000',
    z_token_decimals: 18,
    sz_token_address: '0xb5C5C48D3082751f60EE1CAc8FC84a921931EC24',
    sz_token_decimals: 18,
  },
];
const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';

export const STAKE_Z_NETWORKS =
  IS_TESTNET == 'false' ? STAKE_Z_NETWORKS_MAINNET : STAKE_Z_NETWORKS_TESTNET;
