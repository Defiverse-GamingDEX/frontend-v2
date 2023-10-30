<script setup lang="ts">
import { computed, ref } from 'vue';

import SelectNetworkModal from '../modals/SelectNetworkModal.vue';
import useNumbers from '@/composables/useNumbers';

export type NetworkSelectProps = {
  modelValue: string | number;
  networkList: Array<any>;
  disabled?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<NetworkSelectProps>(), {
  modelValue: null,
  networkList: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: object): void;
}>();

/**
 * STATE
 */
const openNetworkModal = ref(false);

/**
 * COMPOSABLEs
 */
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const hasNetwork = computed(() => !!props.modelValue);

const network = computed((): Object | null => {
  if (!hasNetwork.value) return null;
  return getNetwork(props.modelValue);
});

/**
 * METHODS
 */
function toggleModal(): void {
  if (props.disabled) {
    return;
  }
  if (props?.networkList?.length > 0) {
    openNetworkModal.value = !openNetworkModal.value;
  }
}
function getNetwork(chain_id) {
  return props?.networkList?.find(item => item.chain_id_decimals === chain_id);
}
</script>

<template>
  <div>
    <div
      v-if="hasNetwork"
      :class="['token-select-input selected group', { disabled: disabled }]"
      @click="toggleModal"
    >
      <div class="item-info">
        <div class="item-img">
          <img width="48" height="48" :src="network.img_url" />
        </div>
        <div class="item-label">{{ network.name }}</div>
      </div>
      <BalIcon
        name="chevron-down"
        size="sm"
        class="ml-2 text-blue-600 group-hover:text-purple-500 dark:text-blue-400 dark:group-hover:text-yellow-500 transition-colors"
      />
    </div>

    <div
      v-else
      :class="{
        disabled: !networkList || networkList?.length === 0 || disabled,
      }"
      class="token-select-input unselected selectable"
      @click="toggleModal"
    >
      {{ $t('selectNetwork') }}
      <BalIcon name="chevron-down" size="sm" class="ml-2" />
    </div>

    <teleport to="#modal">
      <SelectNetworkModal
        v-if="openNetworkModal"
        :networkList="networkList"
        :networkChoose="network"
        @close="openNetworkModal = false"
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
    * {
      cursor: not-allowed;
    }
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
