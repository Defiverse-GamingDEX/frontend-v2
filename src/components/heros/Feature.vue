<script lang="ts" setup>
// PROPS
type Props = {
  feature: object;
};
const props = withDefaults(defineProps<Props>(), {
  feature: () => {},
});
</script>
<template>
  <div class="feature-component">
    <div class="feature-card">
      <div class="feature-card-bg"></div>
      <div class="content-left">
        <div class="feature-icon">
          <img alt="" :src="feature.iconUrl" />
        </div>
      </div>
      <div class="content-right">
        <div class="feature-title">
          {{ feature.title }}
        </div>
        <div class="feature-description">
          {{ feature.description }}
        </div>
        <div class="feature-href">
          <a :href="feature.href" target="_blank"> Learn More ></a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.feature-component {
  .feature-card {
    padding: 36px 32px;
    position: relative;
    display: flex;
    max-width: 880px;
    .feature-card-bg {
      position: absolute;
      background: #ffffffd1 0% 0% no-repeat padding-box;
      width: 100%;
      height: 100%;
      top: 0px;
      left: 0px;
      border-radius: 20px;
    }
    .content-left {
      position: relative;
      .feature-icon {
        margin-right: 32px;
        width: 60px;
        > img {
          width: 60px;
          height: 60px;
        }
      }
    }
    .content-right {
      position: relative;
      .feature-title {
        font-size: 18px;
        line-height: 22px;
        font-weight: bold;
        color: #0a425c;
        margin-bottom: 14px;
      }
      .feature-description {
        font-size: 12px;
        line-height: 18px;
        color: #0a425c;
        margin-bottom: 20px;
      }
      .feature-href {
        font-size: 16px;
        line-height: 20px;
        font-weight: bold;
        text-align: right;
        color: #0087ea;
      }
    }
  }
}
</style>
