<script lang="ts" setup>
import { useRoute } from 'vue-router';
import useWeb3 from '@/services/web3/useWeb3';
import DesktopLinkItem from './DesktopLinkItem.vue';
import useNetwork from '@/composables/useNetwork';
import { Goals, trackGoal } from '@/composables/useFathom';
import { NAV_LINKS } from '@/constants/navLinks';

const { isGoerli } = useWeb3();

/**
 * COMPOSABLES
 */
const route = useRoute();
const { networkSlug } = useNetwork();

const navLinks = NAV_LINKS.map(i => {
  return {
    ...i,
    goal: Goals[i.goal_key]
  }
})

/**
 * METHODS
 */
function isActive(page: string): boolean {
  if (route.name === page) return true;
  return false;
}
</script>

<template>
  <div class="desktop-links">
    <DesktopLinkItem
      v-for="i in navLinks"
      :key="i.text"
      :to="{ name: i.name_link, params: { networkSlug } }"
      :active="isActive(i.name_link)"
      @click="trackGoal(i.goal)"
    >
      {{ $t(i.text) }}
    </DesktopLinkItem>
  </div>
</template>

<style scoped>
.desktop-links {
  @apply grid gap-6 grid-flow-col grid-rows-1 h-full content-center;
}
</style>
