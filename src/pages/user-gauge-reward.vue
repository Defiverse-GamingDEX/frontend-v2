<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const UserGaugeRewardForm = defineAsyncComponent(
  () =>
    import(
      '@/components/contextual/pages/vebal/GaugeReward/UserGaugeRewardForm.vue'
    )
);
</script>

<template>
  <div class="user-gauge-reward">
    <UserGaugeRewardForm />
  </div>
</template>

<style scoped>
.user-gauge-reward {
  @apply h-full w-full;
}
</style> 