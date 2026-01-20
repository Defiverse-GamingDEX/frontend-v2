<script lang="ts">
// Add a default export to make the component importable with default import
export default {
  name: 'SZManagementTable',
};
</script>
<script setup lang="ts">
import { ref, computed } from 'vue';
import BalTable from '@/components/_global/BalTable/BalTable.vue';
import { useI18n } from 'vue-i18n';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';
import useDarkMode from '@/composables/useDarkMode';
import TokensWhite from '@/assets/images/icons/tokens_white.svg';
import TokensBlack from '@/assets/images/icons/tokens_black.svg';
import RedeemModal from '@/components/modals/RedeemModal/RedeemModal.vue';
import RedeemAllModal from '@/components/modals/RedeemAllModal/RedeemAllModal.vue';
import useNetwork from '@/composables/useNetwork';
import { useStakeZ } from '@/composables/stakeZ/useStakeZ';
import useWeb3 from '@/services/web3/useWeb3';
import { STAKE_Z_NETWORKS } from '@/constants/stakeZ';
import BigNumber from 'bignumber.js';
import { format } from 'date-fns';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

const isLoading = ref(false);
const isLoadingRedeemAll = ref(false);
const showRedeemModal = ref(false);
const showRedeemAllModal = ref(false);
const selectedPool = ref();
const { t } = useI18n();
const isRedeemAll = ref(false);

// Pagination
const pagination = ref({
  currentPage: 1,
  sizePerPage: 5,
  total: 20,
});

// Store fetched data
const tableData = ref<any>([]);

// Define columns for the table
const columns = [
  {
    name: 'Icons',
    id: 'icons',
    accessor: 'uri',
    Header: 'iconColumnHeader',
    Cell: 'iconColumnCell',
    width: 100,
    noGrow: true,
    sticky: true,
    cellClassName: 'bg-white',
  },
  {
    name: 'Token name',
    id: 'name',
    accessor: 'name',
    width: 50,
    cellClassName: 'p-6',
  },
  {
    name: 'My balance',
    id: 'myBalance',
    Cell: 'myBalanceColumnCell',
    width: 120,
    align: 'right',
  },
  {
    name: 'Amount(sMZ)',
    id: 'amountSZ',
    Cell: 'amountSZColumnCell',
    width: 120,
    align: 'right',
  },
  {
    name: 'Amount(MZ)',
    id: 'amountZ',
    Cell: 'amountZColumnCell',
    width: 120,
    align: 'right',
  },
  {
    name: 'Redeemable amount(MZ)',
    id: 'redeemable',
    Cell: 'redeemableZColumnCell',
    width: 150,
    align: 'right',
  },
  {
    name: 'Locked date',
    id: 'lockedDate',
    accessor: 'lockedDate',
    width: 150,
    align: 'right',
  },
  {
    name: 'Maturity',
    id: 'maturity',
    accessor: 'maturity',
    width: 150,
    align: 'right',
  },
  {
    name: '',
    id: 'actions',
    Header: 'actionsColumnHeader',
    Cell: 'actionsColumnCell',
    width: 180,
    align: 'right',
  },
];

const { darkMode } = useDarkMode();
const {
  getStakedList,
  getAllRedeemableAmount_SZ,
  canRedeemAll,
  getRedeemableAmount_SZ,
  getRedeemableAmount_Z,
} = useStakeZ();
const { networkSlug } = useNetwork();
const { account, chainId, getProvider } = useWeb3();
console.log('🚀 ~ account:', account);
const { fNum2 } = useNumbers();
/**
 * COMPUTED
 */
const STAKE_Z_NETWORK = computed(() => {
  return (
    STAKE_Z_NETWORKS.find(network => network.chain_id === chainId.value) || null
  );
});
/**
 * FUNCTIONS
 */
