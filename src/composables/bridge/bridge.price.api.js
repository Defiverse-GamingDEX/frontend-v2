import axios from 'axios';
const MAINNET_API_URL = 'https://price-api.gaming-dex.com/api';
const TESTNET_API_URL = 'https://price-api.gaming-dex.com/api'; // not have testnet

const isTestnet = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
console.log(isTestnet, 'isTestnet');
const domain = isTestnet == 'false' ? TESTNET_API_URL : MAINNET_API_URL;

const getRoutes = async () => {
  let data = await axios.get(`${domain}/v1/bridge/request/routes`, {});
  return data?.data;
};
const getEstimateFee = async params => {
  let data = await axios.get(`${domain}/v1/bridge/request/estimate`, {
    params,
  });
  return data?.data;
};
const getRequestDetails = async params => {
  const { txId } = params;
  let data = await axios.get(`${domain}/v1/bridge/request/${txId}`, {
    params,
  });
  return data?.data;
};
const postBridgeRequest = async params => {
  let data = await axios.post(`${domain}/v1/bridge/request/create`, params);
  return data?.data;
};

// INTERNAL API - END
export default {
  getRoutes,
  getEstimateFee,
  getRequestDetails,
  postBridgeRequest,
};
