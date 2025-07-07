import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ExtendedTokenInfo } from '@/types/TokenList';
import { TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import {
  chainIdsForTransferToken,
  chainIdsForTransferNft,
} from '@/constants/networksToSelect';
import configs from '@/lib/config';
import useWeb3 from '@/services/web3/useWeb3';
import TokenService from '@/services/transfer/token.service';
import { isRowCheck, validColType } from '@/lib/utils/validations';
import useEthers from '../useEthers';
import useTransactions from '../useTransactions';
import { bnum } from '@/lib/utils';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

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
  const { addTransaction } = useTransactions(chainId);
  const { t } = useI18n();
  const { fNum2 } = useNumbers();

  const isChainSupprt = computed(() => {
    return chainIdsForTransferToken.includes(Number(chainId.value));
  });

  const isChainSupprtSendNft = computed(() => {
    return chainIdsForTransferNft.includes(Number(chainId.value));
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
      type: 'native',
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

  async function transferToken(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[],
    onTxConfirmed: () => void
  ): Promise<TransactionResponse | undefined> {
    const _recipients = recipients.filter(i => i.isValid);
    if (token.type === 'native') {
      return transferNative(token, _recipients, onTxConfirmed);
    }
    if (token.type === 'erc20') {
      return transferTokenErc20(token, _recipients, onTxConfirmed);
    }
    if (token.type === 'erc721') {
      // TODO
    }
    if (token.type === 'erc1155') {
      // TODO
    }
  }

  async function transferTokenErc20(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[],
    onTxConfirmed: () => void
  ): Promise<TransactionResponse> {
    try {
      if (!configService.value.addresses.disperse) {
        throw t('errorMissingNetworkConfig');
      }
      isLoadingTransfer.value = true;

      const tx = await _tokenService().disperseToken(
        configService.value.addresses.disperse,
        token.address,
        recipients.map(i => i.value[0]),
        recipients.map(i => parseUnits(i.value[1], token.decimals).toString())
      );

      txHandler(tx, getSummaryTransfer(token, recipients), onTxConfirmed);
      return tx;
    } catch (e) {
      console.log(e);
      isLoadingTransfer.value = false;
      return Promise.reject(e);
    }
  }

  async function transferNative(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[],
    onTxConfirmed: () => void
  ): Promise<TransactionResponse> {
    try {
      if (!configService.value.addresses.disperse) {
        throw t('errorMissingNetworkConfig');
      }
      isLoadingTransfer.value = true;

      const tx = await _tokenService().disperseNative(
        configService.value.addresses.disperse,
        recipients.map(i => i.value[0]),
        recipients.map(i => parseUnits(i.value[1], token.decimals).toString())
      );

      txHandler(tx, getSummaryTransfer(token, recipients), onTxConfirmed);
      return tx;
    } catch (e) {
      console.log(e);
      isLoadingTransfer.value = false;
      return Promise.reject(e);
    }
  }

  function getSummaryTransfer(
    token: ExtendedTokenInfo,
    recipients: ValueTextAreaType[]
  ) {
    const key =
      recipients.length === 1
        ? 'transfer.transferTokenSummary_one'
        : 'transfer.transferTokenSummary_other';
    const amount = recipients.reduce(
      (totalValue, { value }) => totalValue.plus(value[1] ?? 0),
      bnum(0)
    );
    return t(key, {
      amount: fNum2(amount.toString(), FNumFormats.token),
      currency: token.symbol,
      count: recipients.length,
    });
  }

  function txHandler(
    tx: TransactionResponse,
    summary: string,
    onTxConfirmed: () => void
  ): void {
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'batchTransfer',
      summary: summary,
    });

    txListener(
      tx,
      {
        onTxConfirmed: async () => {
          onTxConfirmed();
          isLoadingTransfer.value = false;
        },
        onTxFailed: () => {
          isLoadingTransfer.value = false;
        },
      },
      false,
      true,
      chainId.value
    );
  }

  return {
    chainId,
    account,
    isChainSupprt,
    isChainSupprtSendNft,
    configService,
    isLoadingTransfer,
    fetchNativeBalance,
    fetchErc20Balance,
    convertValueTextArea,
    transferToken,
    transferTokenErc20,
  };
}
