<script setup lang="ts">
import InputForm from './InputForm.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { useGaugeReward } from '@/composables/gaugeReward/useGaugeReward';
import { useBridge } from '@/composables/bridge/useBridge';
import { useTokenLists } from '@/providers/token-lists.provider';
import { GAUGE_REWARD_NUMBER_ADD } from '@/constants/gaugeReward/gauge-tokens-config';
// TYPES

type inputForm = {
  tokenSymbol: string;
  tokenAddress: string;
  balance: number;
  amount: number;
  decimals: number;
  periods: number; // weeks
  isAllowance: boolean;
  isError: boolean;
  isDeposited: boolean;
};
// PROPS
type Props = {
  gaugeAddress?: string;
};
const props = withDefaults(defineProps<Props>(), {});
// EMITS
const emit = defineEmits<{
  (e: 'update:input-list', input_list): void;
}>();

/**
 * COMPOSABLES
 */

const { isWalletReady, account, getSigner, getProvider, chainId } = useWeb3();
const { getRewardTokens } = useGaugeReward();
const { getTokensBalance, getBalance } = useBridge();
const { activeTokenLists, approvedTokenLists, toggleTokenList, isActiveList } =
  useTokenLists();
const tokenListArray = Object.entries(approvedTokenLists.value) || [];
/**
 * STATES
 */
const input_list = ref<inputForm>([]);
const length_conts = ref(GAUGE_REWARD_NUMBER_ADD);
const _token_list = ref(
  tokenListArray
    ? tokenListArray.length > 0
      ? tokenListArray[0]
        ? tokenListArray[0].length >= 2
          ? tokenListArray[0][1].tokens
          : []
        : []
      : []
    : []
);
/**
 * FUNCTIONS
 */
function addInput() {
  if (input_list.value) {
    const itemPush = {
      tokenSymbol: '',
      tokenAddress: '',
      balance: '',
      amount: 0,
      decimals: 18,
      periods: 0, // weeks
      isAllowance: false,
      isError: true,
      isDeposited: false,
    };
    input_list.value.push(itemPush);
  }
}
function handleDeleteInput(index) {
  input_list.value.splice(index, 1);
  emit('update:input-list', input_list.value);
}
function handleUpdateInput(payload) {
  const { inputSelect, index } = payload;
  input_list.value[index].tokenSymbol = inputSelect.tokenSymbol;
  input_list.value[index].tokenAddress = inputSelect.tokenAddress;
  input_list.value[index].decimals = inputSelect.decimals;
  input_list.value[index].balance = inputSelect.balance;
  input_list.value[index].amount = inputSelect.amount;
  input_list.value[index].periods = inputSelect.periods;
  input_list.value[index].isAllowance = inputSelect.isAllowance;
  input_list.value[index].isError = inputSelect.isError;
  emit('update:input-list', input_list.value);
  console.log(input_list.value, 'input_list.value=>handleUpdateInput');
}
async function getTokenList() {
  try {
    const provider = getProvider();
    let rs = await getRewardTokens(props.gaugeAddress, provider);
    if (rs) {
      initTokenList(rs);
    }
    console.log(rs, 'rs=>initTokenList');
  } catch (error) {
    console.log('error=>initTokenList');
  }
}
async function initTokenList(depositedList) {
  // reset list
  input_list.value = [];
  const provider = getProvider();
  for (let i = 0; i < depositedList.length; i++) {
    let depositedTokenAddress = depositedList[i];
    if (
      depositedTokenAddress !== '0x0000000000000000000000000000000000000000'
    ) {
      let balance = 0;

      const depositedToken = _token_list.value.find(
        item => item.address === depositedTokenAddress
      );
      if (account.value && depositedToken) {
        depositedToken.provider = provider;
        balance = await getBalance(depositedToken, account.value);
      }
      console.log(balance, 'balance');
      const itemPush = {
        tokenSymbol: '',
        tokenAddress: depositedTokenAddress,
        balance: balance,
        amount: 0,
        decimals: 18,
        periods: 0, // weeks
        isAllowance: true,
        isError: true,
        isDeposited: true,
      };
      input_list.value.push(itemPush);
    }
  }
  emit('update:input-list', input_list.value);
  console.log(input_list.value, 'input_list.value=>handleUpdateInput');
}
/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  getTokenList();
});
/**
 * EXPOSE
 */
defineExpose({ getTokenList });
</script>

<template>
  <div class="gauge-form-component">
    <div class="font-semibold gauge-form-title">
      Would you set more than two tokens as rewards?
    </div>
    <div class="gauge-form-content">
      <div class="form-content">
        <div
          v-for="(item, index) in input_list"
          :key="index"
          class="form-control"
        >
          <InputForm
            :inputSelect="item"
            :index="index"
            :input_list="input_list"
            @update:delete="handleDeleteInput"
            @update:input-select="handleUpdateInput"
          >
          </InputForm>
        </div>
      </div>
      <div class="form-btn-actions">
        <BalBtn
          v-if="input_list?.length < length_conts"
          size="sm"
          :label="$t('+')"
          classCustom="pink-white"
          block
          @click.stop.prevent="addInput()"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.gauge-form-component {
  margin-top: 24px;
  .gauge-form-title {
    font-size: 20px;
    line-height: 24px;
  }
  .gauge-form-content {
    margin-top: 4px;
    border: 1px solid rgb(10, 66, 92);
    border-radius: 20px;
    padding: 32px 16px;
    min-height: 400px;
    .form-content {
      .form-control {
        margin-bottom: 36px;
      }
    }
    .form-btn-actions {
      display: flex;
      justify-content: flex-end;
      .pink-white {
        width: 48px;
        height: 48px;
        font-size: 20px;
        font-weight: bold;
      }
    }
  }
}
</style>
