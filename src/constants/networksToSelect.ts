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
  ? [1, 56, 97, 81, 592, 137, 248, 6343, 998]
  : [1, 56, 97, 81, 592, 137, 248, 6343, 998];
export const networksForTransferToken: any = chainIdsForTransferToken?.map(
  id => {
    return mapNetwork(id);
  }
);

export const chainIdsForTransferNft: any = IS_TESTNET
  ? [29548, 9372, 20197, 97]
  : [29548, 9372, 20197, 97];
export const networksForTransferNft: any = chainIdsForTransferNft?.map(id => {
  return mapNetwork(id);
});

export default {
  chainIdsForTransferToken,
  networksForTransferToken,
  chainIdsForTransferNft,
  networksForTransferNft,
};
