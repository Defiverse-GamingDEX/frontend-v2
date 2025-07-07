<template>
  <div>
    <BalStack spacing="xs" vertical class="mt-6">
      <h6 class="mb-1">
        {{ $t('transfer.SelectTheToken') }}
      </h6>

      <SelectTokenForTransfer
        :chainId="chainId"
        :selectedToken="selectedToken"
        :type="tokenType"
        @on-selected="handleSelectedToken"
      />
    </BalStack>
    <BalStack spacing="xs" vertical class="mt-6">
      <h6 class="mb-1">
        {{ $t('transfer.recipientsAndAmounts') }}
      </h6>
      <p class="mb-1 text-sm">
        {{ $t('transfer.enterRecipientsAndAmounts') }}
      </p>
      <BalTextArea
        v-model="recipients"
        name="tokenAddressInput"
        :placeholder="$t('transfer.placeholderRecipientsAndAmounts')"
        size="sm"
        sizeHeight="lg"
        class="w-full"
        :rules="[isRequired(), isRowsTextArea(ruleCol)]"
        validateOn="input"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </BalStack>

    <BalStack v-if="recipientsValues.length" spacing="xs" vertical class="mt-6">
      <ValuesConfirmTransfer
        :data="recipientsValues"
        :headers="['address', 'tokenId']"
        :symbol="selectedToken?.symbol"
      />
    </BalStack>
    <div class="m-auto mt-6 mb-6 max-w-sm">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        color="gradient"
        block
        @click="startConnectWithInjectedProvider"
      />
      <BalBtn
        v-else
        :label="$t('preview')"
        classCustom="pink-white-shadow"
        block
        :disabled="submissionDisabled"
        @click="showPreviewModal = true"
      />
    </div>

    <!-- Modal preview -->
    <TransferTokenPreviewModal
      v-if="showPreviewModal"
      :token="selectedToken"
      :addressContract="transferAddress"
      :recipientsValues="recipientsValues"
      @close="showPreviewModal = false"
      @transferred="onTransferred"
    />
  </div>
</template>

<script setup lang="ts">
import SelectTokenForTransfer from './SelectTokenForTransfer.vue';
import ValuesConfirmTransfer from './ValuesConfirmTransfer.vue';
import TransferTokenPreviewModal from './TransferTokenPreviewModal.vue';
import { bnum } from '@/lib/utils';
import useTransferTokens, {
  ValueTextAreaType,
} from '@/composables/transfer/useTransferTokens';

import { ExtendedTokenInfo } from '@/types/TokenList';
import useWeb3 from '@/services/web3/useWeb3';

import {
  isRequired,
  isRowsTextArea,
  validColType,
} from '@/lib/utils/validations';

/**
 * STATE
 */
const tokenType = 'erc721';
const selectedToken = ref<any>(null);
const recipients = ref('');
const recipientsValues = ref<ValueTextAreaType[]>([]);
const ruleCol = { 0: ['isAddress'], 1: ['isInteger'] } as validColType;
const showPreviewModal = ref(false);

/**
 * COMPOSABLES
 */
const {
  chainId,
  account,
  isChainSupprtSendNft,
  configService,
  convertValueTextArea,
} = useTransferTokens();
const { isWalletReady, startConnectWithInjectedProvider } = useWeb3();

/**
 * COMPUTED
 */

const submissionDisabled = computed(() => {
  return (
    recipientsValues.value?.length <= 0 ||
    recipientsValues.value.filter(i => !i.isValid).length > 0
  );
});

const transferAddress = computed(() => {
  return configService.value?.addresses?.nftTransfer || '';
});

/**
 * FUNCTIONS
 */
function handleSelectedToken(token: any): void {
  selectedToken.value = token ? { ...token, type: 'erc721' } : null;
}

async function onTransferred(): Promise<void> {
  recipients.value = '';
}

/**
 * WATCH
 */

watch(recipients, async val => {
  const rows = convertValueTextArea(val, ruleCol);
  recipientsValues.value = rows;
});
</script>

