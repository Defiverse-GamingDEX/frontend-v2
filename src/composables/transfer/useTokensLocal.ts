import i18n from '@/plugins/i18n';
import LS_KEYS from '@/constants/local-storage.keys';
import { lsGet, lsSet } from '@/lib/utils';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
declare module '@/types/TokenList' {
  interface TokenInfo {
    price?: number;
    balance?: string;
    value?: number;
  }
}
export interface UserSettingsState {
  erc20: TokenInfo[];
}

const erc20 = ref<TokenInfo[]>(lsGet(LS_KEYS.Transfer.erc20, []));

export default function useTokensLocal() {
  // METHODS
  function importToken(token: TokenInfo): void {
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

  return {
    erc20,
    //method
    importToken,
  };
}
