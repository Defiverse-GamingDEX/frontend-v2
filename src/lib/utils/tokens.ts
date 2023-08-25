import networksSupport from '@/constants/networks';

const getTokenListFromNetworkId = networkId => {
  console.log('getTokenListFromNetworkId', networkId, networksSupport);
  const networks = [
    ...networksSupport.networks,
    ...networksSupport.networksDev,
  ];
  const networkSelect = networks.find(item => item.key == networkId);
  if (networkSelect) {
    return networkSelect.tokens;
  }
  return [];
};
export default {
  getTokenListFromNetworkId,
};
