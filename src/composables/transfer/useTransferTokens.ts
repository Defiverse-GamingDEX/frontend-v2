import { computed } from 'vue';
import { TokenInfo } from '@/types/TokenList';

import { chainIdsForTransferToken } from '@/constants/networksToSelect';
import configs from '@/lib/config';
import useWeb3 from '@/services/web3/useWeb3';
import TokenService from '@/services/transfer/token.service';
import { isRowCheck, validColType } from '@/lib/utils/validations';

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
export interface ValueTextAreaType {
  isValid: boolean;
  value: string[];
}

export default function useTransferTokens() {
  const { chainId, account, getProvider } = useWeb3();
  /**
   * COMPOSABLES + COMPUTED
   */
  const isChainSupprt = computed(() => {
    return chainIdsForTransferToken.includes(Number(chainId.value));
  });

  // METHODS
  function _tokenService() {
    const provider = getProvider();
    return new TokenService(provider);
  }
  function _configService() {
    return configs[chainId.value];
  }
  async function fetchNativeBalance() {
    const balance = await _tokenService().fetchNativeBalance(
      account.value,
      _configService().nativeAsset.decimals
    );
    return {
      value: balance,
      symbol: _configService().nativeAsset.symbol,
    };
  }

  async function fetchErc20Balance(token: TokenInfo) {
    const balance = await _tokenService().fetchErc20Balance(
      account.value,
      token.address,
      token.decimals
    );
    return { ...token, balance };
  }

  function convertValueTextArea(
    text: string,
    validCol: validColType
  ): ValueTextAreaType[] {
    if (!text.trim()) return [];
    const lines = text.trim().split('\n');
    const rows: ValueTextAreaType[] = [];
    for (let index = 0; index < lines.length; index++) {
      const row = lines[index];
      const pairs = row
        .trim()
        .split(',')
        ?.map(i => i.trim());

      rows.push({
        isValid: isRowCheck(row, validCol),
        value: pairs,
      });
    }
    return rows;
  }

  return {
    chainId,
    isChainSupprt,
    fetchNativeBalance,
    fetchErc20Balance,
    convertValueTextArea,
  };
}
