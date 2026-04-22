/**
 * useSetUsingBigBlocks - Composable to toggle big/small blocks
 *
 * === DETAILED FLOW ===
 *
 * Step 1: Create temporary "Agent Wallet" (throw-away)
 *   - Create random private key using ethers Wallet.createRandom()
 *   - This agent wallet will represent the user to execute commands on L1
 *
 * Step 2: User signs to "Approve Agent" (🔔 MetaMask popup)
 *   - Use user's real wallet (MetaMask/WalletConnect)
 *   - Call Hyperliquid API "approveAgent" with agent wallet address
 *   - agentName = 'BlockToggle'
 *
 * Step 3: Agent executes "evmUserModify" (automatic, no popup)
 *   - Use agent wallet private key to sign
 *   - Call evmUserModify({ usingBigBlocks: true/false })
 *
 * === PROJECT PATTERNS ===
 * - getSigner() from useWeb3() to get ethers Signer
 * - Wallet.createRandom() from @ethersproject/wallet (already in project)
 */

import { ref } from 'vue';
import { Wallet } from '@ethersproject/wallet';
import useWeb3 from '@/services/web3/useWeb3';
import * as hl from '@nktkas/hyperliquid';

export function useSetUsingBigBlocks() {
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  const { getSigner, account } = useWeb3();

  /**
   * setUsingBigBlocks - Toggle block mode
   * @param usingBigBlocks - true = switch to big blocks, false = small blocks
   */
  async function setUsingBigBlocks(usingBigBlocks: boolean) {
    isPending.value = true;
    error.value = null;

    try {
      const signer = getSigner();
      
      // Patch getAddress to return account.value synchronously to avoid ethers RPC errors
      const originalGetAddress = signer.getAddress.bind(signer);
      signer.getAddress = async () => account.value || await originalGetAddress();

      // ====== STEP 1: Create temporary Agent Wallet ======
      // Agent wallet is used once and discarded
      const agentWallet = Wallet.createRandom();

      // ====== STEP 2: User approves Agent (MetaMask popup) ======
      const transport = new hl.HttpTransport();
      const userExchangeClient = new hl.ExchangeClient({
        wallet: signer, // Signer from MetaMask/WalletConnect
        transport,
      });

      // 🔔 USER WILL SEE SIGNING POPUP HERE
      await userExchangeClient.approveAgent({
        agentAddress: agentWallet.address,
        agentName: 'BlockToggle',
      });

      // ====== STEP 3: Agent toggles block mode (automatic) ======
      const agentExchangeClient = new hl.ExchangeClient({
        wallet: agentWallet,
        transport,
      });

      await agentExchangeClient.evmUserModify({
        usingBigBlocks,
      });
    } catch (err) {
      console.error('Failed to set block mode:', err);
      error.value = err as Error;
      throw err;
    } finally {
      isPending.value = false;
    }
  }

  return {
    setUsingBigBlocks, // (boolean) => Promise<void>
    isPending, // Ref<boolean>
    error, // Ref<Error | null>
  };
}
