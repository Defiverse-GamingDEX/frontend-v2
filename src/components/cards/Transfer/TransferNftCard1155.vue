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
        {{ $t(`transfer.recipientInput.${tokenType}.title`) }}
      </h6>
      <p class="mb-1 text-sm">
        {{ $t(`transfer.recipientInput.${tokenType}.content`) }}
      </p>
      <BalTextArea
        v-model="recipients"
        name="tokenAddressInput"
        :placeholder="$t(`transfer.recipientInput.${tokenType}.placeholder`)"
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
        :headers="headers"
        :symbol="selectedToken?.symbol"
      />
    </BalStack>

    <BalAlert v-if="errors.length" type="error" class="mt-4" block>
      <template #title>
        <div>{{ $t('thereWasAnError') }}</div>
      </template>
      <template #default>
        <div v-for="(error, index) in errors" :key="index">+ {{ error }}</div>
      </template>
    </BalAlert>
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
        :loading="isLoadingCheck"
        :loadingLabel="$t('checking')"
        @click="onCheckToken"
      />
    </div>

    <!-- Modal preview -->
    <TransferTokenPreviewModal
      v-if="showPreviewModal"
      :token="selectedToken"
      :addressContract="transferAddress"
      :recipientsValues="recipientsValues"
      :headers="headers"
      @close="showPreviewModal = false"
      @transferred="onTransferred"
    />
  </div>
</template>

<script setup lang="ts">
import SelectTokenForTransfer from './SelectTokenForTransfer.vue';
import ValuesConfirmTransfer from './ValuesConfirmTransfer.vue';
import TransferTokenPreviewModal from './TransferTokenPreviewModal.vue';
import useTransferTokens, {
  ValueTextAreaType,
} from '@/composables/transfer/useTransferTokens';

import useWeb3 from '@/services/web3/useWeb3';

import {
  isRequired,
  isRowsTextArea,
  validColType,
} from '@/lib/utils/validations';

/**
 * STATE
 */
const tokenType = 'erc1155';
const selectedToken = ref<any>(null);
// const recipients = ref('');
const recipients = ref('0x8F61AE321DCb503af3764C2416DD3cB73D9c3c8D, ');
const recipientsValues = ref<ValueTextAreaType[]>([]);
const ruleCol = {
  0: ['isAddress'],
  1: ['isInteger'],
  2: ['isInteger'],
} as validColType;
const headers = ['address', 'tokenId', 'amount'];
const showPreviewModal = ref(false);
const isLoadingCheck = ref(false);
const errors = ref<string[]>([]);

/**
 * COMPOSABLES
 */
const {
  chainId,
  isChainSupportSendNft,
  configService,
  convertValueTextArea,
  checkBalanceErc1155,
} = useTransferTokens();
const { isWalletReady, startConnectWithInjectedProvider } = useWeb3();

/**
 * COMPUTED
 */

const submissionDisabled = computed(() => {
  return (
    !isChainSupportSendNft ||
    !selectedToken.value?.address ||
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
  selectedToken.value = token ? { ...token, type: tokenType } : null;
}

async function onTransferred(): Promise<void> {
  recipients.value = '';
}

async function onCheckToken(): Promise<void> {
  isLoadingCheck.value = true;
  errors.value = [];
  try {
    await checkBalanceErc1155(
      selectedToken.value.address,
      recipientsValues.value.filter(i => i.isValid)
    );
    showPreviewModal.value = true;
  } catch (error: any) {
    if (Array.isArray(error)) {
      errors.value = error;
    } else {
      errors.value = [error.toString()];
    }
  }
  isLoadingCheck.value = false;
}

/**
 * WATCH
 */

watch(recipients, async val => {
  errors.value = [];
  const rows = convertValueTextArea(val, ruleCol);
  recipientsValues.value = rows;
});
</script>

