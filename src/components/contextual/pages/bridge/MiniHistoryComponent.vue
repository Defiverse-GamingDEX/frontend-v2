<script setup lang="ts">
import MiniHistoryCardComponent from '@/components/contextual/pages/bridge/MiniHistoryCardComponent.vue';
import bridgeApi from '@/composables/bridge/bridge.price.api';
import { useBridge } from '@/composables/bridge/useBridge';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
import BigNumber from 'bignumber.js';
// STATES
const txList = ref([]);
const pagination = ref({
  offset: 0,
  limit: 10,
});
const INTERVAL_TIME = 10000;
const intervalId = ref();
// // COMPOSABLES
const { bp } = useBreakpoints();
const { getChainName, getChain, getToken, getTokenURL } = useBridge();
const { account } = useWeb3();
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
/**
 * FUNCTIONS
 */
async function mapTxList(data) {
  txList.value = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    let itemPush = {
      date: item?.src_timestamp,
      tokenIn: {
        address: item?.src_token?.address,
        symbol: item?.src_token?.symbol,
        chainId: item?.src_token?.chain_id,
        amount: BigNumber(item?.amount_in)
          .div(10 ** item?.src_token?.decimals)
          .toFixed(),
      },
      tokenOut: {
        address: item?.dst_token?.address,
        symbol: item?.dst_token?.symbol,
        chainId: item?.dst_token?.chain_id,
        amount: BigNumber(item?.amount_out)
          .div(10 ** item?.dst_token?.decimals)
          .toFixed(),
      },
    };
    // map data to show
    const tokenIn_chain = getChain(itemPush.tokenIn.chainId);
    itemPush.tokenIn.chainName = tokenIn_chain?.name;
    itemPush.tokenIn.chainUrl = tokenIn_chain?.img_url;
    itemPush.tokenIn.logoURI = getTokenURL(itemPush.tokenIn.symbol);
    console.log('🚀 ~ mapTxList ~ itemPush.tokenOut:', itemPush.tokenOut);
    const tokenOut_chain = getChain(itemPush.tokenOut.chainId);

    console.log('🚀 ~ mapTxList ~ tokenOut_chain:', tokenOut_chain);
    itemPush.tokenOut.chainName = tokenOut_chain?.name;
    itemPush.tokenOut.chainUrl = tokenOut_chain?.img_url;
    itemPush.tokenOut.logoURI = getTokenURL(itemPush.tokenOut.symbol);
    console.log('🚀 ~ mapTxList ~ itemPush:', itemPush);

    txList.value.push(itemPush);
  }
  console.log(txList.value, ' txList.value');
}
const getHistory = async () => {
  try {
    const params = {
      offset: pagination.value.offset,
      limit: pagination.value.limit,
      sender_address: account.value,
    };
    const rs = await bridgeApi.getHistoryByAddress(params);
    mapTxList(rs?.items || []);
  } catch (error) {
    console.log(error, 'error');
  }
};
const initData = async () => {
  getHistory();
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
  <div class="mini-history-component">
    <BalCard
      class="relative card-container bg-blue"
      :shadow="swapCardShadow"
      noBorder
    >
      <div class="title">
        History
        <span class="delete-icon">
          <BalIcon
            name="trash-2"
            size="md"
            class="flex justify-center items-center mb-2 w-9 h-9 text-lg text-gray-800 hover:text-blue-600 dark:text-gray-100 bg-gray-50 hover:bg-white dark:bg-gray-800 rounded-full border-none shadow hover:shadow-none cursor-pointer bal-btn text-secondary icon-spin-anim"
          />
        </span>
      </div>
      <div class="history-content">
        <BalBlankSlate
          v-if="txList.length === 0"
          class="justify-center items-center mt-4 h-40 no-data"
        >
          <BalIcon name="bar-chart" />
          No data
        </BalBlankSlate>
        <div v-else class="tx-list">
          <div v-for="(item, index) in txList" :key="index" class="tx-info">
            <MiniHistoryCardComponent :tx="item" />
          </div>
        </div>
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.mini-history-component {
  .title {
    color: #0a425c;
    font-size: 20px;
    font-weight: bold;
    line-height: 24px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    .delete-icon {
      margin-left: auto;
      color: #048bc9;
      :deep {
        svg {
          // color: #048bc9;
        }
      }
    }
  }
  .history-content {
    margin-top: 16px;
    :deep {
      .no-data {
        color: #0a425c;
      }
      .tx-list {
        overflow-x: hidden;
        max-height: calc(100vh - 280px);
        .tx-info {
          margin-bottom: 32px;
          &:last-child {
            margin-bottom: 0px;
          }
        }
      }
    }
  }
}
</style>
