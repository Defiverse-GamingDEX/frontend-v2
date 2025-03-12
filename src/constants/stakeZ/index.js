const STAKE_Z_NETWORKS_MAINNET = [
  {
    chain_id: 248,
    name: 'OASYS Mainnet',
    z_token_address: '0x0000000000000000000000000000000000000000',
    z_token_decimals: 18,
    sz_token_address: '0x0000000000000000000000000000000000000000',
    sz_token_decimals: 18,
    sz_stake_contract_address: '0x0000000000000000000000000000000000000000',
  },
  {
    chain_id: 16116,
    name: 'Defiverse',
    z_token_address: '0x0000000000000000000000000000000000000000',
    z_token_decimals: 18,
    sz_token_address: '0x0000000000000000000000000000000000000000',
    sz_token_decimals: 18,
    sz_stake_contract_address: '0x0000000000000000000000000000000000000000',
  },
];

const STAKE_Z_NETWORKS_TESTNET = [
  {
    chain_id: 9372,
    name: 'OASYS Testnet',
    z_token_address: '0x0000000000000000000000000000000000000000',
    z_token_decimals: 18,
    sz_token_address: '0x0000000000000000000000000000000000000000',
    sz_token_decimals: 18,
    sz_stake_contract_address: '0x0000000000000000000000000000000000000000',
  },
  {
    chain_id: 17117,
    name: 'Defiverse Testnet',
    z_token_address: '0x33faF6B389064c572b807498e17A21440ef15F15',
    z_token_decimals: 18,
    sz_token_address: '0x762D4600f2f31a9a18b0A519Af2c24E015410876',
    sz_token_decimals: 18,
    sz_stake_contract_address: '0x762D4600f2f31a9a18b0A519Af2c24E015410876',
  },
];
const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';

export const STAKE_Z_NETWORKS =
  IS_TESTNET == 'false' ? STAKE_Z_NETWORKS_MAINNET : STAKE_Z_NETWORKS_TESTNET;
