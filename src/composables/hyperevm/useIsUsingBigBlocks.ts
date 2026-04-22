/**
 * useIsUsingBigBlocks - Composable to check current block mode
 *
 * === FLOW ===
 * 1. Get user wallet address from useWeb3() (existing pattern)
 * 2. Get JsonRpcProvider from rpcProviderService (existing service)
 * 3. Call RPC method "eth_usingBigBlocks" with address as param
 *    -> this is a custom RPC specific to HyperEVM, not available on other chains
 * 4. Return boolean: true = big blocks, false = small blocks
 * 5. Poll every 5 seconds to update status
 *
 * === WHY POLL? ===
 * Because after user toggles, it takes a few seconds for the HyperEVM node to update.
 * Polling helps the UI automatically reflect the new status.
 *
 * === PROJECT PATTERNS ===
 * - Import useWeb3 from '@/services/web3/useWeb3' (like SwapCard, bridge, etc.)
 * - Import rpcProviderService from '@/services/rpc-provider/'
 * - Use ref() + watch() + onUnmounted() (Vue 3 Composition API)
 */

import { ref, watch, onUnmounted } from 'vue';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import useWeb3 from '@/services/web3/useWeb3';

export function useIsUsingBigBlocks() {
  // State - use ref() following project pattern
  const isUsingBigBlocks = ref<boolean | null>(null); // null = not loaded
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  // Get wallet info from useWeb3() - pattern like SwapCard.vue, bridge.vue
  const { account, isWalletReady } = useWeb3();

  // Function to call RPC to query block mode
  async function fetchBlockMode() {
    // Don't query if wallet is not connected
    if (!isWalletReady.value || !account.value) {
      isUsingBigBlocks.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      /**
       * eth_usingBigBlocks is a custom RPC method of HyperEVM
       * - Input: [userAddress] - address to check
       * - Output: boolean - true if user is using big blocks
       *
       * Use provider.send() to call raw RPC method
       * because ethers.js doesn't have a wrapper for this method.
       * rpcProviderService.jsonProvider is a StaticJsonRpcProvider
       * (see: src/services/rpc-provider/rpc-provider.service.ts)
       */
      const result = await rpcProviderService.jsonProvider.send(
        'eth_usingBigBlocks',
        [account.value]
      );
      console.log(`[DEBUG] RPC eth_usingBigBlocks for ${account.value} returned:`, result);
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
    fetchBlockMode(); // Fetch immediately
    pollInterval = setInterval(fetchBlockMode, 5000); // Poll every 5s
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Watch wallet connection - start polling when wallet connects
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

  // Cleanup when component unmounts
  onUnmounted(() => stopPolling());

  return {
    isUsingBigBlocks, // Ref<boolean | null> - block mode status
    isLoading, // Ref<boolean> - loading state
    error, // Ref<Error | null>
    refetch: fetchBlockMode, // Manual refetch
  };
}
