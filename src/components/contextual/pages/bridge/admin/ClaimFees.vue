<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { BRIDGE_DEFI_TOKENS } from '@/constants/bridge/tokens/testnet/defi-tokens';
import CheckedIcon from './CheckedIcon.vue';

/**
 * STATES
 */
const tokensList = ref(BRIDGE_DEFI_TOKENS);
const isSelectAll = ref(false);

/**
 * COMPOSABLES
 */

const { fNum2 } = useNumbers();

/**
 * LIFESCYCLES
 */
onBeforeMount(async () => {
  await initTokensList();
});
// FUNCTIONS
function toggleSelectAll() {
  isSelectAll.value = !isSelectAll.value;
  checkSelectedOfTokenList();
}
function checkSelectedOfTokenList() {
  if (isSelectAll.value === true) {
    // set selected all
    for (let i = 0; i < tokensList.value?.length; i++) {
      tokensList.value[i].isChecked = true;
    }
  } else {
    // reset selected
    for (let i = 0; i < tokensList.value?.length; i++) {
      tokensList.value[i].isChecked = false;
    }
  }
}
function onSelectToken(index) {
  tokensList.value[index].isChecked = !tokensList.value[index].isChecked;
  checkIsSelectedAll();
}
function checkIsSelectedAll() {
  let isSelectedAll = true;
  for (let i = 0; i < tokensList.value?.length; i++) {
    if (tokensList.value[i].isChecked === false) {
      isSelectedAll = false;
    }
  }
  isSelectAll.value = isSelectedAll;
}
async function getClaimAmount(token) {
  // call contract to getClaimAmount here
  return new Promise((resolve, reject) => {
    resolve(2.5);
  });
}
async function initTokensList() {
  for (let i = 0; i < tokensList.value?.length; i++) {
    tokensList.value[i].isChecked = false;
    let claimAmount = await getClaimAmount(tokensList?.value[i]);
    tokensList.value[i].claimAmount = claimAmount;
  }
}
async function handleClaimButton() {
  console.log(tokensList.value, 'tokensList?.value');
}
</script>

<template>
  <div class="claim-fees-component">
    <div class="title">Claim Fees</div>
    <div class="tokens-list">
      <div class="row" @click="toggleSelectAll">
        <div class="select-all token-info">Select All</div>
        <div
          class="checkbox"
          :class="{
            active: isSelectAll === true,
          }"
        >
          <CheckedIcon v-if="isSelectAll" />
        </div>
      </div>
      <div
        v-for="(item, index) in tokensList"
        :key="index"
        class="row"
        @click="onSelectToken(index)"
      >
        <div class="token-info">
          <div class="item-img">
            <img width="48" height="48" :src="item.logoURI" />
          </div>
          <div class="item-label">{{ item.symbol }}</div>
          <div class="item-claim-amount">
            {{ fNum2(item?.claimAmount, FNumFormats.token) }}
            <span class="symbol"> {{ item.symbol }}</span>
          </div>
        </div>
        <div
          class="checkbox"
          :class="{
            active: item.isChecked === true,
          }"
        >
          <CheckedIcon v-if="item.isChecked" />
        </div>
      </div>
    </div>
    <div class="claim-actions">
      <BalBtn
        :label="$t('Claim')"
        classCustom="pink-white-shadow"
        block
        @click.prevent="handleClaimButton"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.claim-fees-component {
  .title {
    font-size: 18px;
    line-height: 22px;
    font-weight: bold;
    color: #0a425c;
    margin-bottom: 24px;
  }
  .tokens-list {
    background: #ffffff 0% 0% no-repeat padding-box;
    box-shadow: 0px 7px 14px #0071a598;
    border-radius: 20px;
    padding: 20px 16px;
    .row {
      display: flex;
      cursor: pointer;
      &:nth-child(2n) {
        .checkbox {
          color: #b2b2b2;
        }
      }
      &:nth-child(2n + 1) {
        .checkbox {
          color: #808080;
        }
      }
      &:hover {
        opacity: 0.8;
      }
      .checkbox {
        width: 36px;
        height: 36px;
        background: #ffffff 0% 0% no-repeat padding-box;
        box-shadow: 0px 1px 3px #00000029;
        border-radius: 10px;
        padding: 8px;
        margin-left: 20px;
        color: #b2b2b2;
        &.active {
          box-shadow: inset 1px 1px 5px #00000072;
        }
      }
      .token-info {
        background: #ffffff 0% 0% no-repeat padding-box;
        box-shadow: 0px 1px 3px #00000029;
        border-radius: 10px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        padding: 6px;
        flex-grow: 1;
        &.select-all {
          background: transparent;
          box-shadow: none;
          border-radius: 0px;
          justify-content: flex-end;
        }

        &:last-child {
          margin-bottom: 0px;
        }
        .item-img {
          margin-right: 12px;
          > img {
            width: 24px;
            height: 24px;
          }
        }
        .item-label {
          font-size: 18px;
          line-height: 22px;
          font-weight: bold;
          letter-spacing: 0px;
          color: #0a425c;
        }
        .item-claim-amount {
          margin-left: auto;
          font-size: 18px;
          font-weight: bold;
          line-height: 22px;
          color: #0a425c;
          .symbol {
            font-size: 12px;
            font-weight: normal;
            line-height: 14px;
          }
        }
      }
    }
  }
  .claim-actions {
    margin-top: 24px;
  }
}
</style>
