<template>
  <div>
    <BalDropdown
      :options="tokenList"
      minWidth="40"
      class="w-60"
      @selected="handleSelectedToken"
    >
      <template #activator>
        <BalBtn outline size="sm" class="w-full btn-select-token" color="gray">
          <span class="text-gray-700">{{
            selectedToken
              ? selectedToken?.name || selectedToken?.symbol
              : $t('transfer.SelectAToken')
          }}</span>

          <BalIcon
            name="chevron-down"
            size="sm"
            class="ml-2 text-blue-500 group-hover:text-pink-500 dark:text-blue-400 dark:group-hover:text-yellow-500 transition-colors"
          />
        </BalBtn>
      </template>
      <template #option="{ option }">
        <div class="flex justify-between items-center w-full">
          <div class="flex items-center truncate">
            <span class="font-semibold">{{ option?.name }}</span>
            <span class="text-gray-400">&nbsp;{{ option?.symbol }}</span>
          </div>
          <div class="flex items-center ml-2">
            {{ fNum2(option?.balance, FNumFormats.token) }}
          </div>
        </div>
      </template>
      <template #dropdownFooter="{ hideDropdown }">
        <div>
          <div v-if="!tokenList?.length" class="py-4 text-center border-b">
            {{ $t('noData') }}
          </div>
          <BalBtn
            classCustom="white-blue"
            size="md"
            class="w-full"
            @click="
              () => {
                openModalImport();
                hideDropdown();
              }
            "
          >
            {{ $t('transfer.importToken') }}
          </BalBtn>
        </div>
      </template>
    </BalDropdown>
  </div>
</template>

<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
/**
 *  EMITS
 */
const emit = defineEmits<{
  (e: 'onSelected', value: any): void;
}>();
/**
 * STATE
 */

const selectedToken = ref<any>(null);

const tokenList = ref([
  {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: '6',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    balance: 0.5787598791,
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: '6',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    balance: 0,
  },
]);

/**
 * COMPOSABLES
 */

const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */

/**
 * FUNCTIONS
 */
function handleSelectedToken(token: any): void {
  selectedToken.value = { ...token };
  emit('onSelected', token);
}

function openModalImport(): void {
  // TODO
  console.log('-----openModalImport');
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
