<script setup lang="ts">
import { useBridge } from '@/composables/bridge/useBridge';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';
import { orderBy } from 'lodash';
import { useI18n } from 'vue-i18n';
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
const search = ref('');
const tokensShow = ref([]);
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
  // update token show
  tokensShow.value = tokens.value;
  loading.value = false;

  if (account.value) {
    tokens.value = await getTokensBalance(tokens.value, account.value);
    tokensShow.value = tokens.value;
  }
});
/**
 * METHODS
 */
function createTokens() {
  console.log(props.tokensList, 'props.tokensList');
  let tokensWithValues = [];
  for (let i = 0; i < props.tokensList?.length; i++) {
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
function handleSearch(text) {
  console.log(text, 'text');
  search.value = text;
  const query = text.toLowerCase();
  console.log(query, 'query');

  const rs = tokens?.value?.filter(item => {
    // Check if the item's name, symbol, or address contains the search query
    return (
      item.name.toLowerCase().includes(query) ||
      item.symbol.toLowerCase().includes(query) ||
      item.address.toLowerCase().includes(query)
    );
  });
  console.log(rs, 'rs');
  tokensShow.value = rs;
}
const handleBuy = () => {
  console.log('handleBuy');
};
</script>

<template>
  <BalModal show noContentPad @close="$emit('close')">
    <div class="overflow-hidden">
      <div class="token-list">
        <div class="title">{{ $t('singularity.buyBtnLabel') }}</div>
        <div class="search-form-container">
          <BalTextInput
            :modelValue="search"
            name="search"
            :placeholder="$t('searchBy')"
            type="text"
            autoFocus
            size="sm"
            @update:model-value="handleSearch($event)"
          >
            <template #prepend>
              <div class="flex justify-center items-center w-8 h-full">
                <BalIcon name="search" size="sm" class="mr-2 text-gray-500" />
              </div>
            </template>
          </BalTextInput>
        </div>
        <div v-if="loading" class="flex justify-center items-center h-96">
          <BalLoadingIcon />
        </div>
        <div v-else>
          <div v-if="tokensShow?.length > 0" class="list-container">
            <div
              v-for="(item, index) in tokensShow"
              :key="index"
              class="item-info"
              :class="{
                active: item.address === tokenChoose?.address,
              }"
              @click="onSelectToken(item)"
            >
              <div class="content-left">
                <div class="token-info">
                  <div class="item-img">
                    <BalAsset
                      :address="item.address"
                      :iconURI="item.logoURI"
                      :size="32"
                      class=""
                    />
                    <!-- <img width="48" height="48" :src="item.logoURI" /> -->
                  </div>
                  <div class="item-content">
                    <div class="item-symbol">{{ item.symbol }}</div>
                    <!-- <div class="w-40 text-sm truncate item-name text-gray">
                      {{ item.name }}
                    </div> -->
                  </div>
                </div>
                <div :class="`network-info ${item?.chainInfo?.name}`">
                  <img class="h-4" :src="item?.chainInfo?.img_url" />
                  <span>{{ item?.chainInfo?.name }}</span>
                </div>
              </div>
              <div class="content-right">
                <div class="font-medium btn-buy-actions">
                  <BalBtn
                    :label="$t('singularity.buyTokenBtn')"
                    classCustom="pink-white-shadow"
                    block
                    @click.prevent="handleBuy"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="p-12 h-96 text-center text-secondary"
            v-text="$t('errorNoTokens')"
          />
        </div>
      </div>
    </div>
  </BalModal>
</template>

<style scoped lang='scss'>
.token-list {
  border-radius: 20px;
  padding: 24px 20px;
  .title {
    font-size: 18px;
    font-weight: bold;
    line-height: 22px;
    color: #243f41;
    margin-bottom: 8px;
  }
  .search-form-container {
    margin-bottom: 8px;
  }
  .list-container {
    .item-info {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      padding: 0.5rem 0rem;
      cursor: pointer;
      border-radius: 0.5rem;

      &:last-child {
        margin-bottom: 0px;
      }
      .content-left {
        .token-info {
          display: flex;
          align-items: center;
          .item-img {
            margin-right: 8px;
            display: flex;
            > img {
              width: 36px;
              height: 36px;
            }
          }
          .item-content {
            .item-symbol {
              font-weight: 700;
            }
          }
        }
        .network-info {
          display: inline-flex;
          align-items: center;
          padding: 1px 4px;
          border-radius: 18px;
          margin-top: 6px;
          > img {
            margin-right: 4px;
          }
          > span {
            font-size: 10px;
          }
          &.Defiverse {
            background-color: rgb(229 246 255);
            > span {
              color: rgb(2 132 199);
            }
          }
        }
      }
      .content-right {
        margin-left: auto;
        .btn-buy-actions {
          .pink-white-shadow {
            margin-left: auto;
            display: block;
            height: 32px;
            font-size: 14px;
            width: auto;
            padding: 8px 16px;
          }
        }
      }
    }
  }
}
</style>


