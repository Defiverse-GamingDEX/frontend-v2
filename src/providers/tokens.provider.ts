import { getAddress, isAddress } from '@ethersproject/address';
import { compact, pick } from 'lodash';
import {
  computed,
  InjectionKey,
  nextTick,
  onBeforeMount,
  provide,
  reactive,
  toRef,
  toRefs,
} from 'vue';

import useAllowancesQuery from '@/composables/queries/useAllowancesQuery';
import useBalancesQuery from '@/composables/queries/useBalancesQuery';
import useTokenPricesQuery from '@/composables/queries/useTokenPricesQuery';
import useConfig from '@/composables/useConfig';
import symbolKeys from '@/constants/symbol.keys';
import { TOKENS } from '@/constants/tokens';
import {
  bnum,
  forChange,
  getAddressFromPoolId,
  includesAddress,
  isSameAddress,
} from '@/lib/utils';
import { safeInject } from '@/providers/inject';
import { TokenListsResponse } from '@/providers/token-lists.provider';
import { UserSettingsResponse } from '@/providers/user-settings.provider';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { configService } from '@/services/config/config.service';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { tokenService } from '@/services/token/token.service';
import {
  NativeAsset,
  TokenInfo,
  TokenInfoMap,
  TokenListMap,
} from '@/types/TokenList';

import { getMulticaller } from '@/dependencies/Multicaller';

import { networkId } from '@/composables/useNetwork';
import OracleAbi from '@/lib/abi/Oracle.json';
import configs from '@/lib/config';
const oracleContractAddress = configs[networkId.value].addresses.oracle;

/**
 * TYPES
 */
export interface TokensProviderState {
  loading: boolean;
  injectedTokens: TokenInfoMap;
  allowanceContracts: string[];
  injectedPrices: TokenPrices;
}

/**
 * Provides an interface to all token static and dynamic metadata.
 */
