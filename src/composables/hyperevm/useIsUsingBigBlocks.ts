/**
 * useIsUsingBigBlocks - Composable kiểm tra block mode hiện tại
 *
 * === FLOW ===
 * 1. Lấy address ví của user từ useWeb3() (pattern có sẵn)
 * 2. Lấy JsonRpcProvider từ rpcProviderService (service có sẵn)
 * 3. Gọi RPC method "eth_usingBigBlocks" với param là address
 *    -> method này là custom RPC riêng của HyperEVM, không có trên chain khác
 * 4. Trả về boolean: true = big blocks, false = small blocks
 * 5. Poll mỗi 5 giây để cập nhật trạng thái
 *
 * === TẠI SAO POLL? ===
 * Vì sau khi user toggle, cần vài giây để HyperEVM node cập nhật.
 * Poll giúp UI tự động reflect trạng thái mới.
 *
 * === PATTERN THEO PROJECT ===
 * - Import useWeb3 từ '@/services/web3/useWeb3' (giống SwapCard, bridge, etc.)
 * - Import rpcProviderService từ '@/services/rpc-provider/'
 * - Dùng ref() + watch() + onUnmounted() (Vue 3 Composition API)
 */

import { ref, watch, onUnmounted } from 'vue';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import useWeb3 from '@/services/web3/useWeb3';

export function useIsUsingBigBlocks() {
  // State - dùng ref() theo pattern project
  const isUsingBigBlocks = ref<boolean | null>(null); // null = chưa load
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  // Lấy thông tin ví từ useWeb3() - pattern giống SwapCard.vue, bridge.vue
  const { account, isWalletReady } = useWeb3();

  // Hàm gọi RPC để query block mode
  async function fetchBlockMode() {
    // Không query nếu ví chưa connect
    if (!isWalletReady.value || !account.value) {
      isUsingBigBlocks.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      /**
       * eth_usingBigBlocks là custom RPC method của HyperEVM
       * - Input: [userAddress] - address cần check
       * - Output: boolean - true nếu user đang dùng big blocks
       *
       * Dùng provider.send() để gọi raw RPC method
       * vì ethers.js không có wrapper cho method này.
       * rpcProviderService.jsonProvider là StaticJsonRpcProvider
       * (xem: src/services/rpc-provider/rpc-provider.service.ts)
       */
      const result = await rpcProviderService.jsonProvider.send(
        'eth_usingBigBlocks',
        [account.value]
      );
      isUsingBigBlocks.value = result;
    } catch (err) {
      console.error('Failed to fetch block mode:', err);
      error.value = err as Error;
      isUsingBigBlocks.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  // === POLLING MECHANISM ===
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  function startPolling() {
    stopPolling();
    fetchBlockMode(); // Fetch ngay lập tức
    pollInterval = setInterval(fetchBlockMode, 5000); // Poll mỗi 5s
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Watch wallet connection - bắt đầu poll khi ví connect
  watch(
    [() => account.value, () => isWalletReady.value],
    () => {
      if (isWalletReady.value && account.value) {
        startPolling();
      } else {
        stopPolling();
        isUsingBigBlocks.value = null;
      }
    },
    { immediate: true }
  );

  // Cleanup khi component unmount
  onUnmounted(() => stopPolling());

  return {
    isUsingBigBlocks, // Ref<boolean | null> - trạng thái block mode
    isLoading, // Ref<boolean> - đang loading
    error, // Ref<Error | null>
    refetch: fetchBlockMode, // Manual refetch
  };
}
