<template>
  <BalModal id="redeem-modal" :show="show" @close="$emit('close')">
    <template #header>
      <div class="flex justify-between items-center px-4">
        <h5 class="text-3xl font-bold text-black">Redeem</h5>
      </div>
    </template>

    <div class="px-2 redeem-modal-container">
      <div class="p-4 mb-2 rounded-xl border border-gray-800">
        <div class="flex justify-end items-center mb-1 balance-content">
          <span class="balance-label"
            >Balance:
            <span class="balance-value">{{ pool?.amountSZ }}</span>
            sZ
          </span>
        </div>
        <div class="relative input-control">
          <input
            v-model="amount"
            type="number"
            placeholder="0"
            class="pr-10 w-full text-xl font-bold bg-whitefocus:outline-none font-sm"
            @input="handleAmountChange"
          />
          <div
            class="flex absolute top-1/2 right-0 gap-2 items-center -translate-y-1/2"
          >
            <img :src="ZIcon" alt="Z Token" class="w-4 h-4" />
            <span class="text-xl font-bold text-gray-800">sZ</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end items-center mb-4 ratio-content">
        <span>1 sZ = 1.05 Z</span>
      </div>

      <div class="flex justify-between items-center mb-8 maturity-content">
        <span class="label">Maturity</span>
        <span class="value">{{ pool?.maturity }}</span>
      </div>

      <div class="flex flex-col mb-2">
        <div class="flex justify-between items-center penalty-content">
          <div class="flex gap-2 items-center">
            <span class="label">Early redemption penalty</span>
            <BalTooltip
              text="Early redemption will incur a penalty that reduces the amount of Z tokens you receive."
              placement="top"
              iconSize="sm"
              width="64"
              iconClass="text-black"
            />
          </div>
          <span class="value">50.0%</span>
        </div>
        <p class="warning-text">
          Redemption prior to maturity reduces the sZ that can be received.
        </p>
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
              <span class="ml-1 text-xl font-bold text-black">Z</span>
            </div>
          </div>
          <hr class="mt-4 border-gray-800" />
        </div>
      </div>
    </div>

    <template #footer>
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
          @click="handleRedeem"
        >
          Redeem
        </button>
      </div>
    </template>
  </BalModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';

const props = defineProps<{
  show: boolean;
  pool?: any;
}>();

const emit = defineEmits(['close', 'redeem']);

const amount = ref('');
const receiveAmount = ref('');

const handleAmountChange = async () => {
  if (!amount.value) {
    receiveAmount.value = '';
    return;
  }

  try {
    // TODO: Call API to calculate receive amount
    // For now, just multiply by 1.05
    const calculatedAmount = Number(amount.value) * 1.05;
    receiveAmount.value = calculatedAmount.toString();
  } catch (error) {
    console.error('Error calculating receive amount:', error);
    receiveAmount.value = '';
  }
};

const handleRedeem = () => {
  emit('redeem', {
    amount: amount.value,
    receiveAmount: receiveAmount.value,
    pool: props.pool,
  });
  amount.value = '';
  receiveAmount.value = '';
  emit('close');
};
</script>

<style lang="scss" scoped>
#redeem-modal {
  :deep() {
    .redeem-modal-container {
      .balance-content {
        color: #000;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        .balance-label {
        }
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
      }
      .penalty-content {
        color: #000;
        font-size: 18px;
        font-weight: 600;
        .label {
        }
        .value {
          color: #f00;
        }
      }
      .warning-text {
        color: #f00;
        font-size: 11px;
        font-weight: 500;
      }
      .receive-content {
        .label {
          color: #000;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .value {
        }
      }
    }
    .footer {
      width: 100%;
      display: block;
      .btn-actions {
        .btn-enter-amount {
          background: #555;
        }
      }
    }
  }
}
</style>
