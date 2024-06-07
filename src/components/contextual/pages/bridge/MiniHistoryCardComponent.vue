<script setup lang="ts">
import { useBridge } from '@/composables/bridge/useBridge';
import { format, fromUnixTime } from 'date-fns';

// PROPS
type Props = {
  tx: Object<any>;
};
const props = withDefaults(defineProps<Props>(), {
  tx: () => {},
});
/**
 * COMPOSABLES
 */
const { truncateDecimal } = useBridge();
</script>

<template>
  <div class="mini-history-card-component">
    <div class="card-time">
      {{ format(fromUnixTime(tx?.date), 'LLLdd, yyyy') }}
      <span class="time"> {{ format(fromUnixTime(tx?.date), 'HH:mm') }}</span>
    </div>
    <div class="card-router">
      <div class="card-token in">
        <div class="token-img-content">
          <img :src="tx.tokenIn.logoURI" class="token-img" />
          <img :src="tx.tokenIn.chainUrl" class="chain-img" />
        </div>
        <div class="token-info">
          <div class="amount">
            {{ truncateDecimal(tx?.tokenIn?.amount?.toString(), 6) }}
          </div>
          <div class="chain">
            {{ tx?.tokenIn?.symbol }} on {{ tx?.tokenIn?.chainName }}
          </div>
        </div>
      </div>
      <div class="card-line">
        <img :src="`/images/bridge/line.png`" />
      </div>
      <div class="card-token out">
        <div class="token-img-content">
          <img :src="tx.tokenOut.logoURI" class="token-img" />
          <img :src="tx.tokenOut.chainUrl" class="chain-img" />
        </div>
        <div class="token-info">
          <div class="amount">
            {{ truncateDecimal(tx?.tokenOut?.amount?.toString(), 6) }}
          </div>
          <div class="chain">
            {{ tx?.tokenOut?.symbol }} on {{ tx?.tokenOut?.chainName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mini-history-card-component {
  border: 1px solid #eaf0f6;
  border-radius: 10px;
  padding: 18px 24px;
  .card-time {
    font-size: 14px;
    line-height: 17px;
    font-weight: 500;
    display: flex;
    margin-bottom: 24px;
    .time {
      margin-left: auto;
    }
  }
  .card-router {
    .card-token {
      display: flex;
      align-items: center;
      .token-img-content {
        position: relative;
        margin-right: 24px;
        .token-img {
          width: 26px;
          height: 26px;
        }
        .chain-img {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: -6px;
          right: -8px;
          // background: #fff;
          // border-radius: 50%;
          // box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
        }
      }
      .token-info {
        .amount {
          color: #808080;
          font-size: 18px;
          font-weight: bold;
          line-height: 22px;
          margin-bottom: 2px;
        }
        .chain {
          color: #808080;
          font-size: 12px;
          line-height: 14px;
        }
      }
    }
    .card-line {
      margin-left: 12px;
      > img {
        height: 20px;
        width: auto;
      }
    }
  }
}
</style>
