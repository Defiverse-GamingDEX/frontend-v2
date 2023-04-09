<script setup lang="ts">
/**
 * veBAL page
 */
import Hero from '@/components/contextual/pages/vebal/Hero.vue';
import LMVoting from '@/components/contextual/pages/vebal/LMVoting/LMVoting.vue';
import MyVeBAL from '@/components/contextual/pages/vebal/MyVeBAL/MyVeBAL.vue';
import { isVeBalSupported } from '@/composables/useVeBAL';
</script>

<template>
  <div>
    <Hero v-if="isVeBalSupported" v-once />

    <div class="py-10 dark:bg-gray-900">
      <div v-if="isVeBalSupported" class="lg:container lg:mx-auto">
        <div class="px-4">
          <MyVeBAL />
        </div>
      </div>
    </div>
    <div
      v-if="isVeBalSupported"
      class="xl:container xl:px-4 pt-10 xl:mx-auto"
    >
      <div class="xl:px-0 mb-16">
        <LMVoting />
      </div>
    </div>
    <div v-else class="text-center text-white">
      <div class="text-lg font-semibold">
        {{ $t('veBAL.notSupported.title') }}
      </div>
      <div>{{ $t('veBAL.notSupported.description') }}</div>
    </div>
  </div>
</template>
