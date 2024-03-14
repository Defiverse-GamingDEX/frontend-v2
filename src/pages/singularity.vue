<script setup lang="ts">
import { onMounted } from 'vue';
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
      class="hover:text-blue-600 dark:hover:text-blue-400 primary"
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
