<script setup lang="ts">
import HistoryCardListComponent from '@/components/contextual/pages/bridge/HistoryCardListComponent.vue';
import bridgeApi from '@/composables/bridge/bridge.price.api';
import { useBridge } from '@/composables/bridge/useBridge';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
/**
 * STATES
 */
const txList = ref([]);
const pagination = ref({
  sizePerPage: 4,
  currentPage: 1,
  total: 0,
});
// // COMPOSABLES
const { bp } = useBreakpoints();
const { mapTxHistory } = useBridge();
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
const mapTxList = data => {
  let rs = [];
  for (let i = 0; i < data?.length; i++) {
    const item = data[i];
    const itemMap = mapTxHistory(item);
    rs.push(itemMap);
  }
  txList.value = rs;
};
const getHistory = async () => {
  try {
    const params = {
      offset: pagination.value.currentPage - 1,
      limit: pagination.value.sizePerPage,
      sender_address: account.value,
    };
    const rs = await bridgeApi.getHistoryByAddress(params);
    mapTxList(rs?.items || []);
    pagination.value.total = rs?.total || 0;
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
});
const onClickHandler = (page: number) => {
  console.log('🚀 ~ onClickHandler ~ page:', page);
  pagination.value.currentPage = page;
  getHistory();
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
