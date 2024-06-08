<script setup lang="ts">
import bridgeApi from '@/composables/bridge/bridge.price.api';
import { useBridge } from '@/composables/bridge/useBridge';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
import { format, fromUnixTime } from 'date-fns';
const { truncateDecimal } = useBridge();
/**
 * STATES
 */
const pagination = ref({
  offset: 0,
  limit: 1,
});

const lastTx = ref(null);
const INTERVAL_TIME = 10000;
const intervalId = ref();
// COMPOSABLES
const { bp } = useBreakpoints();
const { mapTxHistory } = useBridge();
const { account } = useWeb3();
// COMPUTED
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
/**
 * FUNCTIONS
 */

const getLastTx = async () => {
  try {
    const params = {
      offset: pagination.value.offset,
      limit: pagination.value.limit,
      sender_address: account.value,
    };
    const rs = await bridgeApi.getHistoryByAddress(params);
    lastTx.value = mapTxHistory(rs?.items[0] || null);
  } catch (err) {
    console.log('🚀 ~ getLastTx ~ err:', err);
  }
};
const initData = async () => {
  getLastTx();
};
/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  initData();
  intervalId.value = setInterval(initData, INTERVAL_TIME);
});
onUnmounted(() => {
  clearInterval(intervalId.value); // Clear the interval to stop further calls
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
      <div v-if="lastTx" class="tx-data">
        <div class="status-content">
          Status:
          <span
            class="status"
            :class="[
              { new: lastTx?.status?.toUpperCase() === 'NEW' },
              { confirmed: lastTx?.status?.toUpperCase() === 'CONFIRMED' },
              {
                relay_processing:
                  lastTx?.status?.toUpperCase() === 'RELAY_PROCESSING',
              },
              { relay_error: lastTx?.status?.toUpperCase() === 'RELAY_ERROR' },
              {
                relay_completed:
                  lastTx?.status?.toUpperCase() === 'RELAY_COMPLETED',
              },
              {
                dst_error: lastTx?.status?.toUpperCase() === 'DST_ERROR',
              },
              {
                completed: lastTx?.status?.toUpperCase() === 'COMPLETED',
              },
              {
                error: lastTx?.status?.toUpperCase() === 'ERROR',
              },
            ]"
            >{{ lastTx?.statusName }}
          </span>
        </div>
        <div class="date">
          {{ format(fromUnixTime(lastTx?.date), 'LLL dd, yyyy') }}
          <span class="time">
            {{ format(fromUnixTime(lastTx?.date), 'HH:mm') }}</span
          >
        </div>
        <div class="tx-router-content">
          <div class="tx-content">
            <div class="token-img">
              <img width="48" height="48" :src="lastTx?.tokenIn?.logoURI" />
            </div>
            <div class="token-value">
              {{ truncateDecimal(lastTx?.tokenIn?.amount?.toString(), 6) }}
              {{ lastTx?.tokenIn?.symbol }}
            </div>
            <div class="token-chain">
              From <span class="bold"> {{ lastTx?.tokenIn?.chainName }} </span>
            </div>
          </div>
          <div class="line-content">
            <div class="left-line">
              <img
                v-if="lastTx?.router_1?.status"
                :src="`/images/bridge/${
                  lastTx?.router_1?.status || 'unknown'
                }.png`"
                :class="[
                  { success: lastTx?.router_1?.status === 'success' },
                  { failed: lastTx?.router_1?.status === 'failed' },
                  { pending: lastTx?.router_1?.status === 'pending' },
                ]"
              />
              {{ lastTx?.router_1?.router_contract_name }}
            </div>
            <div class="center-line">
              <img :src="`/images/bridge/arrow-down.png`" />
            </div>
            <div class="right-line">
              <div v-if="lastTx?.router_1?.txId" class="tooltip-content">
                <div class="tooltip-arrow down"></div>
                <div class="tooltip-content">
                  <a :href="lastTx?.router_1?.txId_url" target="_blank"
                    >View transaction
                  </a>
                </div>
              </div>
              <div v-if="lastTx?.router_1?.inboundTx" class="tooltip-content">
                <div class="tooltip-arrow down"></div>
                <div class="tooltip-content">
                  <a :href="lastTx?.router_1?.inboundTx_url" target="_blank"
                    >Inbound tx
                  </a>
                </div>
              </div>
              <div v-if="lastTx?.router_1?.outboundTx" class="tooltip-content">
                <div class="tooltip-arrow down"></div>
                <div class="tooltip-content">
                  <a :href="lastTx?.router_1?.outboundTx_url" target="_blank"
                    >Outbound tx
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="tx-content">
            <div class="token-img">
              <img width="48" height="48" :src="lastTx?.tokenReplay?.logoURI" />
            </div>
            <div class="token-value">
              {{ truncateDecimal(lastTx?.tokenReplay?.amount.toString(), 6) }}
              {{ lastTx?.tokenReplay?.symbol }}
            </div>
            <div class="token-chain">
              On
              <span class="bold"> {{ lastTx?.tokenReplay?.chainName }} </span>
            </div>
          </div>
          <div class="line-content">
            <div class="left-line">
              <img
                v-if="lastTx?.router_2?.status"
                :src="`/images/bridge/${
                  lastTx?.router_2?.status || 'unknown'
                }.png`"
                :class="[
                  { success: lastTx?.router_2?.status === 'success' },
                  { failed: lastTx?.router_2?.status === 'failed' },
                  { pending: lastTx?.router_2?.status === 'pending' },
                ]"
              />
              {{ lastTx?.router_2?.router_contract_name }}
            </div>
            <div class="center-line">
              <img :src="`/images/bridge/arrow-down.png`" />
            </div>
            <div class="right-line">
              <div v-if="lastTx?.router_2?.txId" class="tooltip-content">
                <div class="tooltip-arrow down"></div>
                <div class="tooltip-content">
                  <a :href="lastTx?.router_2?.txId_url" target="_blank"
                    >View transaction
                  </a>
                </div>
              </div>
              <div v-if="lastTx?.router_2?.inboundTx" class="tooltip-content">
                <div class="tooltip-arrow down"></div>
                <div class="tooltip-content">
                  <a :href="lastTx?.router_2?.inboundTx_url" target="_blank"
                    >Inbound tx
                  </a>
                </div>
              </div>
              <div v-if="lastTx?.router_2?.outboundTx" class="tooltip-content">
                <div class="tooltip-arrow down"></div>
                <div class="tooltip-content">
                  <a :href="lastTx?.router_2?.outboundTx_url" target="_blank"
                    >Outbound tx
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="tx-content">
            <div class="token-img">
              <img width="48" height="48" :src="lastTx?.tokenOut?.logoURI" />
            </div>
            <div class="token-value">
              {{ truncateDecimal(lastTx?.tokenOut?.amount?.toString(), 6) }}
              {{ lastTx?.tokenOut?.symbol }}
            </div>
            <div class="token-chain">
              On <span class="bold"> {{ lastTx?.tokenOut?.chainName }} </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <BalBlankSlate class="justify-center items-center mt-4 h-40 no-data">
          <BalIcon name="bar-chart" />
          No data
        </BalBlankSlate>
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.last-tx-component {
  .bold {
    font-weight: bold;
  }
  .no-data {
    color: #0a425c !important;
  }
  .title {
    color: #0a425c;
    font-size: 20px;
    font-weight: bold;
    line-height: 24px;
    margin-bottom: 16px;
  }
  .status-content {
    font-size: 14px;
    line-height: 17px;
    margin-bottom: 8px;
    font-weight: 500;
    margin-bottom: 16px;
    color: #0a425c;
    .status {
      text-transform: capitalize;
      font-size: 14px;
      font-weight: bold;
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
          > a {
            color: #1e293b;
            text-decoration: none;
          }
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
