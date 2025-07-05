<template>
  <BalModal show noContentPad @close="$emit('close')">
    <div class="p-4">
      <BalStack horizontal :align="'center'" spacing="xs" class="mb-4">
        <button
          class="flex text-blue-500 hover:text-blue-700"
          @click="$emit('close')"
        >
          <BalIcon class="flex" name="chevron-left" />
        </button>
        <h4>
          {{ $t('preview') }}
        </h4>
      </BalStack>
      <BalCard noPad class="overflow-auto relative mb-6 max-h-[60vh]">
        <template #header>
          <div
            class="py-2 px-4 w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-t-lg border-b dark:border-gray-800"
          >
            {{ $t('transfer.recipientsAndAmounts') }}
          </div>
        </template>
        <ValuesConfirmTransfer
          :data="props.recipientsValues"
          :headers="['address', 'amount']"
          :symbol="token?.symbol"
          :total="amount"
          :remaining="props.amountRemaining"
        />
      </BalCard>

      <BalActionSteps :actions="actions" :isLoading="loadingTransfer" />
    </div>
  </BalModal>
</template>

<script setup lang="ts">
import useTransferTokens, {
  ValueTextAreaType,
} from '@/composables/transfer/useTransferTokens';
import ValuesConfirmTransfer from './ValuesConfirmTransfer.vue';
import useTokenApproval from '@/composables/transfer/useTokenApproval';
import { ExtendedTokenInfo } from '@/types/TokenList';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['close', 'transferred']);

interface Props {
  token: ExtendedTokenInfo;
  amount: string;
  addressContract: string;
  amountRemaining: string;
  recipientsValues: ValueTextAreaType[];
}

const props = defineProps<Props>();
const token = toRef(props, 'token');
const amount = toRef(props, 'amount');
const addressContract = toRef(props, 'addressContract');
const loadingTransfer = ref(false);

const { approved, approveToken } = useTokenApproval(
  token,
  amount,
  addressContract,
  'transfer.approveForTransfer'
);

const { transferToken } = useTransferTokens();
const { t } = useI18n();

const actions = computed(() => {
  return [
    ...(approved.value
      ? []
      : [
          {
            label: `${t('approve')} ${token.value.symbol}`,
            loadingLabel: `${t('approving')} ${token.value.symbol}...`,
            confirmingLabel: `${t('confirming')} ${token.value.symbol}`,
            action: approveToken,
            stepTooltip: t(
              'transfer.transactionTypesTooltips.tokenApproval.content'
            ),
          },
        ]),
    {
      label: t('send'),
      loadingLabel: t('sending'),
      confirmingLabel: t('sending'),
      action: onSend,
      stepTooltip: t('transfer.transactionTypesTooltips.transfer.content'),
    },
  ];
});

// METHODS
function onTxConfirmed() {
  emit('close');
  emit('transferred');
}
function onSend() {
  return transferToken(token.value, props.recipientsValues, onTxConfirmed);
}
</script>

