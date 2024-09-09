import axios from 'axios';
const MAINNET_API_URL = 'https://price-api.gaming-dex.com/api';
const TESTNET_API_URL = 'https://price-api.gaming-dex.com/api'; // not have testnet

const isTestnet = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';

const domain = isTestnet == 'false' ? TESTNET_API_URL : MAINNET_API_URL;

const getRoutes = async () => {
  let data = await axios.get(`${domain}/v1/bridge/request/routes`, {});
  return data?.data;
};
const getEstimateFee = async params => {
  let data = await axios.post(`${domain}/v1/bridge/request/estimate`, params);
  return data?.data;
};
const getHistoryByAddress = async params => {
  //const { offset, limit, sender_address } = params;
  let data = await axios.get(`${domain}/v1/bridge/request/history`, {
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
const postBridgeRequestV2 = async params => {
  let data = await axios.post(`${domain}/v1/bridge/request/createv2`, params);
  return data?.data;
};

const getMarketInfo = async () => {
  let data = await axios.get(`${domain}/v1/market/info`, {});
  return data?.data;
};
// INTERNAL API - END
export default {
  getRoutes,
  getEstimateFee,
  getHistoryByAddress,
  getRequestDetails,
  postBridgeRequest,
  postBridgeRequestV2,
  getMarketInfo,
};
