import axios from 'axios';
const MAINNET_API_URL = 'https://price-api.gaming-dex.com/api';
const TESTNET_API_URL = 'https://price-api-testnet.gaming-dex.com/api';
// const TESTNET_API_URL = 'http://localhost:3001/api';
const isTestnet = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
const domain = isTestnet == 'false' ? MAINNET_API_URL : TESTNET_API_URL;
const getGaugeAddress = async params => {
  const response = await axios.get(`${domain}/v1/pools/info`, {
    params,
  });
  return response.data;
};
const getVotingPoolDetails = async params => {
  params.pool_ids = [
    '0xed651c1e26cb0758572ea633b32213cbd7d4f267000200000000000000000024',
  ];
  params.gauge_ids = ['0x3840e334fb283fae9ff641f50c2624077e101682'];
  const response = await axios.post(
    `${domain}/v1/pools/voting-pool-details`,
    params
  );
  return response.data;
};

// INTERNAL API - END
export default {
  getGaugeAddress,
  getVotingPoolDetails,
};
