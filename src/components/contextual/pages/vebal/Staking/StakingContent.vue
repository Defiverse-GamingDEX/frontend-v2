<script setup lang="ts">
import StakingForm from './StakingForm.vue';
import StakingInfo from './StakingInfo.vue';
</script>
<template>
  <div class="staking-content">
    <div class="staking-container">
      <StakingForm class="staking-form" />
      <StakingInfo class="staking-info" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.staking-content {
  padding: 2rem 8rem;
  width: 80%;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding: 1rem;
    width: 100%;
  }
  .staking-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .staking-form {
      width: 100%;
    }

    .staking-info {
      width: 100%;
    }
  }
}
</style>
