<script setup lang="ts">
import { computed } from 'vue';
import { useIsUsingBigBlocks } from '@/composables/hyperevm/useIsUsingBigBlocks';
import { useSetUsingBigBlocks } from '@/composables/hyperevm/useSetUsingBigBlocks';
import useWeb3 from '@/services/web3/useWeb3';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const { isWalletReady } = useWeb3();
const { isUsingBigBlocks } = useIsUsingBigBlocks();
const {
  setUsingBigBlocks,
  isPending: isToggling,
  error: toggleError,
} = useSetUsingBigBlocks();

const isDisabled = computed(() => isToggling.value || !isWalletReady.value);

async function handleSwitchToMode(mode: boolean) {
  if (isUsingBigBlocks.value === mode) {
    emit('success');
    return;
  }
  try {
    await setUsingBigBlocks(mode);
    emit('success');
  } catch (err) {
    console.error('Failed to switch to mode', err);
  }
}
</script>

<template>
  <BalModal
    :show="isOpen"
    title="Action Required: Big Blocks"
    @close="$emit('close')"
  >
    <div class="flex flex-col items-center px-2 pb-4">
      <img
        src="@/assets/images/gamingdex_icon.png"
        alt="GamingDEX"
        class="object-contain mb-4 w-16 h-16"
      />

      <p class="mb-6 text-sm text-center text-gray-500 dark:text-gray-400">
        Creating a pool requires deploying a smart contract. You must switch
        your account to
        <span class="font-bold text-white">BIG BLOCKS</span> to proceed.
      </p>

      <div class="flex mb-4 w-full gap-4">
        <BalBtn
          :color="isUsingBigBlocks === true ? 'blue' : 'gray'"
          :loading="isToggling && isUsingBigBlocks !== true"
          :disabled="isDisabled"
          loadingLabel="Switching..."
          outline
          block
          @click="handleSwitchToMode(true)"
        >
          BIG BLOCKS
        </BalBtn>

        <BalBtn
          :color="isUsingBigBlocks === false ? 'blue' : 'gray'"
          :loading="isToggling && isUsingBigBlocks !== false"
          :disabled="isDisabled"
          loadingLabel="Switching..."
          outline
          block
          @click="handleSwitchToMode(false)"
        >
          SMALL BLOCKS
        </BalBtn>
      </div>

      <BalAlert
        v-if="toggleError"
        class="mt-4 w-full"
        type="error"
        title="Toggle Failed"
        :description="toggleError.message"
        block
      />
    </div>
  </BalModal>
</template>
