import { computed } from 'vue';
import { ExtendedTokenInfo } from '@/types/TokenList';

import { chainIdsForTransferToken } from '@/constants/networksToSelect';
import configs from '@/lib/config';
import useWeb3 from '@/services/web3/useWeb3';
import TokenService from '@/services/transfer/token.service';
import { isRowCheck, validColType } from '@/lib/utils/validations';

/**
 * TYPES
 */

export interface ValueTextAreaType {
  isValid: boolean;
  value: string[];
}

export default function useTransferTokens() {
  /**
   * COMPOSABLES + COMPUTED
   */
  const { chainId, account, getProvider, getSigner } = useWeb3();

  const isChainSupprt = computed(() => {
    return chainIdsForTransferToken.includes(Number(chainId.value));
  });

  const configService = computed(() => {
    return configs[chainId.value];
  });

  // METHODS
  function _tokenService() {
    const provider = getProvider();
    return new TokenService(provider);
  }

  async function fetchNativeBalance(): Promise<ExtendedTokenInfo> {
    const balance = await _tokenService().fetchNativeBalance(
      account.value,
      configService.value.nativeAsset.decimals
    );
    return {
      balance: balance,
      chainId: chainId.value,
      ...configService.value.nativeAsset,
    };
  }

  async function fetchErc20Balance(token: ExtendedTokenInfo) {
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
    account,
    isChainSupprt,
    configService,
    fetchNativeBalance,
    fetchErc20Balance,
    convertValueTextArea,
  };
}