const getRedeemableBalance = async stakeId => {
  try {
    const provider = getProvider();
    let balance = await getRedeemableAmount_Z({
      provider: provider,
      walletAddress: account.value,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      stakeId: stakeId,
    });
    balance = BigNumber(balance)
      .div(10 ** Number(STAKE_Z_NETWORK.value?.sz_token_decimals))
      .toFixed();
    return balance;
  } catch (error) {
    console.log(error, 'getRedeemableBalance=>error');
    return 0;
  }
};
const mapData = async stakedList => {
  // Create array of promises
  const promises = stakedList.map(async item => {
    console.log('🚀 ~ mapData ~ item:', item);
    // get date now like 1744675200
    const dateNow = Date.now();
    let isRedeem = false;
    const redeemableBalance = await getRedeemableBalance(item.id);
    if (
      dateNow >= item.redeemable_time * 1000 &&
      BigNumber(redeemableBalance).gt(0)
    ) {
      isRedeem = true;
    }
    return {
      id: item.id,
      name: 'sMZ',
      myBalance: BigNumber(item.value_usd || 0).toFixed(2),
      amountSZ: BigNumber(item.sz_amount || 0)
        .div(10 ** (STAKE_Z_NETWORK.value?.sz_token_decimals || 18))
        .toNumber(),
      amountZ: BigNumber(item.remaining_amount || 0)
        .div(10 ** (STAKE_Z_NETWORK.value?.z_token_decimals || 18))
        .toNumber(),
      lockedDate: format(new Date(item.stake_time * 1000), 'dd MMM yyyy'),
      maturity: format(new Date(item.maturity_time * 1000), 'dd MMM yyyy'),
      redeemableBalance: redeemableBalance,
      isRedeem: isRedeem,
    };
  });

  // Wait for all promises to resolve
  const mappedData = await Promise.all(promises);
  console.log('🚀 ~ mappedData:', mappedData);
  tableData.value = mappedData || [];
  console.log('🚀 ~ tableData.value:', tableData.value);
};
const checkIsRedeemAll = async () => {
  try {
    const provider = getProvider();
    const params = {
      provider: provider,
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      walletAddress: account.value,
    };
    // const rs: any = await getAllRedeemableAmount_SZ(params);
    const rs: any = await canRedeemAll(params);
    console.log('🚀 ~ canRedeemAll ~ rs:', rs);
    // if (BigNumber(rs).gt(0)) {
    //   isRedeemAll.value = rs;
    // } else {
    //   isRedeemAll.value = false;
    // }
    isRedeemAll.value = rs;
  } catch (error) {
    console.log('🚀 ~ checkIsRedeemAll ~ error:', error);
  }
};
const getData = async () => {
  // Call an API to get data
  // Update tableData with the fetched data
  console.log('getData', pagination.value);
  //TODO call API here
  try {
    isLoading.value = true;
    const params = {
      user_address: account.value,
      network: networkSlug.replace('-testnet', ''),
      offset: (pagination.value.currentPage - 1) * pagination.value.sizePerPage,
      limit: pagination.value.sizePerPage,
    };
    const res = await getStakedList(params);
    pagination.value.total = res?.total || 0;
    console.log('🚀 ~ getData ~ res:', res);
    if (res?.data?.length > 0) {
      await mapData(res?.data);
    }
    isLoading.value = false;
  } catch (error) {
    console.log('🚀 ~ getData ~ error:', error);
    isLoading.value = false;
  }
};
const onClickHandler = (page: number) => {
  pagination.value.currentPage = page;
  getData();
};
const handleRedeemAllClick = () => {
  showRedeemAllModal.value = true;
};
const handleRedeemAllSubmit = ({ receipt }) => {
  console.log('🚀 ~ handleRedeemAllSubmit ~ receipt:', receipt);
  showRedeemAllModal.value = false;
  fetchData();
};
const handleRedeem = pool => {
  selectedPool.value = pool;
  showRedeemModal.value = true;
};
const handleRedeemSubmit = ({ receipt }) => {
  console.log('🚀 ~ handleRedeemSubmit ~ receipt:', receipt);
  showRedeemModal.value = false;
  fetchData();
};
const fetchData = async () => {
  if (!account.value) return;
  await getData();
  await checkIsRedeemAll();
};
/**
 * WATCHERS
 */
