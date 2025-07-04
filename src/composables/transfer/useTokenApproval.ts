import { TransactionResponse } from '@ethersproject/providers';
import { computed, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { ExtendedTokenInfo } from '@/types/TokenList';

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
  const tmpApproved = ref(false);
  const approveAmount = ref('0');

  const { addTransaction } = useTransactions();
  const { t } = useI18n();

  /**
   * COMPOSABLES
   */
  const { getProvider } = useWeb3();
  const { txListener } = useEthers();

  /**
   * COMPUTED
   */
  const approved = computed(() => {
    if (token.value.type === 'native') {
      return true;
    }
    if (tmpApproved.value) {
      return true;
    }
    return bnum(approveAmount.value).isGreaterThanOrEqualTo(amount.value);
  });

  /**
   * METHODS
   */
  async function checkApprove(): Promise<void> {
    try {
      if (token.value.type === 'native') {
        return;
      }
      if (token.value.type === 'erc20') {
        approveAmount.value = '0';
      }
      if (token.value.type === 'erc721') {
        approveAmount.value = '0';
      }
      if (token.value.type === 'erc1155') {
        approveAmount.value = '0';
      }
    } catch (error) {
      approveAmount.value = '0';
    }
  }

  async function approveErc20(): Promise<TransactionResponse> {
    approving.value = true;
    try {
      const [tx] = await approveTokens(getProvider(), spender.value, [
        token.value.address,
      ]);
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
      action: 'approve',
      summary: t(keySummary, [token.value?.symbol]),
      details: {
        contractAddress: token.value.address,
        spender,
      },
    });

    txListener(tx, {
      onTxConfirmed: () => {
        approving.value = false;
        tmpApproved.value = true;
      },
      onTxFailed: () => {
        approving.value = false;
      },
    });
  }

  /**
   * WATCHERS
   */
  watch(token, async () => checkApprove());
  watch(spender, async () => checkApprove());

  return {
    approved,
    approving,
    approveErc20,
  };
}
