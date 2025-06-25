import configs from '@/lib/config';

const IS_TESTNET = import.meta.env.VITE_ENV == 'development' || false;

const chainIdsFortransferToken: any = IS_TESTNET ? [17117, 248] : [16116, 248];
const networksFortransferToken: any = chainIdsFortransferToken?.map(id => {
  return {
    chainId: id,
    name: configs[id].chainName,
  };
});

const networksFortransferNft: any = IS_TESTNET ? [] : [];

export default {
  networksFortransferToken,
  networksFortransferNft,
};
