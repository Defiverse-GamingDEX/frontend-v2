
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
    <div class="p-4 mt-4 rounded-lg voting-warning">
      <div class="warning-item">
        <span class="warning-icon">⚠️</span>
        <span>Voting will be locked for 8 days.</span>
      </div>
      <div class="warning-item">
        <span class="warning-icon">⚠️</span>
        <span>
          If you acquire additional sZ after casting your vote, your voting
          power will not automatically update. To apply the new balance, you
          must submit a new voting transaction.
        </span>
      </div>
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
  .voting-warning {
    color: white;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(
      135deg,
      rgba(168, 162, 85, 0.9),
      rgba(148, 143, 70, 0.9)
    );

    .warning-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      .warning-icon {
        flex-shrink: 0;
        font-size: 18px;
      }
    }
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
