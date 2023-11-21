<script setup lang="ts">
import { format, fromUnixTime } from 'date-fns';
import bridgeAPI from '@/composables/bridge/bridge.api.js';
import useWeb3 from '@/services/web3/useWeb3';
// PROPS
type Props = {
  route_line: Object<any>;
  tx: Object<any>;
};
const props = withDefaults(defineProps<Props>(), {
  route_line: () => {},
  tx: () => {},
});
/**
 * STATES
 */
const isLoading = ref(false);
// // COMPOSABLES

const {
  account,
  getSigner,
  chainId,
  isWalletReady,
  isMismatchedNetwork,
  startConnectWithInjectedProvider,
} = useWeb3();
/**
 * FUNCTIONS
 */

const handleRetryButton = async () => {
  console.log(props.tx, props?.value?.tx, 'tx');
  // CALL API BE HERE
  try {
    const params = {
      internal_tx_id: props?.tx?.id,
      public_address: account.value,
    };
    const rs = await bridgeAPI.postRetryRequest(params);
    console.log(rs, 'rs=>handleRetryButton');
    // add pagination total here
  } catch (error) {
    console.log(error, 'error=>handleRetryButton');
  }
};
</script>

<template>
  <div class="route-content">
    <div class="tooltip-container">
      <div v-if="route_line.txId" class="tooltip-content">
        <div class="tooltip-arrow down"></div>
        <div class="tooltip-content">
          <a :href="route_line.txId_url" target="_blank">View transaction </a>
        </div>
      </div>
      <div v-if="route_line.inboundTx" class="tooltip-content">
        <div class="tooltip-arrow down"></div>
        <div class="tooltip-content">
          <a :href="route_line.inboundTx_url" target="_blank">Inbound tx </a>
        </div>
      </div>
      <div v-if="route_line.outboundTx" class="tooltip-content">
        <div class="tooltip-arrow down"></div>
        <div class="tooltip-content">
          <a :href="route_line.outboundTx_url" target="_blank">Outbound tx </a>
        </div>
      </div>
    </div>
    <div class="contract-info">
      <img
        :src="`/images/bridge/${route_line.status || 'unknown'}.png`"
        :class="[
          { success: route_line.status === 'success' },
          { failed: route_line.status === 'failed' },
          { pending: route_line.status === 'pending' },
        ]"
      />
      {{ route_line.router_contract_name }}
    </div>
    <div class="line-content">
      <img :src="`/images/bridge/arrow-right.png`" />
    </div>
    <div v-if="route_line.isRetry" class="btn-retry">
      <BalBtn
        :label="$t('Retry')"
        :loading="isLoading"
        classCustom="pink-white-shadow"
        block
        @click.prevent="handleRetryButton"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.route-content {
  margin: 0px 32px;
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
  .contract-info {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
    font-size: 12px;
    line-height: 14px;
    color: #808080;
    margin-top: 8px;
    > img {
      margin-right: 4px;
      width: 14px;
      height: auto;
      &.pending {
        width: 10px;
      }
    }
  }
  .line-content {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 12px;
    > img {
      width: 60px;
      height: auto;
    }
  }
  .btn-retry {
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    :deep {
      .pink-white-shadow {
        padding: 4px 16px;
        height: auto;
        line-height: inherit;
        font-size: 10px;
        line-height: 12px;
        width: auto;
      }
    }
  }
}
</style>
