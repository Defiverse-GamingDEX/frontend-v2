<script setup lang="ts">
import { onMounted } from 'vue';
/**
 * STATES
 */

/**
 * COMPOSABLES
 */

/**
 * COMPUTED
 */

/**
 * CALLBACKS
 */
onMounted(() => {});

/**
 * FUNCTIONS
 */

const openSingularity = async () => {
  window.SingularityEvent.open();
};
</script>

<template>
  <div>
    <button
      :class="[
        'ml-2 ease-color mt-1 text-secondary hover:text-blue-800 dark:hover:text-blue-800 flex items-center shadow-sm border dark:border-0 bg-gray-50 dark:bg-gray-850 rounded-full p-1 justify-center',
      ]"
      @click="openSingularity"
    >
      Open Singularity
    </button>
  </div>
</template>

<style scoped>
.graph-modal {
  height: 450px;
}
</style>
