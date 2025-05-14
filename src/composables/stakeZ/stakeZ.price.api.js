import axios from 'axios';
const MAINNET_API_URL = 'https://price-api.gaming-dex.com/api';
const TESTNET_API_URL = 'https://price-api-testnet.gaming-dex.com/api';

const isTestnet = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
const domain = isTestnet == 'false' ? MAINNET_API_URL : TESTNET_API_URL;

const getStakedList = async params => {
  let data = await axios.get(`${domain}/v1/sz/stakes`, { params });
  return data?.data;
};

// INTERNAL API - END
export default {
  getStakedList,
};
