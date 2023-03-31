<script lang="ts" setup>
import AppHero from '@/components/heros/AppHero.vue';
</script>

<template>
  <AppHero class="h-64">
    <h1 class="headline" v-text="$t('defiLiquidityHome')" />
    <p class="headline headline-next" v-text="$t('applications')" />
  </AppHero>
</template>

<style>
.headline {
  @apply text-white text-center text-4xl md:text-5xl pb-2 font-bold;
}

.headline-next {
  color: #ffc250;
}
</style>
