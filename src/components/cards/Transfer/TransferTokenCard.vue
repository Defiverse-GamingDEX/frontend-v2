<template>
  <BalCard
    class="relative !overflow-visible card-container bg-blue"
    shadow="none"
    noBorder
  >
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
          v-if="tokenType == 'erc20'"
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
  </BalCard>
</template>

<script setup lang="ts">
import SelectTokenForTransfer from './SelectTokenForTransfer.vue';

import useWeb3 from '@/services/web3/useWeb3';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { chainIdsForTransferToken } from '@/constants/networksToSelect';

/**
 * STATE
 */
const tokenType = ref('erc20');
const selectedToken = ref<any>(null);
const nativeBalance = ref('0');
/**
 * COMPOSABLES
 */

const { chainId, account } = useWeb3();
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

const isChainSupprt = computed(() => {
  return chainIdsForTransferToken.includes(Number(chainId.value));
});

const isNative = computed(() => {
  return tokenType.value == 'native';
});

const balanceShow = computed(() => {
  if (isNative.value) {
    return {
      value: nativeBalance.value || 0,
      symbol: 'ETH',
    };
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
