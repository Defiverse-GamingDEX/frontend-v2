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
</script>

<template>
  <div class="gauge-form-component">
    <div class="font-semibold gauge-form-title">
      Would you set more than two tokens as rewards?
    </div>
    <div class="gauge-form-content">
      <div class="form-content">
        <div v-for="(item, index) in input_list" :key="index">
          <InputForm
            :inputSelect="item"
            :index="index"
            :input_list="input_list"
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
    padding: 16px 8px;
    min-height: 400px;
    .form-content {
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
