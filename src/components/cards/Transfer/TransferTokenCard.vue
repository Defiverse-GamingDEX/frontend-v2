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
          {{ fNum2(balanceShow.value, FNumFormats.token) }}
          <span class="text-gray-400"> &nbsp;{{ balanceShow?.symbol }}</span>
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
        :symbol="balanceShow?.symbol"
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
  </BalCard>
</template>

<script setup lang="ts">
import SelectTokenForTransfer from './SelectTokenForTransfer.vue';
import ValuesConfirmTransfer from './ValuesConfirmTransfer.vue';
import { bnum } from '@/lib/utils';
import useTransferTokens, {
  ValueTextAreaType,
} from '@/composables/transfer/useTransferTokens';
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
const nativeBalance = ref({ value: '0', symbol: '' });
// const recipients = ref('');
const recipients = ref('0xf9209B6F49BB9fD73422BA834f4cD444aE7ceacE, 1');
const recipientsValues = ref<ValueTextAreaType[]>([]);
const amountTotal = ref('0');
const ruleCol = { 0: ['isAddress'], 1: ['isAmount'] } as validColType;
const showPreviewModal = ref(false);

/**
 * COMPOSABLES
 */
const { chainId, isChainSupprt, fetchNativeBalance, convertValueTextArea } =
  useTransferTokens();
const { isWalletReady, startConnectWithInjectedProvider } = useWeb3();
const { fNum2 } = useNumbers();

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

const balanceShow = computed(() => {
  if (isNative.value) {
    return nativeBalance.value;
  }
  return {
    value: selectedToken.value?.balance || 0,
    symbol: selectedToken.value?.symbol,
  };
});

const amountRemaining = computed(() => {
  return bnum(balanceShow?.value.value || 0)
    .minus(amountTotal.value)
    .toString();
});

const submissionDisabled = computed(() => {
  return (
    recipientsValues.value?.length <= 0 ||
    bnum(balanceShow?.value.value).isLessThanOrEqualTo(0) ||
    bnum(amountRemaining.value).isLessThanOrEqualTo(0)
  );
});

/**
 * FUNCTIONS
 */
function handleSelectedToken(token: any): void {
  selectedToken.value = token;
}

/**
 * WATCH
 */
watch(isNative, async val => {
  if (val) {
    nativeBalance.value = await fetchNativeBalance();
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

