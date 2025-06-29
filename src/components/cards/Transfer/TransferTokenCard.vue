<template>
  <BalCard class="relative card-container bg-blue" shadow="none" noBorder>
    <BalAlert
      v-if="!isChainSupprt"
      class="p-3 mb-4"
      type="error"
      size="sm"
      :title="$t('unsupportedNetwork')"
      block
    />
    <div
      class="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center"
    >
      <div>
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
        :rules="[isRequired(), isAddresAndAmount(1, false)]"
        validateOn="input"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </BalStack>
  </BalCard>
</template>

<script setup lang="ts">
import SelectTokenForTransfer from './SelectTokenForTransfer.vue';

import useTransferTokens from '@/composables/transfer/useTransferTokens';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import {
  isAddresAndAmountCheck,
  isRequired,
  isAddresAndAmount,
} from '@/lib/utils/validations';

/**
 * STATE
 */
const tokenType = ref('erc20');
const selectedToken = ref<any>(null);
const nativeBalance = ref({ value: '0', symbol: '' });
const recipients = ref('');
/**
 * COMPOSABLES
 */

const { chainId, isChainSupprt, fetchNativeBalance } = useTransferTokens();
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

/**
 * FUNCTIONS
 */
function handleSelectedToken(token: any): void {
  selectedToken.value = { ...token };
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
  const valid = isAddresAndAmountCheck(val, 1, false);
  console.log('------valid', valid);
});
</script>

<style lang="scss" scoped>
.btn-select-token {
  :deep {
    .content {
      @apply justify-between;
    }
  }
}
</style>
