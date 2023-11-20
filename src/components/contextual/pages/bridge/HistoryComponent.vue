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
  <div class="history-component">
    <BalCard
      class="relative card-container bg-blue"
      :shadow="swapCardShadow"
      noBorder
    >
      history full here
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.history-component {
}
</style>
