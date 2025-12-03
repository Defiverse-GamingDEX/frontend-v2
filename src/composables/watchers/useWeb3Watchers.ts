import { EthereumTransactionData } from 'bnc-sdk/dist/types/src/interfaces';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { BLOCKED_ADDRESSES } from '@/constants/blocked';
import { PATH_NAME_USE_NAV_SWITCH_NETWORK } from '@/constants/links';
import { includesAddress } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';

import { useTokens } from '@/providers/tokens.provider';
import useAlerts, { AlertPriority, AlertType } from '../useAlerts';
import useBlocknative from '../useBlocknative';
import useTransactions, { ReplacementReason } from '../useTransactions';
import { Network } from '@defiverse/balancer-sdk-megaeth';
import { switchToAppNetwork } from '@/services/web3/utils/helpers';
import { configService } from '@/services/config/config.service';

export default function useWeb3Watchers() {
  // COMPOSABLES
  const { t } = useI18n();
  const { blocknative, supportsBlocknative } = useBlocknative();
  const {
    appNetworkConfig,
    chainId,
    account,
    isMismatchedNetwork,
    isUnsupportedNetwork,
    blockNumber,
    connectToAppNetwork,
    provider,
    isWalletReady,
    disconnectWallet,
  } = useWeb3();
  const { addAlert, removeAlert } = useAlerts();
  const { refetchBalances, refetchAllowances } = useTokens();
  const { handlePendingTransactions, updateTransaction } = useTransactions();

  const route = useRoute();

  const isSwitchNetwork = computed(() =>
    PATH_NAME_USE_NAV_SWITCH_NETWORK.includes(route?.name?.toString() || '')
  );

  function handleTransactionReplacement(
    tx: EthereumTransactionData,
    replacementReason: ReplacementReason
  ) {
    const originalHash = tx.replaceHash;

    if (originalHash != null) {
      updateTransaction(originalHash, 'tx', {
        // new id
        id: tx.hash,
        replacementReason,
      });
    }
  }

  function checkDefiverseNetwork() {
    // Check if user is connected to Defiverse network
    if (
      chainId.value &&
      (chainId.value === Network.DEFIVERSE || chainId.value === Network.DEFIVERSE_TESTNET)
    ) {
      // Map Defiverse networks to corresponding Oasys networks
      const targetNetwork = chainId.value === Network.DEFIVERSE
        ? Network.OASYS
        : Network.OASYS_TESTNET;
      const targetNetworkName = chainId.value === Network.DEFIVERSE ? 'Oasys' : 'Oasys Testnet';

      // Create custom switch function that switches to the correct Oasys network
      const switchToOasys = async () => {
        const targetNetworkConfig = configService.getNetworkConfig(targetNetwork);
        await switchToAppNetwork(provider.value as any, targetNetworkConfig as any);
      };

      addAlert({
        id: 'defiverse-redirect',
        label: `Please switch to ${targetNetworkName}`,
        type: AlertType.ERROR,
        persistent: true,
        action: switchToOasys,
        actionLabel: t('switchNetwork'),
        priority: AlertPriority.HIGH,
      });
      return true;
    } else {
      removeAlert('defiverse-redirect');
      return false;
    }
  }

  function checkIsUnsupportedNetwork() {
    // First check if connected to Defiverse
    if (checkDefiverseNetwork()) {
      return;
    }

    if (
      !isSwitchNetwork.value &&
      chainId.value &&
      (isUnsupportedNetwork.value || isMismatchedNetwork.value)
    ) {
      addAlert({
        id: 'network-mismatch',
        label: t('networkMismatch', [appNetworkConfig.name]),
        type: AlertType.ERROR,
        persistent: true,
        action: connectToAppNetwork,
        actionLabel: t('switchNetwork'),
        priority: AlertPriority.HIGH,
      });
    } else {
      removeAlert('network-mismatch');
    }
  }

  // Watch for user account change:
  // -> Unsubscribe Blocknative from old account if exits
  // -> Listen to new account for transactions and update balances
  watch(
    () => account.value,
    (newAccount, oldAccount) => {
      if (supportsBlocknative.value) {
        if (oldAccount) blocknative.unsubscribe(oldAccount);
        if (!newAccount) return;

        const { emitter } = blocknative.account(newAccount);
        emitter.on('txConfirmed', () => {
          refetchBalances.value();
          refetchAllowances.value();
        });

        emitter.on('txSpeedUp', tx =>
          handleTransactionReplacement(
            tx as EthereumTransactionData,
            'txSpeedUp'
          )
        );

        emitter.on('txCancel', tx =>
          handleTransactionReplacement(
            tx as EthereumTransactionData,
            'txCancel'
          )
        );
      }
    }
  );

  // Watch for user network switch
  // -> Display alert message if unsupported or not the same as app network.
  watch(isSwitchNetwork, () => {
    checkIsUnsupportedNetwork();
  });

  watch(chainId, () => {
    checkIsUnsupportedNetwork();
  });

  watch(isWalletReady, () => {
    checkIsUnsupportedNetwork();
  });
  watch(blockNumber, async () => {
    if (isWalletReady.value) {
      handlePendingTransactions();
    }
  });

  watch(account, () => {
    if (includesAddress(BLOCKED_ADDRESSES, account.value)) {
      disconnectWallet();
    }
  });
}
