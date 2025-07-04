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
  const tmpApproved = ref(false);
  const approveAmount = ref('0');

  /**
   * COMPOSABLES
   */
  const { account, getProvider } = useWeb3();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();

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
        approveAmount.value = '0';
      }
      if (token.value.type === 'erc1155') {
        approveAmount.value = '0';
      }
    } catch (error) {
      console.log('------approveAmount.error', error);
      approveAmount.value = '0';
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
      // TODO
    }
    if (token.value.type === 'erc1155') {
      // TODO
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
      onTxConfirmed: async () => {
        await checkApprove();
        approving.value = false;
      },
      onTxFailed: () => {
        approving.value = false;
      },
    });
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
