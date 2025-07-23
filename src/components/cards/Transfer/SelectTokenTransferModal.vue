<script setup lang="ts">
import { ref } from 'vue';

import TokenItemTransfer from './TokenItemTransfer.vue';
import ImportTokenLocal from './ImportTokenLocal.vue';
import { TokenInfo } from '@/types/TokenList';
import useListToken from '@/composables/transfer/useListToken';

// Augment TokenInfo interface to allow for owner property
declare module '@/types/TokenList' {
  interface TokenInfo {
    price?: number;
    balance?: string;
    value?: number;
  }
}

interface Props {
  open: boolean;
  ignoreBalances?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  ignoreBalances: false,
});

const emit = defineEmits(['close', 'select']);

/**
 * STATE
 */
const searchText = ref<string>('');
const tokensSearch = ref<TokenInfo[]>([]);

// Tabs state
const activeTab = ref('lists'); // 'lists' or 'tokens'
const tabs = [
  { id: 'lists', name: 'tokenLists' },
  { id: 'tokens', name: 'transfer.importToken' },
];

/**
 * COMPOSABLES
 */

const { tokensWithValues, isLoadingTokens, dynamicDataLoading, searchTokens } =
  useListToken();

/**
 * COMPUTED
 */
const tokensShow = computed((): TokenInfo[] => {
  if (searchText.value) return tokensSearch.value;
  if (tokensWithValues.value?.length > 0) return tokensWithValues.value;
  return [];
});

/**
 * METHODS
 */
function onSelectToken(token: TokenInfo): void {
  activeTab.value = 'lists';
  emit('select', token);
  emit('close');
}

/**
 * WATCHERS
 */

let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchText, newVal => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    tokensSearch.value = searchTokens(newVal);
  }, 500);
});
</script>

<template>
  <BalModal :show="open" noContentPad @close="$emit('close')">
    <!-- Tabs -->

    <template #tabs>
      <div class="flex w-full border-b dark:border-gray-900 tabs-container">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="flex-1 py-3 font-bold text-center transition cursor-pointer"
          :class="{
            'active-tab': activeTab === tab.id,
            'inactive-tab': activeTab !== tab.id,
          }"
          @click="activeTab = tab.id"
        >
          {{ $t(tab.name) }}
        </div>
      </div>
    </template>
    <div class="p-4">
      <!-- Lists Tab Content -->
      <div v-if="activeTab === 'lists'">
        <h5 class="mb-1">{{ $t('tokenSearch') }}</h5>
        <BalTextInput
          v-model="searchText"
          name="tokenSearchInput"
          :placeholder="$t('searchBy')"
          size="sm"
          class="mb-4 w-full"
          autoFocus
        >
          <template #prepend>
            <div class="flex justify-center items-center w-8 h-full">
              <BalIcon name="search" size="sm" class="mr-2 text-gray-500" />
            </div>
          </template>
        </BalTextInput>
        <div class="overflow-hidden">
          <RecycleScroller
            v-if="(tokensShow?.length || 0) > 0"
            v-slot="{ item: token }"
            class="overflow-y-scroll list-height"
            :items="tokensShow"
            :itemSize="70"
            keyField="address"
            :buffer="100"
          >
            <a @click="onSelectToken(token)">
              <TokenItemTransfer
                :token="token"
                :hideBalance="ignoreBalances"
                :balanceLoading="dynamicDataLoading"
                tabIndex="0"
              />
            </a>
          </RecycleScroller>
          <div
            v-else-if="isLoadingTokens"
            class="flex justify-center items-center h-96"
          >
            <BalLoadingIcon />
          </div>
          <div
            v-else
            class="p-12 h-96 text-center text-secondary"
            v-text="$t('errorNoTokens')"
          />
        </div>
      </div>

      <!-- Tokens Tab Content -->
      <div v-else-if="activeTab === 'tokens'" class="pb-4">
        <ImportTokenLocal @on-imported="onSelectToken" />
      </div>
    </div>
  </BalModal>
</template>

<style scoped>
.list-height {
  height: 70vh;
}

.tabs-container {
  margin-top: -4px;
}

.active-tab {
  background-color: #f9fafb;
  border-bottom: 2px solid #3b82f6;
  font-weight: 500;
}

.dark .active-tab {
  background-color: #1f2937;
}

.inactive-tab:hover {
  background-color: #f3f4f6;
}

.dark .inactive-tab:hover {
  background-color: #374151;
}
</style>


