import i18n from '@/plugins/i18n';
import LS_KEYS from '@/constants/local-storage.keys';
import { lsGet, lsSet } from '@/lib/utils';
import { ExtendedTokenInfo } from '@/types/TokenList';
import useWeb3 from '@/services/web3/useWeb3';

const erc20 = ref<ExtendedTokenInfo[]>(lsGet(LS_KEYS.Transfer.erc20, []));
const erc721 = ref<ExtendedTokenInfo[]>(lsGet(LS_KEYS.Transfer.erc721, []));
const erc1155 = ref<ExtendedTokenInfo[]>(lsGet(LS_KEYS.Transfer.erc1155, []));

export default function useTokensLocal() {
  const { chainId } = useWeb3();

  const erc721ForChain = computed((): ExtendedTokenInfo[] => {
    return erc721.value?.filter(i => i.chainId == chainId.value);
  });
  const erc1155ForChain = computed((): ExtendedTokenInfo[] => {
    return erc1155.value?.filter(i => i.chainId == chainId.value);
  });

  // METHODS
  function importToken(token: ExtendedTokenInfo): void {
    const tokenFind = erc20?.value.find(
      i =>
        i.address.toLocaleLowerCase() == token.address.toLocaleLowerCase() &&
        i.chainId == token.chainId
    );
    if (tokenFind) {
      throw { message: i18n.global.t('transfer.tokenAlreadyExists') };
    }
    erc20.value = [...erc20.value, token];
    lsSet(LS_KEYS.Transfer.erc20, erc20.value);
  }

  function import721(token: ExtendedTokenInfo): void {
    const tokenFind = erc721?.value.find(
      i =>
        i.address.toLocaleLowerCase() == token.address.toLocaleLowerCase() &&
        i.chainId == token.chainId
    );
    if (tokenFind) {
      throw { message: i18n.global.t('transfer.tokenAlreadyExists') };
    }
    erc721.value = [...erc721.value, token];
    lsSet(LS_KEYS.Transfer.erc721, erc721.value);
  }

  function import1155(token: ExtendedTokenInfo): void {
    const tokenFind = erc1155?.value.find(
      i =>
        i.address.toLocaleLowerCase() == token.address.toLocaleLowerCase() &&
        i.chainId == token.chainId
    );
    if (tokenFind) {
      throw { message: i18n.global.t('transfer.tokenAlreadyExists') };
    }
    erc1155.value = [...erc1155.value, token];
    lsSet(LS_KEYS.Transfer.erc1155, erc1155.value);
  }

  return {
    erc20,
    erc721,
    erc1155,
    erc721ForChain,
    erc1155ForChain,
    //method
    importToken,
    import721,
    import1155,
  };
}
