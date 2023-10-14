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
  <BalModal
    ref="redirecModal"
    className="anti-trader-modal"
    :show="true"
    @close="closeModal()"
  >
    <template #header>
      <div class="banner-img">
        <img
          class="tip-icon"
          src="@/assets/images/anti-trader-banner/warning.png"
        />
      </div>
      <div class="toturial-info">
        <span class="toturial-label"> Learn more </span>
        <BalTooltip
          iconSize="xs"
          textAlign="left"
          class="relative top-px"
          iconClass="text-white"
          width="60"
          iconName="help-circle"
        >
          {{ $t('claimPage.tips.BalIncentives') }}
        </BalTooltip>
      </div>
    </template>
    <div>
      <div class="anti-modal-description">
        <div class="text">AT-Field has been activated.</div>
        <div class="text">You are not allowed to make a token swap.</div>
      </div>

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
<style  lang="scss">
.anti-trader-modal {
  > .content {
    max-width: 100%;
    background: transparent
      linear-gradient(180deg, #8d00145c 0%, #43000aad 43%, #00000074 100%) 0% 0%
      no-repeat padding-box;
    .bal-card {
      background: transparent;
      margin-top: 8px;
      border-radius: 0px;
      border-top: 3px solid #da1231;
      border-bottom: 3px solid #da1231;
      &::before {
        content: '';
        background-image: url('@/assets/images/anti-trader-banner/pattern.png');
        background-repeat: no-repeat;
        background-size: 100% 100%;
        height: 18px;
        top: 16px;
        position: relative;
      }
      &::after {
        content: '';
        background-image: url('@/assets/images/anti-trader-banner/pattern.png');
        background-repeat: no-repeat;
        background-size: 100% 100%;
        height: 18px;
        bottom: 16px;
        position: relative;
      }
    }
    .header-content {
      flex-direction: column;
      margin-top: 82px;
      margin-bottom: 160px;
      .banner-img {
        max-width: 543px;
      }
      .toturial-info {
        display: flex;
        align-items: center;
        margin-top: 3px;
        .toturial-label {
          color: #ffa3a3;
          font-size: 25px;
          line-height: 30px;
          font-weight: bold;
          margin-right: 18px;
        }
        .bal-icon {
          > svg {
            width: 40px;
            height: 40px;
            color: #ffa3a3;
          }
        }
      }
    }
  }
  .anti-modal-description {
    margin-bottom: 24px;
    text-align: center;
    color: #ffffff;
    font-size: 25px;
    line-height: 30px;
    margin-bottom: 46px;
  }
  .anti-modal-btn-actions {
    margin: 0 auto;
    margin-bottom: 90px;
    max-width: 348px;
    display: flex;
    justify-content: center;
    button {
      color: #fff;
      background: #ff5a8c 0% 0% no-repeat padding-box;
      box-shadow: 0px 3px 0px #aa3156cc;
      border-radius: 10px;
      font-family: 'Adobe-AB-countryroad';
    }
  }
}
</style>