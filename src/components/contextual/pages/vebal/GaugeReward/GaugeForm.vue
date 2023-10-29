<script setup lang="ts">
import InputForm from './InputForm.vue';
// TYPES

type inputForm = {
  tokenSymbol: string;
  tokenAddress: string;
  balance: number;
  amount: number;
  decimals: number;
  periods: number; // weeks
};

// EMITS
const emit = defineEmits<{
  (e: 'update:input-list', input_list): void;
}>();
/**
 * STATES
 */
const input_list = ref<inputForm>([]);
const length_conts = ref(3);

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
  emit('update:input-list', input_list.value);
  console.log(input_list.value, 'input_list.value=>handleUpdateInput');
}
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
