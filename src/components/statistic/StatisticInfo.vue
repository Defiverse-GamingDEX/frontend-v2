<script setup lang="ts">
import bridgeApi from '@/composables/bridge/bridge.price.api';
import NumberAnimation from 'vue-number-animation';
/**
 * STATE
 */
const tvl = ref(0);
const volume_24h = ref(0);
const volume_7d = ref(0);
/**
 * COMPOSABLES
 */

/**
 * COMPUTED
 */

/**
 * METHODS
 */
const getMarketInfo = async () => {
  try {
    let rs = await bridgeApi.getMarketInfo();
    console.log('rs', rs);
    tvl.value = rs?.total_value_locked;
    volume_24h.value = rs?.total_24h_volume;
    volume_7d.value = rs?.total_1week_volume;
  } catch (error) {
    console.log('🚀 ~ getMarketInfo ~ error:', error);
  }
};
const initData = () => {
  try {
    getMarketInfo();
  } catch (error) {
    console.log('🚀 ~ initData ~ error:', error);
  }
};
const theFormat = (value: number) => {
  // if (value >= 1_000_000_000) {
  //   return (value / 1_000_000_000).toFixed(1) + 'b';
  // } else if (value >= 1_000_000) {
  //   return (value / 1_000_000).toFixed(1) + 'm';
  // } else if (value >= 1_000) {
  //   return (value / 1_000).toFixed(1) + 'k';
  // } else {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  // }
};
/**
 * LIFECYCLE
 */

onBeforeMount(async () => {
  initData();
});
</script>

<template>
  <div class="statistic-info">
    <div class="statistic-info-item">
      <div class="statistic-info-item-label tvl">Total Value Locked</div>
      <div class="statistic-info-item-value tvl">
        <NumberAnimation
          ref="tvlRef"
          :from="0"
          :to="tvl"
          :format="theFormat"
          :duration="2"
          autoplay
          easing="linear"
        />
      </div>
    </div>
    <div class="statistic-info-item">
      <div class="statistic-info-item-label">24 Hours Volume</div>
      <div class="statistic-info-item-value">
        <NumberAnimation
          ref="volume24hRef"
          :from="0"
          :to="volume_24h"
          :format="theFormat"
          :duration="2"
          autoplay
          easing="linear"
        />
      </div>
    </div>
    <div class="statistic-info-item">
      <div class="statistic-info-item-label">1 Week Trading Volume</div>
      <div class="statistic-info-item-value">
        <NumberAnimation
          ref="volume7dRef"
          :from="0"
          :to="volume_7d"
          :format="theFormat"
          :duration="2"
          autoplay
          easing="linear"
        />
      </div>
    </div>
  </div>
</template>
<style  lang="scss" scoped>
.statistic-info {
  grid-template: auto / repeat(3, 1fr);
  display: grid;
  gap: 8px;
  @media screen and (max-width: 768px) {
    grid-template: auto / repeat(1, 1fr);
  }
  .statistic-info-item {
    background: #147dbf7e 0% 0% no-repeat padding-box;
    padding: 20px;
    min-width: 270px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    &:nth-child(1) {
      min-width: 480px;
      @media screen and (max-width: 768px) {
        min-width: 100%;
        padding: 8px;
      }
    }
    .statistic-info-item-label {
      color: #fff;
      margin-bottom: 16px;
      white-space: nowrap;
      font-family: Inter-Variable;
      font-size: 20px;
      line-height: 24px;
      text-align: left;
      &.tvl {
        font-weight: bold;
        font-size: 24px;
        line-height: 29px;
      }
    }
    .statistic-info-item-value {
      color: #fff;
      text-align: left;
      font-family: Inter-Variable;
      font-size: 38px;
      line-height: 46px;
      font-weight: bold;
      &.tvl {
        font-weight: bold;
        font-size: 55px;
        line-height: 66px;
        @media screen and (max-width: 768px) {
          font-size: 42px;
          line-height: 50px;
        }
      }
    }
  }
}
</style>