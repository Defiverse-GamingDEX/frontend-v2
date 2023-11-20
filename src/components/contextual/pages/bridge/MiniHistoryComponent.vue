<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
// // COMPOSABLES
const { bp } = useBreakpoints();
// // COMPUTED
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
  <div class="mini-history-component">
    <BalCard
      class="relative card-container bg-blue"
      :shadow="swapCardShadow"
      noBorder
    >
      <div class="title">
        History
        <span class="delete-icon"> delete icon here </span>
      </div>
      <div class="history-content"></div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.mini-history-component {
}
</style>
