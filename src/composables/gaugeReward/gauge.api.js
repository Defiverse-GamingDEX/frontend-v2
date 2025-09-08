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
  try {
    const response = await axios.post(
      `${domain}/v1/pools/voting-pool-details`,
      params,
      {
        timeout: 1000,
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// INTERNAL API - END
export default {
  getGaugeAddress,
  getVotingPoolDetails,
};
