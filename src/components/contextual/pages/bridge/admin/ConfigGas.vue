<script setup lang="ts">
import { isLessThanOrEqualTo, isPositive } from '@/lib/utils/validations';
/**
 * STATES
 */
const gasBalance = ref(0);
const isShowGasBalance = ref(false);
const _amount = ref(null);
/**
 * COMPOSABLES
 */

/**
 * COMPUTED
 */
const inputRules = computed(() => {
  const rules = [isPositive()];
  // if (!props.ignoreWalletBalance) {
  //   rules.push(
  //     isLessThanOrEqualTo(props?.inputSelect?.balance, t('exceedsBalance'))
  //   );
  // }
  return rules;
});
/**
 * LIFESCYCLES
 */
onBeforeMount(async () => {
  gasBalance.value = await getGasBalance();
});

/**
 * FUNCTIONS
 */
async function getGasBalance() {
  // call contract to getGasBalance here
  return new Promise((resolve, reject) => {
    resolve(1000);
  });
}
function handleAmountChange(amount) {
  _amount.value = amount;
  console.log(_amount.value, ' _amount.value');
}
function handleDeposit() {
  console.log(_amount.value, ' _amount.value');
}
function handleWidthdraw() {
  console.log(_amount.value, ' _amount.value');
}
</script>

<template>
  <div class="config-gas-component">
    <div class="config-label">Get Gas Option</div>
    <div class="config-description">
      Please deposit more OAS here if you run out of it for distribution in the
      Get Gas Option.
    </div>
    <div class="config-form">
      <div class="form-label">Remaining balance</div>
      <div class="mb-6 row">
        <div class="input">
          <div class="gas-balance">
            <span v-if="isShowGasBalance"> {{ gasBalance }} OAS </span>
            <span v-else class="hide"> **** </span>
          </div>
        </div>
        <div class="action">
          <div
            class="checkbox"
            :class="{
              active: isShowGasBalance === true,
            }"
            @click="isShowGasBalance = !isShowGasBalance"
          >
            View balance
          </div>
        </div>
      </div>
      <div class="mb-6 row">
        <div class="input">
          <BalTextInput
            :modelValue="_amount"
            name="amount"
            :placeholder="'Enter OAS amount'"
            type="number-dot"
            :rules="inputRules"
            validateOn="input"
            autocomplete="off"
            autocorrect="off"
            step="any"
            spellcheck="false"
            v-bind="$attrs"
            inputAlignRight
            @update:model-value="handleAmountChange($event)"
            @update:is-valid="emit('update:isValid', $event)"
          >
          </BalTextInput>
        </div>
        <div class="action">
          <button class="button deposit" @click="handleDeposit">Deposit</button>
          <button class="button withdraw" @click="handleWidthdraw">
            Withdraw
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.config-gas-component {
  .config-label {
    font-size: 18px;
    line-height: 22px;
    font-weight: bold;
    color: #0a425c;
    margin-bottom: 10px;
  }
  .config-description {
    font-size: 14px;
    line-height: 17px;
    font-weight: normal;
    color: #0a425c;
  }
  .config-form {
    margin-top: 20px;
    .form-label {
      font-size: 14px;
      line-height: 17px;
      font-weight: normal;
      color: #0a425c;
      margin-bottom: 20px;
    }
    .row {
      display: flex;
      .input {
        flex-grow: 1;
        width: 100%;
        .gas-balance {
          background: #ffffff 0% 0% no-repeat padding-box;
          box-shadow: 0px 1px 3px #00000029;
          border-radius: 10px;
          padding: 12px 12px;
          display: flex;
          align-items: center;
          > span {
            font-size: 14px;
            line-height: 17px;
            font-weight: medium;
            color: #0a425c;
            &.hide {
              font-size: 20px;

              position: relative;
              top: 4px;
            }
          }
        }
        :deep() {
          .input-container {
            background: #f5f9fa 0% 0% no-repeat padding-box;
            box-shadow: inset 0px 1px 3px #0000004a;
          }
          .input-group {
            align-items: flex-end;
            > .h-10 {
              height: auto;
            }
            .input {
              font-size: 14px;
              line-height: 17px;
              text-align: left;
              font-weight: bold;
              color: #808080;
            }
          }
        }
      }
      .action {
        margin-left: 24px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        width: 210px;
        .checkbox {
          background: #ffffff 0% 0% no-repeat padding-box;
          box-shadow: 0px 1px 3px #00000029;
          border-radius: 10px;
          font-size: 14px;
          line-height: 17px;
          font-weight: medium;
          color: #0a425c;
          padding: 12px 16px;
          cursor: pointer;
          width: 100%;
          &:hover {
            opacity: 0.8;
          }
          &.active {
            box-shadow: inset 1px 1px 5px #00000072;
          }
        }
        .button {
          background: #ffffff 0% 0% no-repeat padding-box;
          box-shadow: 0px 1px 3px #00000029;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          line-height: 17px;
          font-weight: medium;
          color: #0a425c;
          cursor: pointer;
          width: 100%;
          &:hover {
            opacity: 0.8;
          }
          &.deposit {
            margin-bottom: 10px;
          }
        }
      }
    }
  }
}
</style>
