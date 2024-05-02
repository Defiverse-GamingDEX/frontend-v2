<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import { BRIDGE_NETWORKS } from '@/constants/bridge/networks';
import useWeb3 from '@/services/web3/useWeb3';
import { computed } from 'vue';
import InputRedeem from './unstake/InputRedeem.vue';

// COMPOSABLES
const { bp } = useBreakpoints();
const { account } = useWeb3();
// STATES

const inputToSelect = ref({
  chainId: '',
  txId: '',
});
// COMPUTED
const swapCardShadow = computed(() => {
  switch (bp.value) {
    case 'xs':
      return 'none';
    case 'sm':
      return 'lg';
    default:
      return 'xl';
  }
});
// FUNCTIONS

async function handleInputToChange(inputSelect) {
  inputToSelect.value = inputSelect;
  console.log(inputToSelect.value, 'inputToSelect.value');
}
async function handleRecoverButton() {
  console.log(inputToSelect.value, 'inputToSelect.value');
}
</script>

<template>
  <div class="redeem-component">
    <BalCard
      class="relative card-container bg-blue"
      :shadow="swapCardShadow"
      noBorder
    >
      <div class="redeem-description">
        If you have sent your tokens but have not redeemed them, you may paste
        in the Source Transaction hash to resume your transfer.
      </div>
      <div class="input-to">
        <div class="label">To</div>
        <InputRedeem
          :chainsList="BRIDGE_NETWORKS"
          :inputSelect="inputToSelect"
          @update:input-select="handleInputToChange"
        />
      </div>
      <div class="redeem-actions">
        <BalBtn
          :label="$t('Recover')"
          classCustom="pink-white-shadow"
          block
          @click.prevent="handleRecoverButton"
        />
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.redeem-component {
  > .bal-card {
    :deep() {
      > .card-container {
        > .content {
          padding: 24px 48px 24px 48px;
        }
      }
    }
  }
  .redeem-description {
    font-size: 14px;
    font-weight: medium;
    line-height: 17px;
    letter-spacing: 0px;
    color: #0a425c;
  }
  .input-to {
    margin-top: 24px;
    .label {
      color: #0a425c;
      font-size: 18px;
      font-weight: bold;
      line-height: 22px;
      margin-bottom: 10px;
    }
  }
  .redeem-actions {
    margin-top: 40px;
  }
}
</style>
