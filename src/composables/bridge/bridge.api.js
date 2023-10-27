import axios from 'axios';
const MAINNET_API_URL = 'https://cbridge-prod2.celer.app';
const TESTNET_API_URL = 'https://cbridge-v2-test.celer.network';
const isTestnet = true;
const domain = isTestnet ? TESTNET_API_URL : MAINNET_API_URL;

const getTransferConfigs = async () => {
  let data = await axios.get(`${domain}/v2/getTransferConfigs`, {});
  return data?.data;
};
const getEstimateAmt = async params => {
  let data = await axios.get(`${domain}/v2/estimateAmt`, {
    params,
  });
  return data?.data;
};
export default {
  getTransferConfigs,
  getEstimateAmt,
};
