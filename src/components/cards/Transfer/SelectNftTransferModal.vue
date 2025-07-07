<script setup lang="ts">
import { ref } from 'vue';

import TokenItemTransfer from './TokenItemTransfer.vue';
import ImportTokenLocal from './ImportTokenLocal.vue';
import { ExtendedTokenInfo } from '@/types/TokenList';
import useTokensLocal from '@/composables/transfer/useTokensLocal';

interface Props {
  open: boolean;
  type: 'erc721' | 'erc1155';
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  type: 'erc721',
});

const emit = defineEmits(['close', 'select']);

/**
 * STATE
 */
const searchText = ref<string>('');
const tokensSearch = ref<ExtendedTokenInfo[]>([]);

// Tabs state
const activeTab = ref('lists'); // 'lists' or 'tokens'
const tabs = [
  { id: 'lists', name: 'tokenLists' },
  { id: 'tokens', name: 'transfer.importToken' },
];

/**
 * COMPOSABLES
 */

const { erc721, erc1155 } = useTokensLocal();

/**
 * COMPUTED
 */
const tokens = computed((): ExtendedTokenInfo[] => {
  if (props.type == 'erc721') return erc721.value;
  return erc1155.value;
});
const tokensShow = computed((): ExtendedTokenInfo[] => {
  if (searchText.value) return tokensSearch.value;
  if (tokens.value?.length > 0) return tokens.value;
  return [];
});

/**
 * METHODS
 */
function onSelectToken(token: ExtendedTokenInfo): void {
  activeTab.value = 'lists';
  emit('select', token);
  emit('close');
}

function searchTokens(text: string): ExtendedTokenInfo[] {
  // TODO
  return [];
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
        <!-- <h5 class="mb-1">{{ $t('tokenSearch') }}</h5>
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
        </BalTextInput> -->
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
                :hideBalance="true"
                :balanceLoading="false"
                tabIndex="0"
              />
            </a>
          </RecycleScroller>
          <div
            v-else
            class="p-12 h-96 text-center text-secondary"
            v-text="$t('errorNoTokens')"
          />
        </div>
      </div>

      <!-- Tokens Tab Content -->
      <div v-else-if="activeTab === 'tokens'" class="pb-4">
        <ImportTokenLocal :type="props.type" @on-imported="onSelectToken" />
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


