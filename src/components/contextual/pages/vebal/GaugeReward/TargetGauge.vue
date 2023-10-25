<script setup lang="ts">
import { PoolToken } from '@defiverse/balancer-sdk';
import { computed, ref } from 'vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';

import {
  isStableLike,
  isUnknownType,
  orderedPoolTokens,
  poolURLFor,
} from '@/composables/usePool';

// PROPS
type Props = {
  pool: object;
  filterText?: string;
};
const props = withDefaults(defineProps<Props>(), {
  pool: () => {},
  filterText: '',
});

//FUNCTIONS;
function getSelectedTokens(tokens: PoolToken[]) {
  return tokens
    .filter(
      token => token.symbol?.toLowerCase() === props.filterText?.toLowerCase()
    )
    .map(item => item.address);
}

function getPickedTokens(tokens: PoolToken[]) {
  return tokens
    .filter(
      token =>
        props.filterText &&
        token.symbol?.toLowerCase().includes(props.filterText?.toLowerCase())
    )
    .map(item => item.address);
}
</script>

<template>
  <div class="target-gauge-component">
    <p class="mb-2 font-semibold label">Target Gauge</p>
    <div class="main-content">
      <TokenPills
        :tokens="orderedPoolTokens(pool, pool.tokens)"
        :isStablePool="
          isStableLike(pool.poolType) || isUnknownType(pool.poolType)
        "
        :selectedTokens="getSelectedTokens(pool.tokens)"
        :pickedTokens="getPickedTokens(pool.tokens)"
        :isShowPopup="true"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.target-gauge-component {
}
</style>
