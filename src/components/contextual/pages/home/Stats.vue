<script lang="ts" setup>
const list = [
  { text: 'Trade vol (7d) *', value: '$963m' },
  { text: 'Total liquidity *', value: '$1.20b' },
  { text: 'Liquidity Providers *', value: '21.7k' },
  { text: 'Total pools *', value: '3,663' },
];
</script>

<template>
  <div class="stats-home">
    <div class="stats-home-content">
      <div class="text-2xl font-semibold text-center">
        Ethereum Mainnet stats
      </div>
      <div class="mt-3 text-sm text-center">* As at 11 November 2022</div>

      <div class="stats-home-content__list">
        <div v-for="(i, idx) in list" :key="idx" class="item">
          <div class="text-sm">{{ i.text }}</div>
          <div class="text-3xl font-semibold">{{ i.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.stats-home {
  background: #beebff;
}

.stats-home-content {
  @apply py-16 max-w-4xl mx-auto text-primary-100;
}

.stats-home-content__list {
  @apply flex flex-wrap mt-10;
}

.stats-home-content__list .item {
  @apply w-1/4 px-4 text-center;
}

@media screen and (max-width: 767px) {
  .stats-home-content__list {
    @apply mt-4;
  }

  .stats-home-content__list .item {
    @apply w-1/2 mt-3;
  }
}
</style>
