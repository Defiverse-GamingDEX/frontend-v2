<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import { useBridge } from '@/composables/bridge/useBridge';
import MiniHistoryCardComponent from '@/components/contextual/pages/bridge/MiniHistoryCardComponent.vue';
// STATES
const txList = ref([]);
// // COMPOSABLES
const { bp } = useBreakpoints();
const { getChainName, getChain, getToken } = useBridge();
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
 * LIFECYCLE
 */
onBeforeMount(async () => {
  getTxList();
});
/**
 * FUNCTIONS
 */
async function getTxList() {
  // TODO FOR TEST ONLY
  txList.value = [];
  for (let i = 0; i < 10; i++) {
    let itemPush = {
      date: `1700465751`,
      tokenIn: {
        address: '0x2FFdE077455f81E28bAa675a46B9c085740216d4',
        symbol: 'TCGC',
        chainId: 1,
        amount: 1000,
      },
      tokenOut: {
        address: '0x44ACD96620B708162af4A90524F29A6839675533',
        symbol: 'TCGC',
        chainId: 137,
        amount: 1000,
      },
    };
    // map data to show
    const tokenIn_chain = getChain(itemPush.tokenIn.chainId);
    console.log(tokenIn_chain, 'tokenIn_chain');
    itemPush.tokenIn.chainName = tokenIn_chain?.name;
    itemPush.tokenIn.chainUrl = tokenIn_chain?.img_url;
    const tokenIn = getToken(itemPush.tokenIn.address, tokenIn_chain?.tokens);
    itemPush.tokenIn.logoURI = tokenIn?.logoURI;

    const tokenOut_chain = getChain(itemPush.tokenOut.chainId);
    itemPush.tokenOut.chainName = tokenOut_chain?.name;
    itemPush.tokenOut.chainUrl = tokenOut_chain?.img_url;
    const tokenOut = getToken(
      itemPush.tokenOut.address,
      tokenOut_chain?.tokens
    );
    itemPush.tokenOut.logoURI = tokenOut?.logoURI;
    txList.value.push(itemPush);
  }
  console.log(txList.value, ' txList.value');
}
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
          Nso data
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
