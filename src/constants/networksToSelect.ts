import configs from '@/lib/config';

const IS_TESTNET = import.meta.env.VITE_ENV == 'development' || false;

const mapNetwork = (id: number) => {
  return {
    chainId: id,
    name: configs[id].name,
    logoURI: '/' + configs[id]?.nativeAsset?.logoURI,
  };
};

export const chainIdsForTransferToken: any = IS_TESTNET
  ? [1, 56, 97, 17117, 16116, 81, 592, 137, 248]
  : [1, 56, 16116, 592, 137, 248];
export const networksForTransferToken: any = chainIdsForTransferToken?.map(
  id => {
    return mapNetwork(id);
  }
);

export const chainIdsForTransferNft: any = IS_TESTNET
  ? [1, 97, 17117, 248]
  : [1, 16116, 248];
export const networksForTransferNft: any = chainIdsForTransferToken?.map(id => {
  return mapNetwork(id);
});

export default {
  chainIdsForTransferToken,
  networksForTransferToken,
  chainIdsForTransferNft,
  networksForTransferNft,
};
