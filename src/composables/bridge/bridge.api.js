import axios from 'axios';
const MAINNET_API_URL = 'https://cbridge-prod2.celer.app';
const TESTNET_API_URL = 'https://cbridge-v2-test.celer.network';
// const getTransferConfigs = async () => {
//   let data = await axios.get(`https://cbridge-prod2.celer.app/v2/getTransferConfigs`, {
//     content,
//   });
//   return data;
// };
const getTransferConfigs = async isTestnet => {
  isTestnet = true;
  const domain = isTestnet ? TESTNET_API_URL : MAINNET_API_URL;
  try {
    let data = await axios.get(`${domain}/v2/getTransferConfigs`, {});
    console.log(data, 'getTransferConfigs');
    return data?.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getTransferConfigs,
};
