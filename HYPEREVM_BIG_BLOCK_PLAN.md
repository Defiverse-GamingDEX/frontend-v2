# 1. Giải đáp thắc mắc (Q&A)

**Câu hỏi:** "Theo tao hiểu thì việc là small block hay big block thì có thể chỉ cần change rpc thôi đúng ko, còn vụ approve là cần user approve mới dc phép chuyển à?"

**Trả lời: KHÔNG PHẢI là đổi RPC URL.**

1. **Về việc change RPC:**
   - Việc dùng Small Block hay Big Block trên HyperEVM **KHÔNG làm thay đổi RPC URL** mà ví của bạn đang kết nối (bạn vẫn gọi chung vào 1 endpoint RPC của HyperEVM).
   - Sự khác biệt nằm ở **"Trạng thái (State) ở cấp độ mạng lưới (L1)"**. Nghĩa là bạn phải "báo" cho mạng lưới HyperEVM biết: *"Ví của tôi từ bây giờ muốn các giao dịch được đưa vào Big Block"*. 
   - Sau khi mạng lưới ghi nhận trạng thái này, bất kỳ giao dịch nào bạn gửi qua RPC (kể cả RPC cũ) đều sẽ được Sequencer tự động phân loại và cho vào Big Block.

2. **Về vụ Approve (Tại sao cần 2 bước ký?):**
   - Để "báo" cho mạng lưới biết bạn muốn đổi block mode, bạn không thể gửi một giao dịch EVM bình thường. Bạn phải gọi API L1 của Hyperliquid (cụ thể là lệnh `evmUserModify`).
   - Mạng Hyperliquid dùng mô hình **Agent Wallet** cho bảo mật:
     - **Bước 1 (User Approve):** Bạn cần ký 1 lần (hiện popup MetaMask) để cho phép (approve) một ví phụ (Agent) đại diện cho bạn.
     - **Bước 2 (Agent gửi lệnh):** Ví phụ (Agent) này sẽ tự động dùng private key của nó để ký và gửi lệnh `evmUserModify` lên mạng lưới đổi sang Big Block. Bạn không cần bấm ký thêm lần nữa.
     - Sau khi xong, Agent này là ví dùng 1 lần và sẽ tự động bị mạng lưới hủy bỏ (prune) vì mục đích bảo mật.

---

# 2. Plan: Tích hợp Bắt buộc Big Blocks (Dạng Modal)

**Bối cảnh:** Tính năng `Create Pool` yêu cầu phải deploy contract, do đó giao dịch **BẮT BUỘC phải thực hiện trên Big Block**. Nếu dùng Small Block sẽ bị lỗi (revert).
**Giải pháp:** Tạo một Modal chặn trước hành động "Preview / Create". Modal này **CHỈ hiển thị nút chuyển sang Big Block** (không cho phép chọn Small Block để tránh user bấm nhầm gây lỗi luồng tạo Pool).

## Tổng quan kiến trúc

- **Cài đặt SDK:** Cần package `@nktkas/hyperliquid` để gọi API L1 Exchange.
- **Composable 1 (`useIsUsingBigBlocks.ts`):** Dùng để query RPC `eth_usingBigBlocks` (poll mỗi 5 giây) để lấy trạng thái hiện tại.
- **Composable 2 (`useSetUsingBigBlocks.ts`):** Xử lý luồng ký 2 bước (Approve Agent -> evmUserModify) để đổi trạng thái.
- **Modal Component (`HyperEvmBigBlockModal.vue`):** Bọc bằng `BalModal`, chỉ cung cấp 1 hành động duy nhất là "Switch to Big Blocks".
- **Tích hợp (`CreatePool/InitialLiquidity.vue`):** Chặn hành động đi tiếp nếu đang là Small Blocks, và bật Modal lên ép đổi.

---

## Chi tiết các File dự kiến

### 1. `src/composables/hyperevm/useIsUsingBigBlocks.ts`
- Lấy `account`, `isWalletReady` từ `useWeb3()`.
- Dùng `rpcProviderService.jsonProvider.send('eth_usingBigBlocks', [account.value])` để kiểm tra.
- Có logic `setInterval` 5s để tự động cập nhật trạng thái block mode lên UI.

### 2. `src/composables/hyperevm/useSetUsingBigBlocks.ts`
- Dùng `Wallet.createRandom()` của ethers để tạo Agent Wallet.
- Dùng `@nktkas/hyperliquid` SDK.
- Gọi `userExchangeClient.approveAgent` (bước này user sẽ phải ký trên MetaMask).
- Gọi `agentExchangeClient.evmUserModify({ usingBigBlocks: true })` (bước này diễn ra ngầm).

### 3. `src/components/modals/HyperEvmBigBlockModal.vue`
Sẽ sử dụng các component có sẵn với giao diện rút gọn, **chỉ ép chuyển sang Big Block**:
```vue
<template>
  <BalModal :show="isOpen" @close="$emit('close')" title="Action Required: Big Blocks">
    <div class="flex flex-col items-center pb-4">
      <img src="@/assets/images/gamingdex_icon.png" class="w-16 h-16 mb-4" />
      <p class="text-center text-sm text-gray-400 mb-6">
        Creating a pool requires deploying a smart contract. You must switch your account to 
        <span class="font-bold text-white">BIG BLOCKS</span> to proceed.
      </p>
      
      <!-- Chỉ 1 nút duy nhất ép chuyển sang Big Blocks -->
      <BalBtn
        color="blue"
        :loading="isToggling"
        :disabled="isDisabled"
        loadingLabel="Switching..."
        block
        @click="handleSwitchToBigBlocks"
      >
        SWITCH TO BIG BLOCKS
      </BalBtn>

      <BalAlert v-if="toggleError" class="mt-4 w-full" type="error" :description="toggleError.message" block />
    </div>
  </BalModal>
</template>
```

### 4. Tích hợp vào `InitialLiquidity.vue`
- Bắt sự kiện khi click nút "Preview" (hàm `proceed`).
- Thay vì đi tiếp luôn, ta check:
  - Nếu `isUsingBigBlocks.value === true` -> Đi tiếp bình thường.
  - Nếu `isUsingBigBlocks.value === false` -> Bật `HyperEvmBigBlockModal` lên chặn lại.
  - Sau khi user bấm "Switch" trên Modal thành công, modal báo `success`, đóng modal và tự động gọi tiếp hàm `proceed` để qua bước Preview.
