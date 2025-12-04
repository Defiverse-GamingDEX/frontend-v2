<template>
  <BalModal id="redeem-all-modal" :show="show" @close="$emit('close')">
    <template #header>
      <div class="flex justify-between items-center px-4">
        <h5 class="text-3xl font-bold text-black">Redeem All</h5>
      </div>
    </template>

    <div class="px-2 redeem-all-modal-container">
      <div class="p-4 mb-2 rounded-xl border border-gray-800">
        <div class="flex flex-col justify-end items-end mb-1 balance-content">
          <div class="text-xs text-right balance-label">
            Balance :
            <span class="text-xs balance-value">
              {{
                fNum2((totalBalance || 0).toString(), FNumFormats.token)
              }}</span
            >
            sZ
          </div>
        </div>
        <div class="relative input-control">
          <input
            :value="totalBalance"
            type="number"
            placeholder="0"
            disabled
            class="pr-10 w-full text-xl font-bold bg-white disabled:opacity-100 disabled:cursor-not-allowed focus:outline-none font-sm"
          />
          <div
            class="flex absolute top-1/2 right-0 gap-2 items-center -translate-y-1/2"
          >
            <img :src="ZIcon" alt="Z Token" class="w-4 h-4" />
            <span class="text-xl font-bold text-gray-800">sZ</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end items-center mb-4 ratio-content">
        <span>1 sZ = {{ estimateZRate }} Z</span>
      </div>

      <div class="flex flex-col mb-2">
        <div class="flex justify-between items-center mb-2 info-row">
          <span class="text-xs text-red-500">
            • All redeemable items are targeted.
          </span>
        </div>
        <div class="flex justify-between items-center mb-4 info-row">
          <span class="text-xs text-red-500">
            • This includes items that have not yet matured, and penalties will
            be incurred for such items.
          </span>
        </div>
      </div>

      <div class="flex flex-col mb-2">
        <div class="flex justify-between items-center penalty-content">
          <div class="flex gap-2 items-center">
            <span class="label">Average Early redemption penalty</span>
            <BalTooltip
              text="Redemption prior to maturity reduces the sZ that can be received."
              placement="top"
              iconSize="sm"
              width="64"
              iconClass="text-black"
            />
          </div>
          <span class="value">{{ penaltyRate }} %</span>
        </div>
        <p class="warning-text">
          Redemption prior to maturity reduces the sZ that can be received.
        </p>
      </div>

      <div class="pt-4">
        <div class="receive-content">
          <div class="label">Receive</div>
          <div class="flex justify-end items-center">
            <span class="mr-1 text-xl font-bold text-black">{{
              receiveAmount || '-'
            }}</span>
            <div class="flex items-center">
              <img :src="ZIcon" alt="Z Token" class="w-4 h-4" />
              <span class="ml-1 text-xl font-bold text-black">Z</span>
            </div>
          </div>
          <hr class="mt-4 border-gray-800" />
        </div>
      </div>
    </div>

    <template #footer>
      <div v-if="!account" class="mt-4 btn-actions">
        <BalBtn
          :label="$t('connectWallet')"
          :loading="isLoading"
          classCustom="pink-white-shadow"
          block
          @click="startConnectWithInjectedProvider"
        />
      </div>
      <div v-else class="mt-4 btn-actions">
        <BalBtn
          label="Redeem All"
          :loading="isLoading"
          classCustom="pink-white-shadow"
          block
          @click="handleRedeemAll"
        />
      </div>
    </template>
  </BalModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';
import { useStakeZ } from '@/composables/stakeZ/useStakeZ';
import useWeb3 from '@/services/web3/useWeb3';
import { STAKE_Z_NETWORKS } from '@/constants/stakeZ';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useNotifications from '@/composables/useNotifications';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits(['close', 'redeemAll']);

/**
 * STATES
 */
const totalBalance = ref(100); // TODO: Get from contract
const penaltyRate = ref<number | string>(50.0); // TODO: Get from contract
const estimateZRate = ref<number | string>(1.05); // TODO: Get from contract
const receiveAmount = ref<number | string>(52.5); // TODO: Calculate from contract
const isLoading = ref(false);

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { redeemAllSZ } = useStakeZ();
const {
  account,
  chainId,
  getSigner,
  getProvider,
  startConnectWithInjectedProvider,
} = useWeb3();
const { addNotification } = useNotifications();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();

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
const handleRedeemAll = async () => {
  console.log('Redeem All');
  try {
    isLoading.value = true;
    const provider = getProvider();
    const signer = getSigner();
    const params = {
      contractAddress: STAKE_Z_NETWORK.value?.sz_token_address,
      contractProvider: provider,
      account: account.value,
      signer: signer,
    };
    console.log('🚀 ~ handleRedeemAll ~ params:', params);
    const tx = await redeemAllSZ(params);
    console.log('🚀 ~ handleRedeemAll ~ rs:', tx);
    const summary = `Redeem all success!`;
    addTransaction({
      id: tx?.hash || tx,
      type: 'tx',
      action: 'redeemAllSZ',
      summary,
    });

    tx &&
      txListener(tx, {
        onTxConfirmed: async (receipt: any) => {
          console.log('🚀 ~ onTxConfirmed: ~ receipt:', receipt);
          emit('redeemAll', {
            receipt: receipt,
          });
          isLoading.value = false;
        },
        onTxFailed: () => {
          isLoading.value = false;
        },
      });
  } catch (error: any) {
    console.log('🚀 ~ handleRedeemAll ~ error:', error);
    addNotification({
      type: 'error',
      title: '',
      message: error?.message ? error.message : JSON.stringify(error),
    });
    isLoading.value = false;
  }
};

/**
 * LIFE CYCLES
 */
onMounted(() => {
  // TODO: Fetch data from contract when methods are available
  // - Get total redeemable balance
  // - Get average penalty rate
  // - Get estimate Z rate
  // - Calculate receive amount
});
</script>

<style lang="scss" scoped>
#redeem-all-modal {
  :deep() {
    .redeem-all-modal-container {
      .balance-content {
        color: #000;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        .balance-value {
          color: #12a8ec;
        }
      }
      .input-control {
        input {
          color: #000;
          font-size: 24px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          padding-right: 48px;
          &::-webkit-inner-spin-button,
          &::-webkit-outer-spin-button {
            -webkit-appearance: none;
            appearance: none;
            margin: 0;
          }
          -moz-appearance: textfield;
          appearance: textfield;
        }
      }
      .ratio-content {
        color: #000;
        font-size: 12px;
        font-weight: 600;
        padding-right: 12px;
      }
      .info-row {
        color: #f00;
        font-size: 11px;
        font-weight: 500;
      }
      .penalty-content {
        color: #000;
        font-size: 18px;
        font-weight: 600;
        .value {
          color: #f00;
        }
      }
      .warning-text {
        color: #f00;
        font-size: 11px;
        font-weight: 500;
      }
      .receive-content {
        .label {
          color: #000;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
      }
    }
    .footer {
      width: 100%;
      display: block;
    }
  }
}
</style>
