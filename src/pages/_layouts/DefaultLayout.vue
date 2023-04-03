<script setup lang="ts">
import { useRoute } from 'vue-router';

import Footer from '@/components/footer/Footer.vue';
import FooterHome from '@/components/footer/FooterHome.vue';
import AppNav from '@/components/navs/AppNav/AppNav.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();

/**
 * METHODS
 */
function classBody() {
  if (!route.name) return '';
  if (route.name === 'home') return 'bg-1';
  if (route.name === 'swap') return 'bg-2';
  if (route.name === 'list-pool') return 'bg-3';
  return 'bg-4';
}
</script>

<template>
  <div>
    <div :class="['app-body', classBody()]">
      <AppNav />
      <div>
        <router-view v-slot="{ Component }" :key="$route.path">
          <transition appear name="appear">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
    <FooterHome v-if="route.name === 'home'" />
    <Footer v-else />
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

.app-body {
  /* @apply mb-8; */

  min-height: calc(100vh - 2rem);
}

.app-body.bg-2 {
  background-image: url('/images/backgrounds/bg-min.png');
  background-repeat: no-repeat;
  background-position: bottom;
  background-size: 100% 100%;
  min-height: 100vh;
}

.app-body.bg-3 {
  background-image: url('/images/backgrounds/bg2-min.png');
  background-repeat: no-repeat;
  background-position: bottom;
  background-size: contain;
  padding-bottom: 16.67vw;
}

.app-body.bg-4 {
  background-image: url('/images/backgrounds/bg2-min.png');
  background-repeat: no-repeat;
  background-position: bottom;
  background-size: contain;
  padding-bottom: 33vw;
}
@media (max-width: 767px) {
  .app-body.bg-2 {
    background-size: contain;
  }

  .app-body.bg-3,
  .app-body.bg-4 {
    padding-bottom: 2rem;
  }
}
</style>
