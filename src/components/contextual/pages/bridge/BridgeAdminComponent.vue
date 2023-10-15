<script setup lang="ts">
import ClaimFees from './admin/ClaimFees.vue';
import ConfigGas from './admin/ConfigGas.vue';
import useBreakpoints from '@/composables/useBreakpoints';

// COMPOSABLES
const { bp } = useBreakpoints();
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
</script>

<template>
  <div class="bridge-admin-component">
    <BalCard
      class="relative card-container bg-blue"
      :shadow="swapCardShadow"
      noBorder
    >
      <div class="claim-fees-container">
        <ClaimFees />
      </div>
      <div class="config-gas-container">
        <ConfigGas />
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.bridge-admin-component {
  > .bal-card {
    :deep() {
      > .card-container {
        > .content {
          padding: 24px 48px 24px 48px;
        }
      }
    }
  }
  .claim-fees-container {
  }
  .config-gas-container {
    margin-top: 44px;
  }
}
</style>
