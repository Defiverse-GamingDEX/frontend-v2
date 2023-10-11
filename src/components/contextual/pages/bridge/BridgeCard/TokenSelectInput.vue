<script setup lang="ts">
import { computed, ref } from 'vue';

import SelectTokenModal from '../modals/SelectTokenModal.vue';
import useNumbers from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { isSameAddress } from '@/lib/utils';
import { truncateText } from '@/plugins/utils.js';
import { BRIDGE_TOKENS } from '@/constants/bridge/tokens';
export type TokenSelectProps = {
  modelValue: string;
  fixed?: boolean;
  weight?: number | string;
  disableInjection?: boolean;
  hideTokenLists?: boolean;
  excludedTokens?: string[];
  options?: string[];
  subsetTokens?: string[];
  ignoreBalances?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<TokenSelectProps>(), {
  modelValue: '',
  fixed: false,
  weight: 0,
  disableInjection: false,
  hideTokenLists: false,
  ignoreBalances: false,
  excludedTokens: () => [],
  subsetTokens: () => [],
  options: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

/**
 * STATE
 */
const openTokenModal = ref(false);

/**
 * COMPOSABLEs
 */
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const hasToken = computed(() => !!props.modelValue);

const token = computed((): Object | null => {
  if (!hasToken.value) return null;
  return getToken(props.modelValue);
});

/**
 * METHODS
 */
function toggleModal(): void {
  if (!props.fixed) openTokenModal.value = !openTokenModal.value;
}
function getToken(tokenAddress) {
  return BRIDGE_TOKENS.filter(item => item.address === tokenAddress);
}
</script>

<template>
  <div>
    <div
      v-if="hasToken"
      :class="['token-select-input selected group', { selectable: !fixed }]"
      @click="toggleModal"
    >
      <div class="w-8">
        <BalAsset :address="token?.address" class="shadow" />
      </div>
      <span class="flex items-center text-base font-medium">
        {{ truncateText(token?.symbol, 16, 5, 5) }}
      </span>
      <span v-if="Number(weight) > 0" class="ml-2 text-secondary">
        {{
          fNum2(weight, {
            style: 'percent',
            maximumFractionDigits: 0,
          })
        }}
      </span>
      <BalIcon
        name="chevron-down"
        size="sm"
        class="ml-2 text-blue-600 group-hover:text-purple-500 dark:text-blue-400 dark:group-hover:text-yellow-500 transition-colors"
      />
    </div>

    <div
      v-else
      class="token-select-input unselected selectable"
      @click="toggleModal"
    >
      {{ $t('selectToken') }}
      <BalIcon name="chevron-down" size="sm" class="ml-2" />
    </div>

    <teleport to="#modal">
      <SelectTokenModal
        v-if="openTokenModal"
        :tokensList="BRIDGE_TOKENS"
        @close="openTokenModal = false"
        @select="emit('update:modelValue', $event)"
      />
    </teleport>
  </div>
</template>

<style scoped>
.token-select-input {
  @apply shadow rounded-lg flex items-center h-10 px-2 whitespace-nowrap;
  @apply text-sm;

  font-variation-settings: 'wght' 700;
}

.selectable {
  @apply cursor-pointer hover:shadow-none transition-shadow;
}

.unselected {
  @apply bg-blue-500 dark:bg-blue-400 text-white;
}

.selected {
  @apply bg-gray-50 dark:bg-gray-700 text-black dark:text-white;
}
</style>
