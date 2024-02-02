<script lang="ts" setup>
import { Goals, trackGoal } from '@/composables/useFathom';
import useNetwork from '@/composables/useNetwork';
import { NAV_LINKS } from '@/constants/navLinks';
import useWeb3 from '@/services/web3/useWeb3';
import { useRoute } from 'vue-router';
import DesktopLinkItem from './DesktopLinkItem.vue';

const { isGoerli } = useWeb3();

/**
 * COMPOSABLES
 */
const route = useRoute();
const { networkSlug } = useNetwork();

const navLinks = NAV_LINKS.map(i => {
  return {
    ...i,
    goal: Goals[i.goal_key],
  };
});

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
    <a
      href="https://app.tealswap.com/bridge/oasys-verse"
      class="border-white dark:border-gray-900 desktop-link-item-custom"
      target="_blank"
      >Bridge</a
    >
  </div>
</template>

<style scoped lang="scss">
.desktop-links {
  @apply grid gap-6 grid-flow-col grid-rows-1 h-full content-center;
  .desktop-link-item-custom {
    position: relative;
    display: flex;
    height: 100%;
    cursor: pointer;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    padding: 0px;
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity));
    transition-property: all;
    transition-duration: 500ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    &:hover {
      --tw-text-opacity: 1;
      color: rgb(71 85 105 / var(--tw-text-opacity));
    }
  }
}
</style>
