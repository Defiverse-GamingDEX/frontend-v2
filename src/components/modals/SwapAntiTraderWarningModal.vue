<script lang="ts" setup>
import { ref } from 'vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
const { fNum2 } = useNumbers();
/**
 * TYPES
 */
type Props = {
  tokenInTraderInfo: any;
  tokenOutTraderInfo: any;
  tokenInAmount: number;
  tokenOutAmount: number;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * STATE
 */
const redirectModal = ref<typeof BalModal>();

/**
 * METHODS
 */
function closeModal() {
  emit('close');
}
</script>

<template>
  <BalModal ref="redirecModal" :show="true" @close="closeModal()">
    <template #header>
      <h3 class="anti-modal-title">Attention</h3>
    </template>
    <div>
      <div class="anti-modal-description">
        You've hit the Anti Trader Field's limit. You are unable to make a token
        swap.
      </div>
      <!-- <div
        v-if="
          tokenInTraderInfo?.isProtectedToken &&
          tokenInAmount > tokenInTraderInfo?.sellableAmount
        "
        class="anti-modal-token-info"
      >
        <div class="mb-2 text-base font-medium">Token</div>
        <div class="rounded-lg border border-gray-100 shadow anti-modal-input">
          <div class="text-base font-medium anti-modal-token-symbol">
            {{ tokenInTraderInfo?.symbol }}
          </div>
          <div class="anti-modal-token-amount">
            {{ fNum2(tokenInAmount, FNumFormats.token) }}
          </div>
        </div>

        <div class="anti-modal-token-limit">
          Anti trader limit:
          {{ fNum2(tokenInTraderInfo?.sellableAmount, FNumFormats.token) }}
        </div>
      </div>
      <div
        v-if="
          tokenOutTraderInfo?.isProtectedToken &&
          tokenOutAmount > tokenOutTraderInfo?.sellableAmount
        "
        class="anti-modal-token-info"
      >
        <div class="mb-2 text-base font-medium">Token</div>
        <div class="rounded-lg border border-gray-100 shadow anti-modal-input">
          <div class="text-base font-medium anti-modal-token-symbol">
            {{ tokenOutTraderInfo?.symbol }}
          </div>
          <div class="anti-modal-token-amount">
            {{ fNum2(tokenOutAmount, FNumFormats.token) }}
          </div>
        </div>

        <div class="anti-modal-token-limit">
          Anti trader limit:
          {{ fNum2(tokenOutTraderInfo?.sellableAmount, FNumFormats.token) }}
        </div>
      </div> -->
      <div class="mt-4 anti-modal-btn-actions">
        <button
          :class="[
            `bal-btn px-4 h-12 text-base 
          bg-primary-600 hover:bg-primary-700
          dark:bg-primary-gray-400 dark:hover:bg-primary-gray-600
         text-white border-none block w-full rounded-lg shadow hover:shadow-none cursor-pointer pink-white-shadow`,
          ]"
          @click="closeModal()"
        >
          Close
        </button>
      </div>
    </div>
  </BalModal>
</template>
<style scoped>
.anti-modal-title {
  margin: 0 auto;
}
.anti-modal-description {
  margin-bottom: 24px;
  text-align: center;
}
.anti-modal-btn-actions button {
  color: #fff;
  background: #ff5a8c 0% 0% no-repeat padding-box;
  box-shadow: 0px 3px 0px #aa3156cc;
  border-radius: 10px;
}
.anti-modal-input {
  display: flex;
  align-items: center;
  padding: 0.5rem;
}
.anti-modal-token-symbol {
}
.anti-modal-token-amount {
  margin-left: auto;
}
.anti-modal-token-limit {
  text-align: right;
  color: rgb(239 68 68 / var(--tw-text-opacity));
  font-size: 12px;
}
</style>