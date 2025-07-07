<template>
  <BalCard class="relative card-container bg-blue" shadow="none" noBorder>
    <BalAlert
      v-if="!isWalletReady"
      class="p-3 mb-4"
      type="error"
      size="md"
      :title="$t('connectYourWallet')"
      block
    />
    <BalAlert
      v-else-if="!isChainSupprt"
      class="p-3 mb-4"
      type="error"
      size="md"
      :title="$t('unsupportedNetwork')"
      block
    />
    <div
      class="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center"
    >
      <div class="flex-1">
        <BalStack spacing="xs" vertical>
          <h6 class="mb-1">
            {{ $t('transfer.tokenType') }}
          </h6>
          <BalBtnGroup v-model="tokenType" :options="optionsTokenType" />
        </BalStack>
        <!--  -->
        <BalStack
          v-show="tokenType == 'erc20'"
          spacing="xs"
          vertical
          class="mt-6"
        >
          <h6 class="mb-1">
            {{ $t('transfer.SelectTheToken') }}
          </h6>

          <SelectTokenForTransfer
            :chainId="chainId"
            :selectedToken="selectedToken"
            @on-selected="handleSelectedToken"
          />
        </BalStack>
      </div>
      <div class="flex mt-4 md:mt-4 md:mr-10">
        <span class="mr-1"> {{ $t('balance') }}: </span>
        <span class="font-semibold text-gray-700 min-w-40">
          {{ fNum2(tokenShow?.balance || 0, FNumFormats.token) }}
          <span class="text-gray-400"> &nbsp;{{ tokenShow?.symbol }}</span>
        </span>
      </div>
    </div>
    <!--  -->
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
    <!--  -->
    <BalStack v-if="recipientsValues.length" spacing="xs" vertical class="mt-6">
      <ValuesConfirmTransfer
        :data="recipientsValues"
        :headers="['address', 'amount']"
        :symbol="tokenShow?.symbol"
        :total="amountTotal"
        :remaining="amountRemaining"
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
      :token="tokenShow"
      :amount="amountTotal"
      :addressContract="disperseAddress"
      :amountRemaining="amountRemaining"
      :recipientsValues="recipientsValues"
      @close="showPreviewModal = false"
      @transferred="onTransferred"
    />
  </BalCard>
</template>

<script setup lang="ts">
import SelectTokenForTransfer from './SelectTokenForTransfer.vue';
import ValuesConfirmTransfer from './ValuesConfirmTransfer.vue';
import TransferTokenPreviewModal from './TransferTokenPreviewModal.vue';
import { bnum } from '@/lib/utils';
import useTransferTokens, {
  ValueTextAreaType,
} from '@/composables/transfer/useTransferTokens';
import useListToken from '@/composables/transfer/useListToken';
import { ExtendedTokenInfo } from '@/types/TokenList';
import useWeb3 from '@/services/web3/useWeb3';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import {
  isRequired,
  isRowsTextArea,
  validColType,
} from '@/lib/utils/validations';

/**
 * STATE
 */
const tokenType = ref('erc20');
const selectedToken = ref<any>(null);
const nativeToken = ref<ExtendedTokenInfo>();
const recipients = ref('');
const recipientsValues = ref<ValueTextAreaType[]>([]);
const amountTotal = ref('0');
const ruleCol = { 0: ['isAddress'], 1: ['isAmount'] } as validColType;
const showPreviewModal = ref(false);

/**
 * COMPOSABLES
 */
const {
  chainId,
  account,
  isChainSupprt,
  configService,
  fetchNativeBalance,
  fetchErc20Balance,
  convertValueTextArea,
} = useTransferTokens();
const { isWalletReady, startConnectWithInjectedProvider } = useWeb3();
const { fNum2 } = useNumbers();
const { refetchBalances } = useListToken();

/**
 * COMPUTED
 */
const optionsTokenType = computed(() => {
  const isBsc = [56, 97].includes(Number(chainId.value));
  return [
    { label: isBsc ? 'BEP20' : 'ERC20', value: 'erc20' },
    { label: 'Native', value: 'native' },
  ];
});

const isNative = computed(() => {
  return tokenType.value == 'native';
});

const tokenShow = computed(() => {
  if (isNative.value) {
    return nativeToken.value;
  }
  return selectedToken.value;
});

const amountRemaining = computed(() => {
  return bnum(tokenShow?.value?.balance || 0)
    .minus(amountTotal.value)
    .toString();
});

const submissionDisabled = computed(() => {
  return (
    recipientsValues.value?.length <= 0 ||
    bnum(tokenShow.value?.balance).isLessThanOrEqualTo(0) ||
    bnum(amountRemaining.value).isLessThanOrEqualTo(0)
  );
});

const disperseAddress = computed(() => {
  return configService.value?.addresses?.disperse || '';
});

/**
 * FUNCTIONS
 */
function handleSelectedToken(token: any): void {
  selectedToken.value = token ? { ...token, type: 'erc20' } : null;
}

async function refreshBalance(): Promise<void> {
  if (nativeToken.value) {
    nativeToken.value = await fetchNativeBalance();
  }
  if (selectedToken.value) {
    selectedToken.value = await fetchErc20Balance(selectedToken.value);
  }
}

async function onTransferred(): Promise<void> {
  refreshBalance();
  refetchBalances.value();
  recipients.value = '';
}

/**
 * WATCH
 */
watch(isNative, async val => {
  if (val) {
    nativeToken.value = await fetchNativeBalance();
  }
});

watch(account, async val => {
  if (val) {
    refreshBalance();
  }
});

watch(chainId, async val => {
  if (val) {
    refreshBalance();
  }
});

watch(recipients, async val => {
  const rows = convertValueTextArea(val, ruleCol);
  recipientsValues.value = rows;
  amountTotal.value = rows
    .reduce((totalValue, { value }) => totalValue.plus(value[1] ?? 0), bnum(0))
    .toString();
});
</script>

