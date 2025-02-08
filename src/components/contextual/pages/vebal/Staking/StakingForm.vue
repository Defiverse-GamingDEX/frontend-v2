<script setup lang="ts">
import { ref } from 'vue';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';
import useBreakpoints from '@/composables/useBreakpoints';
const amount = ref('');
const receiveAmount = ref('');
const { upToLargeBreakpoint } = useBreakpoints();
const handleAmountChange = async () => {
  if (!amount.value) {
    receiveAmount.value = '';
    return;
  }

  try {
    // TODO: Call API to calculate receive amount
    // For now, just multiply by 0.9523
    const calculatedAmount = Number(amount.value) * 0.9523;
    receiveAmount.value = calculatedAmount.toString();
  } catch (error) {
    console.error('Error calculating receive amount:', error);
    receiveAmount.value = '';
  }
};

const handleStake = () => {
  // TODO: Handle stake
  amount.value = '';
  receiveAmount.value = '';
};
</script>

<template>
  <div class="staking-form">
    <BalCard noBorder :square="upToLargeBreakpoint">
      <template #header>
        <h5 class="mb-6 text-3xl font-bold text-black">Z Staking</h5>
      </template>

      <div class="p-4 mb-2 rounded-xl border border-gray-800">
        <div class="flex justify-end items-center mb-1 balance-content">
          <span class="balance-label"
            >Balance:
            <span class="balance-value">0</span>
            Z
          </span>
        </div>
        <div class="relative input-control">
          <input
            v-model="amount"
            type="number"
            placeholder="0"
            class="pr-10 w-full text-xl font-bold bg-white focus:outline-none font-sm"
            @input="handleAmountChange"
          />
          <div
            class="flex absolute top-1/2 right-0 gap-2 items-center -translate-y-1/2"
          >
            <img :src="ZIcon" alt="Z Token" class="w-4 h-4" />
            <span class="text-xl font-bold text-gray-800">Z</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end items-center mb-4 ratio-content">
        <span>1 Z = 0.9523 sZ</span>
      </div>

      <div class="flex justify-between items-center mb-2 maturity-content">
        <div class="flex gap-1 items-center">
          <span class="label">Maturity</span>
          <span class="days-label">(365 days)</span>
        </div>
        <span class="value">4 Dec 2025</span>
      </div>

      <div class="flex flex-col mb-2">
        <div class="warning-text">
          <ul>
            <li>
              Redemption prior to maturity reduces the sZ that can be received.
            </li>
            <li>Cannot be redeemed early until 30 days after staking.</li>
          </ul>
        </div>
      </div>

      <div class="pt-4">
        <div class="receive-content">
          <div class="label">Receive</div>
          <div class="flex justify-end items-center">
            <span class="mr-1 text-xl font-bold text-black">{{
              receiveAmount || '-'
            }}</span>
            <div class="flex items-center">
              <img :src="ZIcon" alt="Z Token" class="w-4 h-4" />
              <span class="ml-1 text-xl font-bold text-black">sZ</span>
            </div>
          </div>
          <hr class="mt-4 border-gray-800" />
        </div>
      </div>

      <div class="mt-4 btn-actions">
        <button
          v-if="!amount"
          class="py-3 px-8 w-full text-lg font-medium text-white rounded-xl cursor-not-allowed btn-enter-amount"
          disabled
        >
          Enter Amount
        </button>
        <button
          v-else
          class="py-3 px-8 w-full text-lg font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl"
          :disabled="!receiveAmount"
          :class="{
            'opacity-50 cursor-not-allowed': !receiveAmount,
          }"
          @click="handleStake"
        >
          Stake
        </button>
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.staking-form {
  .balance-content {
    color: #000;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    .balance-value {
      color: #12a8ec;
    }
  }
  .input-control {
    input {
      color: #000;
      font-size: 24px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      padding-right: 48px;
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      -moz-appearance: textfield;
    }
  }
  .ratio-content {
    color: #000;
    font-size: 12px;
    font-weight: 600;
    padding-right: 12px;
  }
  .maturity-content {
    color: #000;
    font-size: 18px;
    font-weight: 600;
    .days-label {
      color: #000;
      font-weight: 400;
      font-size: 12px;
      margin-top: 6px;
    }
  }
  .penalty-content {
    color: #000;
    font-size: 18px;
    font-weight: 600;
    .value {
      color: #f00;
    }
  }
  .warning-text {
    ul {
      list-style-type: disc;
      padding-left: 24px;
      li {
        color: #f00;
        font-size: 11px;
        font-weight: 500;
      }
    }
  }
  .receive-content {
    .label {
      color: #000;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
  }
  .btn-enter-amount {
    background: #555;
  }
}
</style>
