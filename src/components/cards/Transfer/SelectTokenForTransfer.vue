<template>
  <div>
    <BalBtn
      outline
      size="md"
      class="w-full max-w-xs btn-select-token"
      color="gray"
      :disabled="!chainId"
      @click="onOpenSelectTokenModal"
    >
      <div v-if="selectedToken" class="flex flex-wrap items-center">
        <BalAsset
          :address="selectedToken.address"
          :iconURI="selectedToken.logoURI"
          :size="28"
          class="mr-2"
        />
        <span class="text-lg text-gray-700 truncate">{{
          truncateText(selectedToken?.name || selectedToken?.symbol, 16, 20, 0)
        }}</span>
      </div>
      <span v-else class="text-lg text-gray-700">{{
        $t('transfer.SelectAToken')
      }}</span>

      <BalIcon
        name="chevron-down"
        size="md"
        class="ml-2 text-blue-500 group-hover:text-pink-500 dark:text-blue-400 dark:group-hover:text-yellow-500 transition-colors"
      />
    </BalBtn>
    <teleport to="#modal">
      <SelectTokenTransferModal
        v-if="chainId"
        :key="chainId"
        :open="openSelectTokenModal"
        @close="openSelectTokenModal = false"
        @select="handleSelectedToken"
      />
    </teleport>
  </div>
</template>

<script setup lang="ts">
import SelectTokenTransferModal from './SelectTokenTransferModal.vue';
import { truncateText } from '@/plugins/utils.js';

interface Props {
  chainId: number;
  selectedToken: any;
}

const props = withDefaults(defineProps<Props>(), {
  chainId: 0,
  selectedToken: null,
});

/**
 *  EMITS
 */
const emit = defineEmits<{
  (e: 'onSelected', value: any): void;
}>();

/**
 * STATE
 */

const openSelectTokenModal = ref(false);
const { chainId } = toRefs(props);

/**
 * FUNCTIONS
 */
function handleSelectedToken(token: any): void {
  emit('onSelected', token ? { ...token } : null);
}

function onOpenSelectTokenModal(): void {
  openSelectTokenModal.value = true;
}

/**
 * WATCHERS
 */
watch(
  chainId,
  () => {
    handleSelectedToken(null);
  },
  { immediate: true }
);
</script>

<style scoped>
.btn-select-token :deep(.content) {
  @apply justify-between;
}
</style>
