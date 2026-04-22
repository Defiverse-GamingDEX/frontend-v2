<script setup lang="ts">
/**
 * HyperEVM Big Blocks Page
 *
 * Giao diện toggle big/small blocks.
 * === SỬ DỤNG COMPONENTS CÓ SẴN ===
 * - BalCard: card container (global component, auto-import)
 * - BalBtn: button BIG/SMALL (global component, auto-import)
 * - BalAlert: error message (global component, auto-import)
 *
 * === PATTERN THEO PROJECT ===
 * - <script setup lang="ts"> giống faucet.vue, swap.vue
 * - useWeb3() cho wallet state
 * - Tailwind classes cho layout
 */
import { computed } from 'vue';
import { useIsUsingBigBlocks } from '@/composables/hyperevm/useIsUsingBigBlocks';
import { useSetUsingBigBlocks } from '@/composables/hyperevm/useSetUsingBigBlocks';
import useWeb3 from '@/services/web3/useWeb3';

// ===== COMPOSABLES =====

const { isWalletReady, toggleWalletSelectModal } = useWeb3();

// Query block mode hiện tại (poll mỗi 5s tự động)
const { isUsingBigBlocks, isLoading: isQuerying } = useIsUsingBigBlocks();

// Mutation toggle block mode
const {
  setUsingBigBlocks,
  isPending: isToggling,
  error: toggleError,
} = useSetUsingBigBlocks();

// ===== COMPUTED =====

// Label trạng thái hiện tại
const currentModeLabel = computed(() => {
  if (!isWalletReady.value) return 'Not Connected';
  if (isQuerying.value && isUsingBigBlocks.value === null) return 'Loading...';
  if (isUsingBigBlocks.value === null) return 'Unknown';
  return isUsingBigBlocks.value ? 'BIG' : 'SMALL';
});

const isDisabled = computed(() => isToggling.value || !isWalletReady.value);

// ===== METHODS =====

/**
 * handleToggle - Khi user click BIG hoặc SMALL
 * Nếu user đã ở mode đó → không làm gì
 */
async function handleToggle(mode: boolean) {
  if (isUsingBigBlocks.value === mode) return;
  try {
    await setUsingBigBlocks(mode);
  } catch (err) {
    // Error đã được set trong composable
  }
}
</script>

<template>
  <!--
    Layout: center card giữa trang
    Dùng flex center, same pattern như swap page centering
  -->
  <div class="flex justify-center items-start min-h-[60vh] px-4 mt-16">
    <!--
      === BalCard ===
      Component có sẵn: src/components/_global/BalCard/BalCard.vue
      Props:
        - noBorder: bỏ border mặc định
        - shadow="xl": shadow size (sm/md/lg/xl/2xl)
      Dark mode: BalCard tự thêm class dark:bg-gray-850 (#162031)
    -->
    <BalCard class="w-full max-w-lg" noBorder shadow="xl">
      <!-- MASCOT IMAGE -->
      <div class="flex justify-center mb-4">
        <img
          src="@/assets/images/gamingdex_icon.png"
          alt="GamingDEX"
          class="w-20 h-20 object-contain"
        />
      </div>

      <!-- TITLE -->
      <h3 class="text-center text-white mb-2">HyperEVM Big Blocks</h3>

      <!-- DESCRIPTION -->
      <p class="text-center text-sm text-gray-400 mb-6 px-2">
        Toggle your account between big and small blocks on HyperEVM.
        Ensure you've moved HYPE from the L1 first
        (<a
          href="https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 hover:text-purple-600 dark:text-blue-400 dark:hover:text-yellow-500 transition-colors"
          >docs</a
        >).
      </p>

      <!--
        === TOGGLE BUTTONS (khi đã connect ví) ===
        Dùng BalBtn component có sẵn
        Pattern giống BalBtnGroup: outline + color="blue" cho active, "gray" cho inactive
        (xem: src/components/_global/BalBtnGroup/BalBtnGroup.vue)
      -->
      <div v-if="isWalletReady" class="flex gap-4 mb-4">
        <!--
          NÚT BIG
          - outline: border style
          - color="blue" nếu đang active, "gray" nếu không
          - loading: hiện spinner khi đang toggle
          - disabled: khi đang xử lý
          - block: full width
        -->
        <BalBtn
          :color="isUsingBigBlocks === true ? 'blue' : 'gray'"
          :loading="isToggling && isUsingBigBlocks !== true"
          :disabled="isDisabled"
          :loadingLabel="'Switching...'"
          outline
          block
          @click="handleToggle(true)"
        >
          BIG
        </BalBtn>

        <!-- NÚT SMALL - tương tự -->
        <BalBtn
          :color="isUsingBigBlocks === false ? 'blue' : 'gray'"
          :loading="isToggling && isUsingBigBlocks !== false"
          :disabled="isDisabled"
          :loadingLabel="'Switching...'"
          outline
          block
          @click="handleToggle(false)"
        >
          SMALL
        </BalBtn>
      </div>

      <!--
        === CONNECT WALLET (khi chưa connect) ===
        Pattern từ HeroConnectWalletButton.vue:
        toggleWalletSelectModal(true) mở modal wallet
      -->
      <div v-else class="mb-4">
        <BalBtn color="primary" block @click="toggleWalletSelectModal(true)">
          Connect Wallet
        </BalBtn>
      </div>

      <!-- CURRENT STATUS -->
      <div class="text-center text-sm text-gray-400">
        CURRENT:
        <span class="font-bold text-white">{{ currentModeLabel }}</span>
      </div>

      <!--
        === ERROR MESSAGE ===
        BalAlert component có sẵn: src/components/_global/BalAlert/BalAlert.vue
        Props: type="error", title, description, block
        Pattern giống SwapCard.vue error display
      -->
      <BalAlert
        v-if="toggleError"
        class="mt-4"
        type="error"
        :title="'Toggle Failed'"
        :description="toggleError.message"
        block
      />
    </BalCard>
  </div>
</template>
