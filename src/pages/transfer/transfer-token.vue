<script setup lang="ts">
import TransferTokenCard from '@/components/cards/Transfer/TransferTokenCard.vue';
</script>

<template>
  <div class="px-4 xl:px-4 pt-12 mx-auto max-w-[1160px]">
    <h1
      class="pb-4 md:pb-6 text-4xl md:text-5xl font-bold text-center text-white"
    >
      {{ $t('transfer.transferToken') }}
    </h1>
    <TransferTokenCard />
  </div>
</template>

<style scoped>

</style>
