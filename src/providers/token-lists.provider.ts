import { safeInject } from '@/providers/inject';
import { pick } from 'lodash';
import {
  computed,
  InjectionKey,
  onBeforeMount,
  provide,
  reactive,
  ref,
  toRefs,
} from 'vue';

import useNetwork from '@/composables/useNetwork';
import localStorageKeys from '@/constants/local-storage.keys';
import symbolKeys from '@/constants/symbol.keys';
import { lsSet } from '@/lib/utils';
import { tokenListService } from '@/services/token-list/token-list.service';
import { TokenList, TokenListMap } from '@/types/TokenList';
import { fetchTokenListsByChainId } from '@/constants/tokenlists';
/** TYPES */
export interface TokenListsState {
  activeListKeys: string[];
}

//const { uris } = tokenListService;
const uris = ref<any | null>(null);
const { networkId } = useNetwork();

/**
 * STATE
 */
const state: TokenListsState = reactive({
  activeListKeys: [uris?.value?.Balancer?.Default],
});
const allTokenLists = ref({});

const tokensListPromise =
  import.meta.env.MODE === 'test'
    ? // Only use this file in testing mode (vitest)
      import('@tests/tokenlists/tokens-5.json')
    : // Use generated file in development/production mode
      import(`@/assets/data/tokenlists/tokens-${networkId.value}.json`);

/**
 * All active (toggled) tokenlists
 */

const activeTokenLists = computed((): TokenListMap => {
  return pick(allTokenLists.value, state.activeListKeys);
});

/**
 * The default Balancer token list.
 */
const defaultTokenList = computed(
  (): TokenList => allTokenLists.value[uris.value.Balancer.Default]
);

/**
 * The Balancer vetted token list, contains LBP tokens.
 */
const vettedTokenList = computed(
  (): TokenList => allTokenLists.value[uris.value.Balancer.Vetted]
);

/**
 * All Balancer token lists mapped by URI.
 */
const balancerTokenLists = computed(
  (): TokenListMap => pick(allTokenLists.value, uris.value.Balancer.All)
);

/**
 * Approved token lists mapped by URI.
 * Approved means tokens are compliant and can be presented in the UI.
 * This excludes lists like the Balancer vetted list.
 */
const approvedTokenLists = computed(
  (): TokenListMap => pick(allTokenLists.value, uris.value.Approved)
);

/**
 * Adds a token list to the active lists which
 * makes additonal tokens available in the token search modal.
 */
function toggleTokenList(uri: string): void {
  if (!uris.value.Approved.includes(uri)) return;

  if (state.activeListKeys.includes(uri)) {
    // Deactivate token list
    state.activeListKeys.splice(state.activeListKeys.indexOf(uri), 1);
  } else {
    // Activate token list
    state.activeListKeys.push(uri);
  }

  lsSet(localStorageKeys.TokenLists.Toggled, state.activeListKeys);
}

/**
 * Given a token list URI checks if the related token
 * list has been toggled via the token search modal.
 */
function isActiveList(uri: string): boolean {
  return state.activeListKeys.includes(uri);
}

export const tokenListsProvider = () => {
  onBeforeMount(async () => {
    uris.value = await tokenListService.getUris();
    // const module = await tokensListPromise;
    // console.log('🚀 ~ onBeforeMount ~ module:', module.default);
    const tokensListRs = await fetchTokenListsByChainId(networkId.value);
    const tokenListInfo = tokensListRs && tokensListRs[networkId.value];
    let rs = {};
    if (tokenListInfo) {
      rs = {
        [JSON.stringify(tokenListInfo)]: tokenListInfo,
      };
    }

    allTokenLists.value = rs;
  });

  // Cập nhật `activeListKeys` khi `uris` có giá trị
  watchEffect(() => {
    if (uris.value) {
      state.activeListKeys = [uris?.value?.Balancer?.Default];
    }
  });
  return {
    // state
    ...toRefs(state),
    tokensListPromise,
    // computed
    allTokenLists,
    activeTokenLists,
    defaultTokenList,
    balancerTokenLists,
    approvedTokenLists,
    vettedTokenList,
    // methods
    toggleTokenList,
    isActiveList,
  };
};

export type TokenListsResponse = ReturnType<typeof tokenListsProvider>;
export const TokenListsProviderSymbol: InjectionKey<TokenListsResponse> =
  Symbol(symbolKeys.Providers.TokenLists);

export function provideTokenLists(): TokenListsResponse {
  const tokenLists = tokenListsProvider();
  provide(TokenListsProviderSymbol, tokenLists);
  return tokenLists;
}

export const useTokenLists = (): TokenListsResponse => {
  return safeInject(TokenListsProviderSymbol);
};
