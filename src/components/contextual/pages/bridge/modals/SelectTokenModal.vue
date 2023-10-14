<script setup lang="ts">
import { orderBy } from 'lodash';
import { computed, reactive, toRef, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/services/web3/useWeb3';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { default as ERC20ABI } from '@/lib/abi/ERC20.json';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum, isSameAddress } from '@/lib/utils';
import { useBridge } from '@/composables/bridge/useBridge';
interface Props {
  open?: boolean;
  tokensList: Array<any>;
  ignoreBalances?: boolean;
  tokenChoose: object;
}
const { account, isWalletReady } = useWeb3();
console.log(account, 'accountAAA');
const props = withDefaults(defineProps<Props>(), {
  open: false,
  ignoreBalances: false,
  tokenChoose: () => {},
});

const emit = defineEmits(['close', 'select']);

/**
 * COMPOSABLES
 */

const { t } = useI18n();
const { fNum2 } = useNumbers();
const { getTokensBalance, getBalance } = useBridge();
/**
 * DATA
 */
const loading = ref(true);
const tokens = ref([]);
/**
 * COMPUTED
 */
// /**
//  * WATCHERS
//  */
// watch(account, async () => {
//   console.log(account, 'accountBBB');
//   if (account.value) {
//     tokens.value = await getTokensBalance(tokens.value, account.value);
//   }
// });
/**
 * LIFECYCLES
 */
onMounted(async () => {
  tokens.value = createTokens();
  if (account.value) {
    tokens.value = await getTokensBalance(tokens.value, account.value);
  }
});

/**
 * METHODS
 */
function createTokens() {
  console.log(props.tokensList, 'props.tokensList');
  let tokensWithValues = [];
  for (let i = 0; i < props.tokensList.length; i++) {
    let token = props.tokensList[i];
    const balance = 0;
    const price = 0;
    const value = 0;
    const itemPush = {
      ...token,
      price,
      balance,
      value,
    };
    tokensWithValues.push(itemPush);
  }

  if (props.ignoreBalances) return tokensWithValues;
  else return orderBy(tokensWithValues, ['value', 'balance'], ['desc', 'desc']);
}

async function onSelectToken(token: object): Promise<void> {
  emit('select', token);
  emit('close');
}
</script>

<template>
  <BalModal show noContentPad @close="$emit('close')">
    <div class="overflow-hidden">
      <div v-if="tokens.length > 0" class="token-list">
        <div class="title">{{ $t('selectCoin') }}</div>
        <div class="list-container">
          <div
            v-for="(item, index) in tokens"
            :key="index"
            class="item-info"
            :class="{
              active: item.address === tokenChoose?.address,
            }"
            @click="onSelectToken(item)"
          >
            <div class="item-img">
              <img width="48" height="48" :src="item.logoURI" />
            </div>
            <div class="item-label">{{ item.symbol }}</div>
            <div class="item-balance">
              {{ fNum2(item?.balance, FNumFormats.token) }}
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="flex justify-center items-center h-96">
        <BalLoadingIcon />
      </div>
      <div
        v-else
        class="p-12 h-96 text-center text-secondary"
        v-text="$t('errorNoTokens')"
      />
    </div>
  </BalModal>
</template>

<style scoped lang='scss'>
.token-list {
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 0px 7px 14px #0071a598;
  border-radius: 20px;
  padding: 24px 20px;
  .title {
    font-size: 18px;
    font-weight: bold;
    line-height: 22px;
    color: #243f41;
    margin-bottom: 24px;
  }
  .list-container {
    .item-info {
      background: #ffffff 0% 0% no-repeat padding-box;
      box-shadow: 0px 1px 3px #00000029;
      border-radius: 10px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      padding: 6px;
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
      &.active {
        box-shadow: inset 1px 1px 5px #00000072;
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
      .item-balance {
        margin-left: auto;
      }
    }
  }
}
</style>


