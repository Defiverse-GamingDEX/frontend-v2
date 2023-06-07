<script setup lang="ts">
import { computed } from 'vue';
import { useTokens } from '@/providers/tokens.provider';
import { Transaction } from '@/composables/useTransactions';
import useWeb3 from '@/services/web3/useWeb3';
import { cloneDeep } from 'lodash';
interface Props {
  transactions: Transaction[];
  getExplorerLink: (id: string, type: Transaction['type']) => void;
  cancelOrder: (orderId: string) => void;
  isSuccessfulTransaction: (transaction: Transaction) => boolean;
  isPendingTransactionStatus: (transaction: Transaction['status']) => boolean;
}

const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { connector } = useWeb3();
const { getAntiTraderInfo, getProtectedTokens } = useTokens();
console.log(props.transactions, 'transactions');
const transactionsShow = ref([] as Transaction[]);
const protectedTokens = ref([] as Array<string>);
/**
 * COMPUTED
 */
const disablePending = computed(() => connector.value?.id === 'gnosis');
/**
 * WATCH
 */
watch(
  () => props.transactions,
  currentValue => {
     initTransactionShow(props.transactions);
  },
  { deep: true }
);
/**
 * METHODS
 */
async function initTransactionShow(currentTransaction) {
  transactionsShow.value = cloneDeep(currentTransaction);
  for (let i = 0; i < transactionsShow.value.length; i++) {
    let transaction = transactionsShow.value[i];
    let isAFT = protectedTokens?.value?.getProtectedTokens?.find(
      item => item === transaction?.details?.tokenInAddress
    );
    if (isAFT) {
      transactionsShow.value[i].action = 'atfSwap';
    }
    if (transaction.status === 'failed') {
      transactionsShow.value[i].action = 'atfLimit';
    }
    // let antiInfoFromAddress = await getAntiTraderInfo(
    //   transaction?.details?.tokenInAddress,
    //   null
    // );
    // let antiInfoToAddress = await getAntiTraderInfo(
    //   transaction?.details?.tokenOutAddress,
    //   null
    // );
    // console.log(antiInfoFromAddress, 'antiInfoFromAddress');
    // console.log(antiInfoToAddress, 'antiInfoToAddress');
    // if (
    //   antiInfoFromAddress.isProtectedToken === true ||
    //   antiInfoToAddress.isProtectedToken === true
    // ) {
    //   transactionsShow.value[i].action = 'atfSwap';
    // }
    // if (transaction.status === 'failed') {
    //   transactionsShow.value[i].action = 'atfLimit';
    // }
  }
}
/**
 * CALLBACKS
 */
onBeforeMount(async () => {
  protectedTokens.value = await getProtectedTokens();
  console.log(protectedTokens.value, 'protectedTokens.value');
  initTransactionShow(props.transactions);
});
</script>

<template>
  <div>
    <div
      v-for="transaction in transactionsShow"
      :key="transaction.id"
      class="mb-3"
    >
      <div class="row">
        <BalLink
          :href="getExplorerLink(transaction.id, transaction.type)"
          :disabled="
            disablePending && isPendingTransactionStatus(transaction.status)
          "
          external
          noStyle
          class="group"
        >
          <div class="flex items-center font-semibold">
            {{ $t(`transactionAction.${transaction.action}`) }}
            <BalIcon
              v-if="
                !(
                  disablePending &&
                  isPendingTransactionStatus(transaction.status)
                )
              "
              name="arrow-up-right"
              size="sm"
              class="ml-1 text-gray-400 group-hover:text-pink-500 dark:text-gray-600 transition-colors"
            />
          </div>
          <div
            class="text-sm group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white transition-colors text-secondary summary"
          >
            {{ transaction.summary }}
          </div>
        </BalLink>
        <div>
          <SpinnerIcon
            v-if="isPendingTransactionStatus(transaction.status)"
            class="text-orange-500 animate-spin"
          />
          <template v-else>
            <CheckIcon
              v-if="isSuccessfulTransaction(transaction)"
              class="text-green-500"
            />
            <BalTooltip v-else class="cursor-default">
              <template #activator>
                <BalIcon name="alert-circle" class="text-red-500" />
              </template>
              <div class="failed-reason-tooltip">
                {{ $t(`transactionAction.${transaction.action}`) }}
                {{ $t(`transactionStatus.${transaction.status}`) }}
              </div>
            </BalTooltip>
          </template>
        </div>
      </div>
      <div
        v-if="
          transaction.type === 'order' &&
          isPendingTransactionStatus(transaction.status)
        "
        class="mt-1"
      >
        <BalBtn
          size="xs"
          :label="$t('cancel')"
          :loading="transaction.status === 'cancelling'"
          :loadingLabel="$t('cancelling')"
          color="white"
          @click.prevent="cancelOrder(transaction.id)"
        />
      </div>
    </div>
  </div>
</template>


<style scoped>
.row {
  @apply flex justify-between items-center;
}

.row:last-child {
  @apply mb-0;
}

.summary {
  @apply overflow-hidden;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.failed-reason-tooltip {
  @apply lowercase;
}

.failed-reason-tooltip::first-letter {
  @apply uppercase;
}
</style>
