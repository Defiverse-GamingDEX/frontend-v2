import axios from 'axios';
const MAINNET_API_URL = 'https://price-api.gaming-dex.com/api';
const TESTNET_API_URL = 'https://price-api-testnet.gaming-dex.com/api';
const MAINNET_ACCESS_TOKEN = 'agjrAvfaym5#iwdbE_3v2@PmeXg7pWaXFZNagKJwx.avdfw2';
const TESTNET_ACCESS_TOKEN = 'zehur9Bf9eE.t_DguPDognLcfn_mqevVppGwXMcRoLgMsd3d';
const isTestnet = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
const domain = isTestnet == 'false' ? MAINNET_API_URL : TESTNET_API_URL;
const accessToken =
  isTestnet == 'false' ? MAINNET_ACCESS_TOKEN : TESTNET_ACCESS_TOKEN;
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

const getMarketInfo = async network => {
  let data = await axios.get(`${domain}/v1/market/info`, {
    params: { network },
  });
  return data?.data;
};
const importToken = async params => {
  // set access token for internal api
  let data = await axios.post(`${domain}/v1/tokens/import`, params, {
    headers: {
      'x-access-token': accessToken,
    },
  });
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
  importToken,
};