export const tokensProvider = (
  userSettings: UserSettingsResponse,
  tokenLists: TokenListsResponse
) => {
  /**
   * COMPOSABLES
   */
  const { networkConfig } = useConfig();
  const { currency } = userSettings;
  const {
    tokensListPromise,
    allTokenLists,
    activeTokenLists,
    balancerTokenLists,
  } = tokenLists;


  /**
   * STATE
   */
  const nativeAsset: NativeAsset = {
    ...networkConfig.nativeAsset,
    chainId: networkConfig.chainId,
  };

  const state: TokensProviderState = reactive({
    loading: true,
    injectedTokens: {},
    allowanceContracts: compact([
      networkConfig.addresses.vault,
      networkConfig.addresses.wstETH,
      configService.network.addresses.veBAL,
    ]),
    injectedPrices: {},
  });

  /**
   * COMPUTED
   */

  /**
   * All tokens from all token lists.
   */
  const allTokenListTokens = computed(
    (): TokenInfoMap => ({
      [networkConfig.nativeAsset.address]: nativeAsset,
      ...mapTokenListTokens(allTokenLists.value),
      ...state.injectedTokens,
    })
  );

  /**
   * All tokens from token lists that are toggled on.
   */

  const activeTokenListTokens = computed(
    (): TokenInfoMap => mapTokenListTokens(activeTokenLists.value)
  );

  /**
   * All tokens from Balancer token lists, e.g. 'listed' and 'vetted'.
   */
  const balancerTokenListTokens = computed(
    (): TokenInfoMap => mapTokenListTokens(balancerTokenLists.value)
  );

  /**
   * The main tokens map
   * A combination of activated token list tokens
   * and any injected tokens. Static and dynamic
   * meta data should be available for these tokens.
   */
  const tokens = computed((): TokenInfoMap => {
    return {
      [networkConfig.nativeAsset.address]: nativeAsset,
      ...activeTokenListTokens.value,
      ...state.injectedTokens,
    };
  });

  const tokenAddresses = computed((): string[] => Object.keys(tokens.value));

  const wrappedNativeAsset = computed(
    (): TokenInfo => getToken(TOKENS.Addresses.wNativeAsset)
  );

  /****************************************************************
   * Dynamic metadata
   *
   * The prices, balances and allowances maps provide dynamic
   * metadata for each token in the tokens state array.
   ****************************************************************/
  const pricesQueryEnabled = computed(() => !state.loading);

  const {
    data: priceData,
    isSuccess: priceQuerySuccess,
    isLoading: priceQueryLoading,
    isRefetching: priceQueryRefetching,
    isError: priceQueryError,
    refetch: refetchPrices,
  } = useTokenPricesQuery(
    tokenAddresses,
    toRef(state, 'injectedPrices'),
    pricesQueryEnabled,
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: balanceData,
    isSuccess: balanceQuerySuccess,
    isLoading: balanceQueryLoading,
    isRefetching: balanceQueryRefetching,
    isError: balancesQueryError,
    refetch: refetchBalances,
  } = useBalancesQuery(tokens, { keepPreviousData: true });

  const {
    data: allowanceData,
    isSuccess: allowanceQuerySuccess,
    isLoading: allowanceQueryLoading,
    isRefetching: allowanceQueryRefetching,
    isError: allowancesQueryError,
    refetch: refetchAllowances,
  } = useAllowancesQuery(tokens, toRef(state, 'allowanceContracts'));

  const prices = computed(
    (): TokenPrices => (priceData.value ? priceData.value : {})
  );
  const balances = computed(
    (): BalanceMap => (balanceData.value ? balanceData.value : {})
  );
  const allowances = computed(
    (): ContractAllowancesMap =>
      allowanceData.value ? allowanceData.value : {}
  );

  const dynamicDataLoaded = computed(
    () =>
      priceQuerySuccess.value &&
      balanceQuerySuccess.value &&
      allowanceQuerySuccess.value
  );

  //
  // 2023-08-24 Hung: Need to review this code
  //
  const dynamicDataLoading = computed(() => {
    const rs = //priceQueryLoading.value || // TODO NEED PRICE
      //priceQueryRefetching.value || // TODO NEED PRICE
      balanceQueryLoading.value ||
      // balanceQueryRefetching.value || // TODO missing div redender issue
      allowanceQueryLoading.value;
    // allowanceQueryRefetching.value; //  TODO missing div redender issue
    return rs;
  });
  /**
   * METHODS
   */
  /**
   * Create token map from a token list tokens array.const isEmpty = Object.keys(person).length === 0;
   */
  function mapTokenListTokens(tokenListMap: TokenListMap): TokenInfoMap {
  
      const isEmpty = Object.keys(tokenListMap).length === 0;
      if (isEmpty) return {};

      const tokens = [...Object.values(tokenListMap)]
        .map(list => list.tokens)
        .flat();
      const tokensMap = tokens.reduce<TokenInfoMap>((acc, token) => {
        try {
          const address: string = getAddress(token.address);
          // Don't include if already included
          if (acc[address]) return acc;

          // Don't include if not on app network
          if (token.chainId !== networkConfig.chainId) return acc;

          acc[address] = token;
        } catch (error) {
          console.log("⚠️ getAddress failed for:", token.address, "Error:", error);
        }
        return acc;
      }, {});
      return tokensMap;
   
   
  }

  /**
   * Fetches static token metadata for given addresses and injects
   * tokens into state tokens map.
   */
  async function injectTokens(addresses: string[]): Promise<void> {
    addresses = addresses
      .filter(a => a)
      .map(getAddressFromPoolId)
      .map(getAddress);

    // Remove any duplicates
    addresses = [...new Set(addresses)];

    const existingAddresses = Object.keys(tokens.value);

    // Only inject tokens that aren't already in tokens

    const injectable = addresses.filter(
      address => !includesAddress(existingAddresses, address)
    );
    if (injectable.length === 0) return;

    //Wait for dynamic token list import to be resolved
    await tokensListPromise;

    const newTokens = await tokenService.metadata.get(
      injectable,
      allTokenLists.value
    );

    state.injectedTokens = { ...state.injectedTokens, ...newTokens };

    // Wait for balances/allowances/prices to be fetched for newly injected tokens.
    await nextTick();
    await forChange(dynamicDataLoading, false);
  }

  /**
   * Given query, filters tokens map by name, symbol or address.
   * If address is provided, search for address in tokens or injectToken
   */
  async function searchTokens(
    query: string,
    {
      excluded = [],
      disableInjection = false,
      subset = [],
    }: { excluded?: string[]; disableInjection?: boolean; subset?: string[] }
  ): Promise<TokenInfoMap> {
    let tokensToSearch = subset.length > 0 ? getTokens(subset) : tokens.value;
    if (!query) return removeExcluded(tokensToSearch, excluded);

    tokensToSearch =
      subset.length > 0 ? tokensToSearch : allTokenListTokens.value;

    const potentialAddress = getAddressFromPoolId(query);

    if (isAddress(potentialAddress)) {
      const address = getAddress(potentialAddress);
      const token = tokensToSearch[address];
      if (token) {
        return { [address]: token };
      } else {
        if (!disableInjection) {
          await injectTokens([address]);
          return pick(tokens.value, address);
        } else {
          return { [address]: token };
        }
      }
    } else {
      const tokensArray = Object.entries(tokensToSearch);
      const results = tokensArray.filter(
        ([, token]) =>
          token.name.toLowerCase().includes(query.toLowerCase()) ||
          token.symbol.toLowerCase().includes(query.toLowerCase())
      );
      return removeExcluded(Object.fromEntries(results), excluded);
    }
  }

  /**
   * Remove excluded tokens from given token map.
   */
  function removeExcluded(
    tokens: TokenInfoMap,
    excluded: string[]
  ): TokenInfoMap {
    return Object.keys(tokens)
      .filter(address => !includesAddress(excluded, address))
      .reduce((result, address) => {
        result[address] = tokens[address];
        return result;
      }, {});
  }

  /**
   * Check if approval is required for given contract address
   * for a token and amount.
   */
  function approvalRequired(
    tokenAddress: string,
    amount: string,
    contractAddress = networkConfig.addresses.vault
  ): boolean {
    if (!amount || bnum(amount).eq(0)) return false;
    if (!contractAddress) return false;
    if (isSameAddress(tokenAddress, nativeAsset.address)) return false;

    const allowance = bnum(
      (allowances.value[contractAddress] || {})[getAddress(tokenAddress)]
    );
    return allowance.lt(amount);
  }

  /**
   * Check which tokens require approvals for given amounts
   * @returns a subset of the token addresses passed in.
   */
  function approvalsRequired(
    tokenAddresses: string[],
    amounts: string[],
    contractAddress: string = networkConfig.addresses.vault
  ): string[] {
    return tokenAddresses.filter((address, index) => {
      if (!contractAddress) return false;

      return approvalRequired(address, amounts[index], contractAddress);
    });
  }

  /**
   * Fetch price for a token
   */
  function priceFor(address: string): number {
    if (address) address = getAddress(address);
    try {
      return prices.value[address][currency.value] || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Fetch balance for a token
   */
  function balanceFor(address: string): string {
    if (address) address = getAddress(address);
    try {
      return balances.value[address] || '0';
    } catch {
      return '0';
    }
  }

  /**
   * Checks if token has a balance
   */
  function hasBalance(address: string): boolean {
    return Number(balances.value[address]) > 0;
  }

  /**
   * Get subset of tokens from state
   */
  function getTokens(addresses: string[]): TokenInfoMap {
    return pick(tokens.value, addresses.map(getAddress));
  }

  /**
   * Get single token from state
   */
  function getToken(address: string): TokenInfo | null {
    try {
      address = getAddressFromPoolId(address); // In case pool ID has been passed

      if (address) address = getAddress(address);

      return tokens.value[address];
    } catch (error) {
      console.log('🚀 ~ getToken ~ error:', error);
      return null;
    }
  }

  /**
   * Injects prices for tokens where the pricing provider
   * may have not found a valid price for provided tokens
   * @param pricesToInject A map of <address, price> to inject
   */
  function injectPrices(pricesToInject: TokenPrices) {
    state.injectedPrices = {
      ...state.injectedPrices,
      ...pricesToInject,
    };
  }

  /**
   * Get max balance of token
   * @param tokenAddress
   * @param disableNativeAssetBuffer Optionally disable native asset buffer
   */
  function getMaxBalanceFor(
    tokenAddress,
    disableNativeAssetBuffer = false
  ): string {
    let maxAmount;
    const tokenBalance = balanceFor(tokenAddress) || '0';
    const tokenBalanceBN = bnum(tokenBalance);

    if (tokenAddress === nativeAsset.address && !disableNativeAssetBuffer) {
      // Subtract buffer for gas
      maxAmount = tokenBalanceBN.gt(nativeAsset.minTransactionBuffer)
        ? tokenBalanceBN.minus(nativeAsset.minTransactionBuffer).toString()
        : '0';
    } else {
      maxAmount = tokenBalance;
    }
    return maxAmount;
  }

  async function getProtectedTokens() {
    const Multicaller = getMulticaller();
    const multicaller = new Multicaller();

    multicaller.call({
      key: `getProtectedTokens`,
      address:
        oracleContractAddress || '0xB0A3E83540923ecFfc9a8eE9042F30b6AD4a6B01',
      function: 'getProtectedTokens',
      abi: OracleAbi,
      params: [],
    });

    const result = await multicaller.execute();
    return result;
  }
  async function getAntiTraderInfo(tokenAddress, userAddress) {
    const Multicaller = getMulticaller();
    const multicaller = new Multicaller();
    multicaller.call({
      key: `isProtectedToken`,
      address:
        oracleContractAddress || '0xB0A3E83540923ecFfc9a8eE9042F30b6AD4a6B01',
      function: 'isProtectedToken',
      abi: OracleAbi,
      params: [tokenAddress],
    });

    if (userAddress) {
      multicaller.call({
        key: `getSellable`,
        address: oracleContractAddress,
        function: 'getSellable',
        abi: OracleAbi,
        params: [userAddress, tokenAddress],
      });
    }
    const result = await multicaller.execute();

    return result;
  }
  async function isLiquidityWhitelisted(tokenAddress, userAddress) {
    const Multicaller = getMulticaller();
    const multicaller = new Multicaller();
    multicaller.call({
      key: `isLiquidityWhitelisted`,
      address: oracleContractAddress,
      function: 'isLiquidityWhitelisted',
      abi: OracleAbi,
      params: [tokenAddress, userAddress],
    });

    const result = await multicaller.execute();

    return result;
  }
  /**
   * LIFECYCLE
   */
  onBeforeMount(async () => {
    // Hung: Remove veBAL from token list

    // Inject veBAL because it's not in tokenlists.
    const { veBAL } = configService.network.addresses;

    await injectTokens([veBAL]);
    state.loading = false;
  });

  return {
    // state
    ...toRefs(state),
    nativeAsset,
    // computed
    tokens,
    wrappedNativeAsset,
    activeTokenListTokens,
    balancerTokenListTokens,
    prices,
    balances,
    allowances,
    balanceQueryLoading,
    dynamicDataLoaded,
    dynamicDataLoading,
    priceQueryError,
    priceQueryLoading,
    balancesQueryError,
    allowancesQueryError,
    // methods
    refetchPrices,
    refetchBalances,
    refetchAllowances,
    injectTokens,
    searchTokens,
    hasBalance,
    approvalRequired,
    approvalsRequired,
    priceFor,
    balanceFor,
    getTokens,
    getToken,
    injectPrices,
    getMaxBalanceFor,
    getAntiTraderInfo,
    isLiquidityWhitelisted,
    getProtectedTokens,
  };
};

export type TokensResponse = ReturnType<typeof tokensProvider>;
export const TokensProviderSymbol: InjectionKey<TokensResponse> = Symbol(
  symbolKeys.Providers.Tokens
);

export function provideTokens(
  userSettings: UserSettingsResponse,
  tokenLists: TokenListsResponse
) {
  const tokensResponse = tokensProvider(userSettings, tokenLists);
  provide(TokensProviderSymbol, tokensResponse);
  return tokensResponse;
}

export const useTokens = (): TokensResponse | any => {
  try {
    return safeInject(TokensProviderSymbol);
  } catch (error) {
    console.error(error);
    return null;
  }
};
