<script setup lang="ts">
import { computed, ref } from 'vue';

import SelectTokenModal from '../modals/SelectTokenModal.vue';
import useNumbers from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { isSameAddress } from '@/lib/utils';
import { truncateText } from '@/plugins/utils.js';
export type TokenSelectProps = {
  modelValue: string;
  tokensList?: Array<any>;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<TokenSelectProps>(), {
  modelValue: '',
  tokensList: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: object): void;
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
  if (props?.tokensList?.length > 0) {
    openTokenModal.value = !openTokenModal.value;
  }
}
function getToken(tokenAddress) {
  console.log(props?.tokensList, ' props?.tokensList');
  return props?.tokensList?.find(item => item.address === tokenAddress);
}
</script>

<template>
  <div>
    <div
      v-if="hasToken"
      :class="['token-select-input selected group']"
      @click="toggleModal"
    >
      <div class="item-info">
        <div class="item-img">
          <img width="48" height="48" :src="token?.logoURI" />
        </div>
        <div class="item-label">
          {{ truncateText(token?.symbol, 16, 5, 5) }}
        </div>
      </div>

      <BalIcon
        name="chevron-down"
        size="sm"
        class="ml-2 text-blue-600 group-hover:text-purple-500 dark:text-blue-400 dark:group-hover:text-yellow-500 transition-colors"
      />
    </div>

    <div
      v-else
      class="token-select-input unselected selectable"
      :class="{ disabled: !tokensList || tokensList?.length === 0 }"
      @click="toggleModal"
    >
      {{ $t('selectToken') }}
      <BalIcon name="chevron-down" size="sm" class="ml-2" />
    </div>

    <teleport to="#modal">
      <SelectTokenModal
        v-if="openTokenModal"
        :tokensList="tokensList"
        :tokenChoose="token"
        @close="openTokenModal = false"
        @select="emit('update:modelValue', $event)"
      />
    </teleport>
  </div>
</template>

<style scoped lang="scss">
.token-select-input {
  @apply shadow rounded-lg flex items-center h-10 px-2 whitespace-nowrap;
  @apply text-sm;

  font-variation-settings: 'wght' 700;
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
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
.item-info {
  display: flex;
  align-items: center;

  cursor: pointer;

  .item-img {
    margin-right: 8px;
    width: 24px;
    height: 24px;
    > img {
      width: 100%;
    }
  }
  .item-label {
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: unset;
    letter-spacing: 0px;
    color: #0a425c;
  }
}
</style>
