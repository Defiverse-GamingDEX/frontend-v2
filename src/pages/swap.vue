<script setup lang="ts">
import MyWallet from '@/components/cards/MyWallet/MyWallet.vue';
import PairPriceGraph from '@/components/cards/PairPriceGraph/PairPriceGraph.vue';
import SwapCard from '@/components/cards/SwapCard/SwapCard.vue';
import Col3Layout from '@/components/layouts/Col3Layout.vue';
import BridgeLink from '@/components/links/BridgeLink.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useBreakpoints from '@/composables/useBreakpoints';
import { isL2 } from '@/composables/useNetwork';
import { computed, onMounted } from 'vue';

/**
 * COMPOSABLES
 */
const { setSelectedTokens } = usePoolFilters();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const sections = computed(() => {
  const sections = [
    { title: 'My wallet', id: 'my-wallet' },
    { title: 'Price chart', id: 'price-chart' },
  ];
  if (isL2.value) sections.push({ title: 'Bridge assets', id: 'bridge' });
  return sections;
});

/**
 * CALLBACKS
 */
onMounted(() => {
  // selectedPoolTokens are only persisted between the Home/Pool pages
  setSelectedTokens([]);
});

/**
 * FUNCTIONS
 */
const openSingularity = () => {
  window.SingularityEvent.open();
};
</script>

<template>
  <div>
    <Col3Layout offsetGutters mobileHideGutters class="mt-8">
      <template #gutterLeft>
        <MyWallet />
      </template>

      <SwapCard />
      <div class="p-4 sm:p-0 lg:p-0 mt-8">
        <BalAccordion
          v-if="upToLargeBreakpoint"
          class="w-full"
          :sections="sections"
        >
          <template #my-wallet>
            <MyWallet />
          </template>
          <template #price-chart>
            <PairPriceGraph />
          </template>
          <template v-if="isL2" #bridge>
            <BridgeLink />
          </template>
        </BalAccordion>
        <button
          class="hover:text-blue-600 dark:hover:text-blue-400"
          @click="openSingularity"
        >
          Open Singularity
        </button>
      </div>

      <template #gutterRight>
        <PairPriceGraph />
        <BridgeLink v-if="isL2" class="mt-4" />
      </template>
    </Col3Layout>
  </div>
</template>

<style scoped>
.graph-modal {
  height: 450px;
}
</style>
