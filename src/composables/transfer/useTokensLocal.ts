import { reactive, toRefs } from 'vue';
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
  tokenListLocal: TokenInfo[];
}

/**
 * SETUP
 */
const lsTokenList = lsGet(LS_KEYS.Transfer.TokenList, []);

export default function useTokensLocal() {
  // STATE
  const state: UserSettingsState = reactive({
    tokenListLocal: lsTokenList,
  });

  // METHODS
  function importToken(token: TokenInfo): void {
    const tokenFind = state.tokenListLocal?.find(
      i =>
        i.address.toLocaleLowerCase() == token.address.toLocaleLowerCase() &&
        i.chainId == token.chainId
    );
    if (tokenFind) {
      throw { message: i18n.global.t('transfer.tokenAlreadyExists') };
    }
    state.tokenListLocal.push(token);
    lsSet(LS_KEYS.Transfer.TokenList, state.tokenListLocal);
  }

  return {
    ...toRefs(state),
    //method
    importToken,
  };
}
