<script setup lang="ts">
import HistoryRouteLineComponent from '@/components/contextual/pages/bridge/HistoryRouteLineComponent.vue';
import { format, fromUnixTime } from 'date-fns';
// PROPS
type Props = {
  txList: Array<any>;
};
const props = withDefaults(defineProps<Props>(), {
  txList: () => [],
});
</script>

<template>
  <div class="history-card-component">
    <div class="card-header">
      <div class="tx-info">
        <div class="tx-status">Transaction Status</div>
        <div class="source-chain">Source chain</div>
        <div class="router-1"></div>
        <div class="relay-chain">Relay chain</div>
        <div class="router-2"></div>
        <div class="des-chain">Destination chain</div>
      </div>
    </div>
    <div class="card-body">
      <div v-for="(tx, index) in txList" :key="index" class="tx-info">
        <div class="tx-status">
          <div class="status-content">
            Status:
            <span
              class="status"
              :class="[
                { new: tx?.status?.toUpperCase() === 'NEW' },
                { confirmed: tx?.status?.toUpperCase() === 'CONFIRMED' },
                {
                  relay_processing:
                    tx?.status?.toUpperCase() === 'RELAY_PROCESSING',
                },
                {
                  relay_error: tx?.status?.toUpperCase() === 'RELAY_ERROR',
                },
                {
                  relay_completed:
                    tx?.status?.toUpperCase() === 'RELAY_COMPLETED',
                },
                {
                  dst_error: tx?.status?.toUpperCase() === 'DST_ERROR',
                },
                {
                  completed: tx?.status?.toUpperCase() === 'COMPLETED',
                },
                {
                  error: tx?.status?.toUpperCase() === 'ERROR',
                },
              ]"
              >{{ tx.statusName }}
            </span>
          </div>
          <div class="time">
            {{ format(fromUnixTime(tx?.date), 'LLLdd, yyyy HH:mm') }}
          </div>
        </div>
        <div class="source-chain">
          <div class="tx-content">
            <div class="token-img">
              <img width="48" height="48" :src="tx?.tokenIn?.logoURI" />
            </div>
            <div class="token-value">
              {{ tx?.tokenIn?.amount }} {{ tx?.tokenIn?.symbol }}
            </div>
            <div class="token-chain">
              From <span class="bold">{{ tx?.tokenIn?.chainName }} </span>
            </div>
          </div>
        </div>
        <div class="router-1">
          <HistoryRouteLineComponent :tx="tx" :route_line="tx.router_1 || {}" />
        </div>
        <div class="relay-chain">
          <div class="tx-content">
            <div class="token-img">
              <img width="48" height="48" :src="tx?.tokenReplay?.logoURI" />
            </div>
            <div class="token-value">
              {{ tx?.tokenReplay?.amount }} {{ tx?.tokenReplay?.symbol }}
            </div>
            <div class="token-chain">
              From <span class="bold"> {{ tx?.tokenReplay?.chainName }} </span>
            </div>
          </div>
        </div>
        <div class="router-2">
          <HistoryRouteLineComponent :tx="tx" :route_line="tx.router_2 || {}" />
        </div>
        <div class="des-chain">
          <div class="tx-content">
            <div class="token-img">
              <img width="48" height="48" :src="tx?.tokenOut?.logoURI" />
            </div>
            <div class="token-value">
              {{ tx?.tokenOut?.amount }} {{ tx?.tokenOut?.symbol }}
            </div>
            <div class="token-chain">
              <span class="bold"> From {{ tx?.tokenOut?.chainName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.history-card-component {
  width: 100%;
  overflow-y: hidden;
  .bold {
    font-weight: bold;
  }
  .card-header {
    padding: 30px 24px;
    border-bottom: 2px solid #cecece;
    color: #0f172a;
    font-size: 16px;
    font-weight: bold;
    line-height: 24px;
    min-width: 1000px;
    .tx-info {
      padding: 0px;
      border-bottom: 0px;
    }
  }
  .card-body {
    border-bottom: 1px solid #cecece;
    min-width: 1000px;
  }
  .tx-info {
    display: flex;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #cecece;
  }
  .tx-status {
    width: 30%;
    .status-content {
      font-size: 16px;
      font-weight: bold;
      line-height: 19px;
      margin-bottom: 18px;
      color: #0a425c;
      .status {
        text-transform: capitalize;
        font-size: 14px;
        &.success {
          color: #16a34a;
        }
        &.failed {
          color: #dc2626;
        }
        &.pending {
          color: #ffc250;
        }
        &.success {
          color: #16a34a;
        }
        &.failed {
          color: #dc2626;
        }
        &.pending {
          color: #ffc250;
        }
        &.new {
          color: #3751ff;
        }
        &.confirmed {
          color: #6c757d;
        }
        &.relay_processing {
          color: #ffcc00;
        }
        &.relay_error {
          color: #dc3545;
        }
        &.relay_completed {
          color: #17a2b8;
        }
        &.dst_error {
          color: #fd7e14;
        }
        &.completed {
          color: #28a745;
        }
        &.error {
          color: #ff0000;
        }
      }
    }
    .time {
      font-size: 16px;
      font-weight: bold;
      line-height: 19px;
      color: #0a425c;
    }
  }
  .source-chain {
    min-width: 120px;
    text-align: center;
  }
  .router-1 {
    min-width: 200px;
    text-align: center;
  }
  .relay-chain {
    min-width: 120px;
    text-align: center;
  }
  .router-2 {
    min-width: 200px;
    text-align: center;
  }
  .des-chain {
    min-width: 120px;
    text-align: center;
  }
  .tx-content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .token-img {
      margin-bottom: 12px;
      > img {
        width: 26px;
        height: 26px;
      }
    }
    .token-value {
      font-size: 18px;
      font-weight: bold;
      line-height: 22px;
      color: #808080;
      margin-bottom: 2px;
    }
    .token-chain {
      font-size: 12px;
      font-weight: 500;
      line-height: 14px;
      color: #808080;
    }
  }
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
    > a {
      color: #1e293b;
      text-decoration: none;
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
      &.down {
        left: 50%;
        transform: translateX(-50%) rotate(270deg);
        top: inherit;
        bottom: -6px;
      }
    }
  }
}
</style>
