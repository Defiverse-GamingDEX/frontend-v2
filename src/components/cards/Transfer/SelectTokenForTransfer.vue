<template>
  <div>
    <BalBtn
      outline
      size="md"
      class="w-60 btn-select-token"
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
          truncateText(selectedToken?.name || selectedToken?.symbol, 16, 14, 0)
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
}

const props = withDefaults(defineProps<Props>(), {
  chainId: 0,
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
const selectedToken = ref<any>(null);
const openSelectTokenModal = ref(false);
const { chainId } = toRefs(props);

/**
 * FUNCTIONS
 */
function handleSelectedToken(token: any): void {
  console.log('-------token', token);
  selectedToken.value = token ? { ...token } : null;
  emit('onSelected', token);
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
