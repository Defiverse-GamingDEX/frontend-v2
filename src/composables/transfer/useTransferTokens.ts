import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ExtendedTokenInfo } from '@/types/TokenList';
import { TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import { chainIdsForTransferToken } from '@/constants/networksToSelect';
import configs from '@/lib/config';
import useWeb3 from '@/services/web3/useWeb3';
import TokenService from '@/services/transfer/token.service';
import { isRowCheck, validColType } from '@/lib/utils/validations';
import useEthers from '../useEthers';
import useTransactions from '../useTransactions';

/**
 * TYPES
 */

export interface ValueTextAreaType {
  isValid: boolean;
  value: string[];
}

export default function useTransferTokens() {
  const isLoadingTransfer = ref(false);
  /**
   * COMPOSABLES + COMPUTED
   */
  const { chainId, account, getProvider, getSigner } = useWeb3();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();

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

  async function transferTokenErc20(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[]
  ): Promise<TransactionResponse> {
    try {
      if (!configService.value.addresses.disperse) {
        throw t('errorMissingNetworkConfig');
      }
      const tx = await _tokenService().disperseToken(
        configService.value.addresses.disperse,
        token.address,
        recipients.filter(i => i.isValid).map(i => i.value[0]),
        recipients
          .filter(i => i.isValid)
          .map(i => parseUnits(i.value[1], token.decimals).toString())
      );

      txHandler(tx);
      return tx;
    } catch (e) {
      console.log(e);
      isLoadingTransfer.value = false;
      return Promise.reject(e);
    }
  }

  function txHandler(tx: TransactionResponse): void {
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'batchTransfer',
      summary: t('transfer.transferSuccess'),
    });

    txListener(tx, {
      onTxConfirmed: async () => {
        isLoadingTransfer.value = false;
      },
      onTxFailed: () => {
        isLoadingTransfer.value = false;
      },
    });
  }

  return {
    chainId,
    account,
    isChainSupprt,
    configService,
    fetchNativeBalance,
    fetchErc20Balance,
    convertValueTextArea,
    transferTokenErc20,
  };
}
