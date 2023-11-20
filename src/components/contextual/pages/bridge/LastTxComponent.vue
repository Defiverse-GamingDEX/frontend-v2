<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import usdcIcon from '@/assets/images/bridge/tokens/usdc.png';
// // COMPOSABLES
const { bp } = useBreakpoints();
// // COMPUTED
const swapCardShadow = computed(() => {
  switch (bp.value) {
    case 'xs':
      return 'none';
    case 'sm':
      return 'lg';
    default:
      return 'xl';
  }
});
</script>

<template>
  <div class="last-tx-component">
    <BalCard
      class="relative card-container bg-blue"
      :shadow="swapCardShadow"
      noBorder
    >
      <div class="title">State of Progress</div>
      <div class="status">
        Status:
        <span class="pending"> Pending </span>
      </div>
      <div class="date">Date: Oct28, 2023 11:11</div>
      <div class="tx-router-content">
        <div class="tx-content">
          <div class="token-img">
            <img width="48" height="48" :src="usdcIcon" />
          </div>
          <div class="token-value">1000 USDC</div>
          <div class="token-chain">From Ethereum</div>
        </div>
        <div class="line-content">
          <div class="left-line">
            <img :src="`/images/bridge/success.png`" /> Cbridge
          </div>
          <div class="center-line">
            <img :src="`/images/bridge/arrow-down.png`" />
          </div>
          <div class="right-line">
            <div class="tooltip-content">
              <div class="tooltip-arrow"></div>
              <div class="tooltip-content">View transaction</div>
            </div>
          </div>
        </div>
        <div class="tx-content">
          <div class="token-img">
            <img width="48" height="48" :src="usdcIcon" />
          </div>
          <div class="token-value">1000 USDC</div>
          <div class="token-chain">On Oasys Hub</div>
        </div>
        <div class="line-content">
          <div class="left-line">
            <img
              :src="`/images/bridge/pending.png`"
              class="pending"
            />oasysverse Bridge
          </div>
          <div class="center-line">
            <img :src="`/images/bridge/arrow-down.png`" />
          </div>
          <div class="right-line">
            <div class="tooltip-content">
              <div class="tooltip-arrow"></div>
              <div class="tooltip-content">In bound tx</div>
            </div>
            <div class="tooltip-content">
              <div class="tooltip-arrow"></div>
              <div class="tooltip-content">Out bound tx</div>
            </div>
          </div>
        </div>
        <div class="tx-content">
          <div class="token-img">
            <img width="48" height="48" :src="usdcIcon" />
          </div>
          <div class="token-value">1000 USDC</div>
          <div class="token-chain">On Defiverse</div>
        </div>
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.last-tx-component {
  .title {
    color: #0a425c;
    font-size: 20px;
    font-weight: bold;
    line-height: 24px;
    margin-bottom: 16px;
  }
  .status {
    font-size: 14px;
    line-height: 17px;
    margin-bottom: 8px;
    font-weight: 500;
    margin-bottom: 16px;
    .pending {
      color: rgb(255, 207, 119);
    }
  }
  .date {
    font-size: 14px;
    line-height: 17px;
    margin-bottom: 28px;
    font-weight: 500;
  }
  .tx-router-content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .tx-content {
      .token-img {
        display: flex;
        justify-content: center;
        margin-bottom: 8px;
        > img {
          width: 32px;
          height: 32px;
          object-fit: cover;
        }
      }

      .token-value {
        margin-bottom: 6px;
        font-size: 18px;
        line-height: 22px;
        color: #808080;
        font-weight: bold;
        margin-bottom: 6px;
        text-align: center;
      }
      .token-chain {
        font-size: 12px;
        line-height: 14px;
        color: #808080;
        text-align: center;
      }
    }
    .line-content {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 16px 8px 16px 8px;
      width: 100%;
      position: relative;
      .left-line {
        position: absolute;
        font-size: 12px;
        line-height: 14px;
        color: #808080;
        left: 24px;
        max-width: 60px;
        line-height: 14px;
        display: flex;
        align-items: center;
        > img {
          margin-right: 4px;
          width: 14px;
          height: auto;
          &.pending {
            width: 10px;
          }
        }
      }
      .center-line {
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          height: 60px;
          width: auto;
        }
      }
      .right-line {
        position: absolute;
        font-size: 8px;
        line-height: 12px;
        color: #1e293b;
        margin-left: 24px;
        right: 4px;
        padding: 2px;

        .tooltip-content {
          padding: 2px;
          background: #eaf0f6;
          position: relative;
          margin-bottom: 4px;
          font-size: 12px;
          line-height: 14px;
          min-width: 90px;
          text-align: center;
          &:last-child {
            margin-bottom: 0px;
          }
          .tooltip-arrow {
            position: absolute;
            width: 0px;
            height: 0px;
            border-style: solid;
            border-width: 6px 12px 6px 0;
            border-color: transparent #eaf0f6 transparent transparent;
            left: -7px;
            top: 50%;
            transform: rotate(0deg) translateY(-50%);
          }
        }
      }
    }
  }
}
</style>
