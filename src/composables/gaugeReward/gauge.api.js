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
      params
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getVotingInfo = async () => {
  try {
    const response = await axios.get(`${domain}/v1/pools/voting-pool-info`);
    return response.data;
  } catch (error) {
    console.log('API not ready, using mock data:', error);
    // Mock data fallback when BE API is not ready
    return {
      next_period: {
        emission: 999999,
        total_vote_powers: '999,999',
        total_fee: 9999,
      },
    };
  }
};

// INTERNAL API - END
export default {
  getGaugeAddress,
  getVotingPoolDetails,
  getVotingInfo,
};
