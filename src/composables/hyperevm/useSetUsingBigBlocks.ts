/**
 * useSetUsingBigBlocks - Composable để toggle big/small blocks
 *
 * === FLOW CHI TIẾT ===
 *
 * Bước 1: Tạo "Agent Wallet" tạm thời (throw-away)
 *   - Tạo private key random bằng ethers Wallet.createRandom()
 *   - Agent wallet này sẽ đại diện user thực hiện lệnh trên L1
 *
 * Bước 2: User ký để "Approve Agent"  (🔔 popup MetaMask)
 *   - Dùng ví thật của user (MetaMask/WalletConnect)
 *   - Gọi Hyperliquid API "approveAgent" với address của agent wallet
 *   - agentName = '' → no-name agent → tự prune
 *
 * Bước 3: Agent thực hiện "evmUserModify"  (tự động, không popup)
 *   - Dùng agent wallet private key để ký
 *   - Gọi evmUserModify({ usingBigBlocks: true/false })
 *
 * === PATTERN THEO PROJECT ===
 * - getSigner() từ useWeb3() để lấy ethers Signer
 * - Wallet.createRandom() từ @ethersproject/wallet (đã có trong project)
 */

import { ref } from 'vue';
import { Wallet } from '@ethersproject/wallet';
import useWeb3 from '@/services/web3/useWeb3';
import * as hl from '@nktkas/hyperliquid';

export function useSetUsingBigBlocks() {
  const isPending = ref(false);
  const error = ref<Error | null>(null);

  const { getSigner } = useWeb3();

  /**
   * setUsingBigBlocks - Toggle block mode
   * @param usingBigBlocks - true = chuyển sang big blocks, false = small blocks
   */
  async function setUsingBigBlocks(usingBigBlocks: boolean) {
    isPending.value = true;
    error.value = null;

    try {
      const signer = getSigner();

      // ====== BƯỚC 1: Tạo Agent Wallet tạm ======
      // Agent wallet chỉ dùng 1 lần rồi bỏ
      const agentWallet = Wallet.createRandom();

      // ====== BƯỚC 2: User approve Agent (popup MetaMask) ======
      const transport = new hl.HttpTransport();
      const userExchangeClient = new hl.ExchangeClient({
        wallet: signer, // Signer từ MetaMask/WalletConnect
        transport,
      });

      // 🔔 USER SẼ THẤY POPUP KÝ Ở ĐÂY
      await userExchangeClient.approveAgent({
        agentAddress: agentWallet.address,
        agentName: '', // No-name → auto prune
      });

      // ====== BƯỚC 3: Agent toggle block mode (tự động) ======
      const agentExchangeClient = new hl.ExchangeClient({
        wallet: agentWallet.privateKey,
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
