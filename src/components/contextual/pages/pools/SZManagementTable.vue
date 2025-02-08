<script setup lang="ts">
import { ref, computed } from 'vue';
import BalTable from '@/components/_global/BalTable/BalTable.vue';
import { useI18n } from 'vue-i18n';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';
import useDarkMode from '@/composables/useDarkMode';
import TokensWhite from '@/assets/images/icons/tokens_white.svg';
import TokensBlack from '@/assets/images/icons/tokens_black.svg';
import RedeemModal from '@/components/modals/RedeemModal/RedeemModal.vue';

const { t } = useI18n();

const isLoading = ref(false);
const showRedeemModal = ref(false);
const selectedPool = ref();

// Pagination
const pagination = ref({
  currentPage: 1,
  sizePerPage: 5,
  total: 20,
});

// Mock data array
const data = [
  {
    id: 'sz-token-1',
    name: 'sZ',
    myBalance: '$xxxx',
    amountSZ: '100',
    amountZ: '105',
    lockedDate: '5 Dec 2024',
    maturity: '4 Dec 2025',
    isVerified: true,
  },
  {
    id: 'sz-token-2',
    name: 'sZ',
    myBalance: '$500',
    amountSZ: '200',
    amountZ: '210',
    lockedDate: '6 Dec 2024',
    maturity: '5 Dec 2025',
    isVerified: true,
  },
  {
    id: 'sz-token-3',
    name: 'sZ',
    myBalance: '$750',
    amountSZ: '300',
    amountZ: '315',
    lockedDate: '7 Dec 2024',
    maturity: '6 Dec 2025',
    isVerified: true,
  },
  {
    id: 'sz-token-4',
    name: 'sZ',
    myBalance: '$1000',
    amountSZ: '400',
    amountZ: '420',
    lockedDate: '8 Dec 2024',
    maturity: '7 Dec 2025',
    isVerified: true,
  },
  {
    id: 'sz-token-5',
    name: 'sZ',
    myBalance: '$1250',
    amountSZ: '500',
    amountZ: '525',
    lockedDate: '9 Dec 2024',
    maturity: '8 Dec 2025',
    isVerified: true,
  },
];

// Store fetched data
const tableData = ref(data);

// Define columns for the table
const columns = [
  {
    name: 'Icons',
    id: 'icons',
    accessor: 'uri',
    Header: 'iconColumnHeader',
    Cell: 'iconColumnCell',
    width: 125,
    noGrow: true,
    sticky: true,
    cellClassName: 'bg-white',
  },
  {
    name: 'Token name',
    id: 'name',
    accessor: 'name',
    width: 150,
    cellClassName: 'p-6',
  },
  {
    name: 'My balance',
    id: 'myBalance',
    accessor: 'myBalance',
    width: 150,
    align: 'right',
  },
  {
    name: 'Amount(sZ)',
    id: 'amountSZ',
    accessor: 'amountSZ',
    width: 150,
    align: 'right',
  },
  {
    name: 'Amount(Z)',
    id: 'amountZ',
    accessor: 'amountZ',
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
    width: 160,
    align: 'right',
  },
];

const { darkMode } = useDarkMode();

/**
 * FUNCTIONS
 */
const getData = async () => {
  // Call an API to get data
  // Update tableData with the fetched data
  console.log('getData', pagination.value);
  //TODO call API here
  try {
    isLoading.value = true;
    // delay 1s here
    await new Promise(resolve => setTimeout(resolve, 1000));
    tableData.value = data;
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
const handleRedeemAll = () => {
  console.log('Redeem All');
};
const handleRedeem = pool => {
  selectedPool.value = pool;
  showRedeemModal.value = true;
};
const handleRedeemSubmit = ({ amount, pool }) => {
  console.log('Redeem', { amount, pool });
};
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
          :data="data"
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
            <button
              class="py-1 px-4 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded"
              @click="handleRedeemAll"
            >
              Redeem All
            </button>
          </template>

          <template #actionsColumnCell="pool">
            <div class="flex justify-end items-center py-4 px-6">
              <button
                class="py-1 px-4 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded"
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
    <div class="mt-4 paging-container">
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
        :show="showRedeemModal"
        :pool="selectedPool"
        @close="showRedeemModal = false"
        @redeem="handleRedeemSubmit"
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
