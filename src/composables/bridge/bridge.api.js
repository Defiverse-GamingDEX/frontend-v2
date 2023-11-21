import axios from 'axios';
const MAINNET_API_URL = 'https://cbridge-prod2.celer.app';
const TESTNET_API_URL = 'https://cbridge-v2-test.celer.network';

const isTestnet = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
console.log(isTestnet, 'isTestnet');
const external_domain =
  isTestnet == 'false' ? TESTNET_API_URL : MAINNET_API_URL;

const MAINNET_INTERNAL_BRIDGE_API_URL = 'https://gaming-dex.com';
const TESTNET_INTERNAL_BRIDGE_API_URL = 'https://dex-testnet.defi-verse.org';
const internal_domain =
  isTestnet == 'false'
    ? TESTNET_INTERNAL_BRIDGE_API_URL
    : MAINNET_INTERNAL_BRIDGE_API_URL;
// CBRIDGE API - START
const getTransferConfigs = async () => {
  let data = await axios.get(`${external_domain}/v2/getTransferConfigs`, {});
  return data?.data;
};
const getEstimateAmt = async params => {
  let data = await axios.get(`${external_domain}/v2/estimateAmt`, {
    params,
  });
  return data?.data;
};

const getTransferStatus = async transfer_id => {
  let data = await axios.post(`${external_domain}/v2/getTransferStatus`, {
    transfer_id,
  });
  return data?.data;
};
const getTransferHistory = async params => {
  let data = await axios.get(`${external_domain}/v2/transferHistory`, {
    params,
  });
  return data?.data;
};
// CBRIDGE API - END

// INTERNAL API - START
const postSwapRequest = async params => {
  let data = await axios.post(`${internal_domain}/api/v1/swap`, params);
  return data?.data;
};
const getSwapHistory = async params => {
  const { public_address, offset, limit } = params;
  let data = await axios.get(
    `${internal_domain}/api/v1/swap?public_address=${public_address}&limit=${limit}&offset=${offset}`
  );
  return data?.data;
};
const postRetryRequest = async params => {
  const { internal_tx_id, public_address } = params;
  let data = await axios.post(
    `${internal_domain}/api/v1/swap/${internal_tx_id}/retry?public_address=${public_address}`
  );
  return data?.data;
};
// INTERNAL API - END
export default {
  getTransferConfigs,
  getEstimateAmt,
  getTransferStatus,
  getTransferHistory,

  postSwapRequest,
  getSwapHistory,
  postRetryRequest,
};
