<script setup lang="ts">
import { computed } from 'vue';
import { useIsUsingBigBlocks } from '@/composables/hyperevm/useIsUsingBigBlocks';
import { useSetUsingBigBlocks } from '@/composables/hyperevm/useSetUsingBigBlocks';
import useWeb3 from '@/services/web3/useWeb3';
import useNotifications from '@/composables/useNotifications';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    isCreatePoolContext?: boolean;
  }>(),
  {
    isCreatePoolContext: false,
  }
);

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
const { addNotification } = useNotifications();

async function handleSwitchToMode(mode: boolean) {
  if (isUsingBigBlocks.value === mode) {
    emit('success');
    return;
  }
  try {
    await setUsingBigBlocks(mode);
    addNotification({
      type: 'success',
      title: 'Block Mode Updated',
      message: `Successfully switched to ${
        mode ? 'BIG BLOCKS' : 'SMALL BLOCKS'
      }.`,
    });
    emit('success');
  } catch (err) {
    console.error('Failed to switch to mode', err);
    addNotification({
      type: 'error',
      title: 'Toggle Failed',
      message: err instanceof Error ? err.message : 'Unknown error occurred.',
    });
  }
}
</script>

<template>
  <BalModal
    :show="isOpen"
    :title="
      isCreatePoolContext ? 'Action Required: Big Blocks' : 'Change Block State'
    "
    @close="$emit('close')"
  >
    <div class="flex flex-col items-center px-2 pb-4">
      <img
        src="@/assets/images/gamingdex_icon.png"
        alt="GamingDEX"
        class="object-contain mb-4 w-16 h-16"
      />

      <p class="mb-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Toggle your account between big and small blocks on HyperEVM. Ensure
        you've moved HYPE from the L1 first (<a
          href="https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/evm"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 dark:text-blue-400 hover:underline"
          >docs</a
        >).
      </p>

      <p
        v-if="isCreatePoolContext"
        class="mb-6 text-sm text-center text-gray-500 dark:text-gray-400"
      >
        Creating a pool requires deploying a smart contract. You must switch
        your account to
        <span class="font-bold text-blue-600 dark:text-blue-400"
          >BIG BLOCKS</span
        >
        to proceed.
      </p>

      <div class="flex gap-4 mb-4 w-full">
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
        block
      >
        <div
          v-if="
            toggleError.message.includes(
              'Must deposit before performing actions'
            )
          "
          class="text-left"
        >
          <p class="mb-3 text-sm font-medium">
            Your wallet is new to the Hyperliquid network. To prevent spam, you
            must make an initial deposit on the L1 exchange to activate your
            account before switching modes.
          </p>

          <div class="flex gap-2 items-center">
            <a
              href="https://app.hyperliquid.xyz/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Open Hyperliquid Exchange ↗
            </a>
            <BalTooltip width="320" placement="top">
              <template #activator>
                <BalIcon
                  name="info"
                  size="sm"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                />
              </template>
              <div class="text-left">
                <p class="mb-2 text-sm font-semibold">How to deposit:</p>
                <ol class="space-y-1 text-xs list-decimal list-inside">
                  <li>Click the link above to open Hyperliquid Portfolio.</li>
                  <li>Click the <b>Deposit</b> button on the header.</li>
                  <li>
                    Make sure you have some USDC on networks like
                    <b>Arbitrum</b>, <b>Optimism</b>, etc.
                  </li>
                  <li>
                    Select <b>USDC</b> as the Asset and choose your
                    <b>Deposit Chain</b>.
                  </li>
                  <li>Enter an amount (e.g., $1) and click <b>Deposit</b>.</li>
                  <li>
                    Sign the transaction in MetaMask. Return here when done!
                  </li>
                </ol>
                <img
                  src="@/assets/images/hyperliquid_deposit_guide.png"
                  alt="Deposit Guide"
                  class="object-contain mx-auto mt-3 max-w-full h-36 rounded-md border border-gray-600 shadow-sm"
                  @error="(e) => (e.target as HTMLImageElement).style.display='none'"
                />
              </div>
            </BalTooltip>
          </div>
        </div>
        <div v-else class="text-left">
          {{ toggleError.message }}
        </div>
      </BalAlert>
    </div>
  </BalModal>
</template>
