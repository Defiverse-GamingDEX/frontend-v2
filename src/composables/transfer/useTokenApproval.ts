import { TransactionResponse } from '@ethersproject/providers';
import { computed, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { ExtendedTokenInfo } from '@/types/TokenList';
import TokenService from '@/services/transfer/token.service';

import useEthers from '../useEthers';
import useTransactions from '../useTransactions';

export default function useTokenApproval(
  token: Ref<ExtendedTokenInfo>,
  amount: Ref<string>,
  spender: Ref<string>,
  keySummary: string
) {
  /**
   * STATE
   */
  const approving = ref(false);
  const approveAmount = ref('0');

  /**
   * COMPOSABLES
   */
  const { chainId, account, getProvider } = useWeb3();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions(chainId);
  const { t } = useI18n();

  /**
   * COMPUTED
   */
  const approved = computed(() => {
    if (token.value.type === 'native') {
      return true;
    }

    return bnum(approveAmount.value).isGreaterThanOrEqualTo(
      amount.value || '0'
    );
  });

  /**
   * METHODS
   */
  function _tokenService() {
    const provider = getProvider();
    return new TokenService(provider);
  }

  async function checkApprove(): Promise<void> {
    try {
      if (token.value.type === 'native') {
        return;
      }
      if (token.value.type === 'erc20') {
        approveAmount.value = await _tokenService().fetchErc20Allowance(
          account.value,
          spender.value,
          token.value.address,
          token.value.decimals
        );
      }
      if (token.value.type === 'erc721') {
        const isApprovedForAll = await _tokenService().erc721IsApprovedForAll(
          token.value.address,
          account.value,
          spender.value
        );
        approveAmount.value = isApprovedForAll ? '1' : '-1';
      }
      if (token.value.type === 'erc1155') {
        const isApprovedForAll = await _tokenService().erc1155IsApprovedForAll(
          token.value.address,
          account.value,
          spender.value
        );
        approveAmount.value = isApprovedForAll ? '1' : '-1';
      }
    } catch (error) {
      approveAmount.value = '-1';
    }
  }

  async function approveToken(): Promise<TransactionResponse | undefined> {
    if (token.value.type === 'native') {
      return;
    }
    if (token.value.type === 'erc20') {
      return approveErc20();
    }
    if (token.value.type === 'erc721') {
      return approveErc721();
    }
    if (token.value.type === 'erc1155') {
      return approveErc1155();
    }
  }

  async function approveErc20(): Promise<TransactionResponse> {
    approving.value = true;
    try {
      const tx = await _tokenService().approveTokenErc20(
        spender.value,
        token.value.address
      );

      txHandler(tx, spender.value);
      return tx;
    } catch (e) {
      console.log(e);
      approving.value = false;
      return Promise.reject(e);
    }
  }

  async function approveErc721(): Promise<TransactionResponse> {
    approving.value = true;
    try {
      const tx = await _tokenService().erc721SetApprovalForAll(
        token.value.address,
        spender.value,
        true
      );

      txHandler(tx, spender.value);
      return tx;
    } catch (e) {
      console.log(e);
      approving.value = false;
      return Promise.reject(e);
    }
  }

  async function approveErc1155(): Promise<TransactionResponse> {
    approving.value = true;
    try {
      const tx = await _tokenService().erc1155SetApprovalForAll(
        token.value.address,
        spender.value,
        true
      );

      txHandler(tx, spender.value);
      return tx;
    } catch (e) {
      console.log(e);
      approving.value = false;
      return Promise.reject(e);
    }
  }

  function txHandler(tx: TransactionResponse, spender: string): void {
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approveBatchTransfer',
      summary: t(keySummary, [token.value?.symbol]),
      details: {
        contractAddress: token.value.address,
        spender,
      },
    });

    txListener(
      tx,
      {
        onTxConfirmed: async () => {
          await checkApprove();
          approving.value = false;
        },
        onTxFailed: () => {
          approving.value = false;
        },
      },
      false,
      true,
      chainId.value
    );
  }

  onMounted(() => {
    checkApprove();
  });

  /**
   * WATCHERS
   */
  watch(token, async () => checkApprove());
  watch(spender, async () => checkApprove());

  return {
    approved,
    approving,
    approveToken,
    approveErc20,
  };
}
