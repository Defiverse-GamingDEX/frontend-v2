<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import { useBridge } from '@/composables/bridge/useBridge';
import useWeb3 from '@/services/web3/useWeb3';
import HistoryCardListComponent from '@/components/contextual/pages/bridge/HistoryCardListComponent.vue';
import bridgeAPI from '@/composables/bridge/bridge.api.js';

/**
 * STATES
 */
const pagination = ref({
  sizePerPage: 5,
  currentPage: 1,
  total: 0,
});
const txList = ref([]);
// // COMPOSABLES
const { bp } = useBreakpoints();
const { getChainName, getChain, getToken } = useBridge();
const {
  account,
  getSigner,
  chainId,
  isWalletReady,
  isMismatchedNetwork,
  startConnectWithInjectedProvider,
} = useWeb3();
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
const initData = async () => {
  getTxList();
};
const getTxList = async () => {
  // CALL API BE HERE
  try {
    const params = {
      public_address: account.value,
      limit: pagination.value.sizePerPage,
      offset: (pagination.value.currentPage - 1) * pagination.value.sizePerPage,
    };
    const rs = await bridgeAPI.getSwapHistory(params);

    txList.value = mapResultData(rs);
    // add pagination total here
  } catch (error) {
    console.log(error, 'error=>getTxList');
  }
};
const mapResultData = list => {
  // TODO FOR TEST ONLY
  const rs = [];
  for (let i = 0; i < 10; i++) {
    let itemPush = {
      date: `1700465751`,
      status: i % 3 === 0 ? 'success' : i % 3 === 1 ? 'failed' : 'pending',
      tokenIn: {
        address: '0x2FFdE077455f81E28bAa675a46B9c085740216d4',
        symbol: 'TCGC',
        chainId: 1,
        amount: 1000,
      },
      router_1: {
        status: i % 3 === 0 ? 'success' : i % 3 === 1 ? 'failed' : 'pending',
        router_contract_name: 'cBridge',
        txId: '0x648d20c4fbdac3007abd76b30497b159951c235428d4627d21ca645250bf6b8b',
        inboundTx: null,
        outboundTx: null,
        isRetry: i % 2 ? true : false,
      },
      tokenReplay: {
        address: '0x2FFdE077455f81E28bAa675a46B9c085740216d4',
        symbol: 'TCGC',
        chainId: 1,
        amount: 1000,
      },
      router_2: {
        status: i % 3 === 0 ? 'success' : i % 3 === 1 ? 'failed' : 'pending',
        router_contract_name: 'Oasysverse Bridge',
        txId: null,
        inboundTx:
          '0x648d20c4fbdac3007abd76b30497b159951c235428d4627d21ca645250bf6b8b',
        outboundTx:
          '0x648d20c4fbdac3007abd76b30497b159951c235428d4627d21ca645250bf6b8b',
        isRetry: i % 2 ? true : false,
      },
      tokenOut: {
        address: '0x44ACD96620B708162af4A90524F29A6839675533',
        symbol: 'TCGC',
        chainId: 137,
        amount: 1000,
      },
    };
    // map data to show

    //tokenIn
    const tokenIn_chain = getChain(itemPush.tokenIn.chainId);
    console.log(tokenIn_chain, 'tokenIn_chain');
    itemPush.tokenIn.chainName = tokenIn_chain?.name;
    itemPush.tokenIn.chainUrl = tokenIn_chain?.img_url;
    const tokenIn = getToken(itemPush.tokenIn.address, tokenIn_chain?.tokens);
    itemPush.tokenIn.logoURI = tokenIn?.logoURI;

    //router_1
    itemPush.router_1.txId_url = getTxUrl(
      itemPush.router_1.txId,
      tokenIn_chain
    );
    itemPush.router_1.inboundTx_url = getTxUrl(
      itemPush.router_1.inboundTx,
      tokenIn_chain
    );
    itemPush.router_1.outboundTx_url = getTxUrl(
      itemPush.router_1.outboundTx,
      tokenIn_chain
    );

    //tokenReply
    const tokenReply_chain = getChain(itemPush.tokenReplay.chainId);
    console.log(tokenReply_chain, 'tokenReply_chain');
    itemPush.tokenReplay.chainName = tokenReply_chain?.name;
    itemPush.tokenReplay.chainUrl = tokenReply_chain?.img_url;
    const tokenReply = getToken(
      itemPush.tokenReplay.address,
      tokenReply_chain?.tokens
    );
    itemPush.tokenReplay.logoURI = tokenReply?.logoURI;

    //router_2
    itemPush.router_2.txId_url = getTxUrl(
      itemPush.router_2.txId,
      tokenReply_chain
    );
    itemPush.router_2.inboundTx_url = getTxUrl(
      itemPush.router_2.inboundTx,
      tokenReply_chain
    );
    itemPush.router_2.outboundTx_url = getTxUrl(
      itemPush.router_2.outboundTx,
      tokenReply_chain
    );

    //tokenOut
    const tokenOut_chain = getChain(itemPush.tokenOut.chainId);
    itemPush.tokenOut.chainName = tokenOut_chain?.name;
    itemPush.tokenOut.chainUrl = tokenOut_chain?.img_url;
    const tokenOut = getToken(
      itemPush.tokenOut.address,
      tokenOut_chain?.tokens
    );
    itemPush.tokenOut.logoURI = tokenOut?.logoURI;
    rs.push(itemPush);
  }
  return rs;
};
const getTxUrl = (txId, chainInfo) => {
  if (!txId) {
    return '';
  }
  if (chainInfo.chain_id_decimals === 1) {
    // ethereum
    return `${chainInfo.explorer}/tx/${txId}`;
  }
  if (chainInfo.chain_id_decimals === 137) {
    // polygon mainnet
    return `${chainInfo.explorer}/tx/${txId}`;
  }
};
/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  initData();
});
const onClickHandler = (page: number) => {
  console.log(page);
};
</script>

<template>
  <div class="history-component">
    <BalCard
      class="relative card-container bg-blue"
      :shadow="swapCardShadow"
      noBorder
    >
      <div class="tx-list-content">
        <HistoryCardListComponent :txList="txList"></HistoryCardListComponent>
      </div>
      <div class="paging-container">
        <VueAwesomePaginate
          v-model="pagination.currentPage"
          :totalItems="pagination.total"
          :itemsPerPage="pagination.sizePerPage"
          :maxPagesShown="pagination.sizePerPage"
          :onClick="onClickHandler"
        />
      </div>
    </BalCard>
  </div>
</template>

<style scoped lang="scss">
.history-component {
  :deep {
    .card-container {
      .content {
        padding: 0px;
      }
    }
    .paging-container {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      .pagination-container {
        display: flex;
        column-gap: 10px;
      }
      .paginate-buttons {
        height: 40px;
        width: 40px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        color: #475569;
      }
      .paginate-buttons:hover {
        color: #3498db;
        background: transparent;
      }
      .active-page {
        color: #3498db;
      }
      .active-page:hover {
        color: #2988c8;
      }
    }
  }
}
</style>
