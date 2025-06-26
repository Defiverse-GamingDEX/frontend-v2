import configs from '@/lib/config';

const IS_TESTNET = import.meta.env.VITE_ENV == 'development' || false;

const chainIdsFortransferToken: any = IS_TESTNET
  ? [1, 97, 17117, 248]
  : [1, 16116, 248];
const networksFortransferToken: any = chainIdsFortransferToken?.map(id => {
  return {
    chainId: id,
    name: configs[id].name,
    logoURI: '/' + configs[id]?.nativeAsset?.logoURI,
  };
});

const networksFortransferNft: any = IS_TESTNET ? [] : [];

export default {
  networksFortransferToken,
  networksFortransferNft,
};