watch(account, () => {
  if (account.value) {
    fetchData();
  }
});
/**
 * LIFE CYCLE
 */
onMounted(() => {
  console.log('🚀 ~ onMounted ~ account:', account);
  fetchData();
});
</script>

<template>
  <div class="sz-management">
    <div class="flex justify-between items-center mb-4">
      <h5 class="text-white">{{ $t('sZManagement') }}</h5>
    </div>

    <div class="bg-white rounded-lg">
      <div class="w-full">
        <BalTable
          :columns="columns"
          :data="tableData"
          :isLoading="isLoading"
          sticky="both"
          square
        >
          <template #iconColumnHeader>
            <div class="flex items-center">
              <img v-if="darkMode" :src="TokensWhite" />
              <img v-else :src="TokensBlack" />
            </div>
          </template>
          <template #iconColumnCell>
            <div class="flex items-center py-4 px-6">
              <img :src="ZIcon" alt="Z Token" class="w-6 h-6" />
            </div>
          </template>
          <template #actionsColumnHeader>
            <BalBtn
              label="Redeem all"
              :loading="isLoadingRedeemAll"
              :disabled="!isRedeemAll"
              classCustom="blue-white !rounded !h-8"
              block
              @click="handleRedeemAllClick"
            />
          </template>
          myBalance
          <template #myBalanceColumnCell="pool">
            <div class="mr-6 text-right">${{ pool.myBalance }}</div>
          </template>
          <template #amountSZColumnCell="pool">
            <div class="mr-6 text-right">
              {{ fNum2(pool.amountSZ?.toString() || '0', FNumFormats.token) }}
              sMZ
            </div>
          </template>
          <template #amountZColumnCell="pool">
            <div class="mr-6 text-right">
              {{ fNum2(pool.amountZ?.toString() || '0', FNumFormats.token) }} MZ
            </div>
          </template>
          <template #redeemableZColumnCell="pool">
            <div class="mr-6 text-right">
              {{
                fNum2(
                  pool.redeemableBalance?.toString() || '0',
                  FNumFormats.token
                )
              }}
              MZ
            </div>
          </template>

          <template #actionsColumnCell="pool">
            <div class="flex justify-end items-center py-4 px-6">
              <button
                :disabled="!pool.isRedeem || isLoadingRedeemAll"
                class="py-1 px-4 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 rounded disabled:cursor-not-allowed"
                @click="handleRedeem(pool)"
              >
                Redeem
              </button>
            </div>
          </template>
        </BalTable>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="tableData.length > 0" class="mt-4 paging-container">
      <VueAwesomePaginate
        v-model="pagination.currentPage"
        :totalItems="pagination.total"
        :itemsPerPage="pagination.sizePerPage"
        :maxPagesShown="pagination.sizePerPage"
        :onClick="onClickHandler"
        :backgroundColorClass="'bg-blue-500'"
        :activeColorClass="'bg-blue-600'"
        :textColorClass="'text-white'"
      />
    </div>

    <!-- Redeem Modal -->
    <teleport to="#modal">
      <RedeemModal
        v-if="showRedeemModal"
        :show="showRedeemModal"
        :pool="selectedPool"
        @close="showRedeemModal = false"
        @redeem="handleRedeemSubmit"
      />
    </teleport>

    <!-- Redeem All Modal -->
    <teleport to="#modal">
      <RedeemAllModal
        v-if="showRedeemAllModal"
        :show="showRedeemAllModal"
        @close="showRedeemAllModal = false"
        @redeem-all="handleRedeemAllSubmit"
      />
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.sz-management {
  :deep {
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
        border-radius: 8px;
        background-color: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #475569;
        transition: all 0.2s ease;

        &:hover {
          background-color: #e2e8f0;
          color: #3498db;
        }
      }

      .active-page {
        background-color: #3498db;
        color: white;

        &:hover {
          background-color: #2988c8;
          color: white;
        }
      }

      .disabled {
        opacity: 0.5;
        cursor: not-allowed;

        &:hover {
          background-color: #f1f5f9;
          color: #475569;
        }
      }
    }
  }
}
</style>
