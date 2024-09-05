<script setup lang="ts">
import { useBridge } from '@/composables/bridge/useBridge';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';
import Hex from 'crypto-js/enc-hex';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import { v4 as uuidv4 } from 'uuid';
import { useI18n } from 'vue-i18n';
interface Props {
  open?: boolean;
  tokensList: Array<any>;
  ignoreBalances?: boolean;
  tokenChoose: object;
}
const { account, isWalletReady } = useWeb3();

const props = withDefaults(defineProps<Props>(), {
  open: false,
  ignoreBalances: false,
  tokenChoose: () => {},
});

const emit = defineEmits(['close', 'select']);
const userAddress = ref('');
// const tokens = ref([
//   { value: 800011, label: 'USDC Mumbai', symbol: 'usdc' },
//   // { value: 800010, label: 'MATIC Mumbai',symbol:'matic' },
//   // { value: 970, label: 'BNB BSC Testnet',symbol: 'bnb' },
//   // { value: 973, label: 'BUSD BSC Testnet', symbol: 'busd' },
//   // { value: 87, label: 'BNB BSC Mainnet', symbol: 'bnb' },
//   // { value: 84, label: 'BUSD BSC Mainnet', symbol: 'busd' },
//   // { value: 86, label: 'RPG BSC Mainnet', symbol: 'rpg' },
//   // { value: 50, label: 'ETH on Goerli',symbol: 'eth'  },
//   // { value: 51, label: 'USDC on Goerli',symbol: 'usdc' },
//   // { value: 4200, label: 'ETH on Optimism Testnet',symbol: 'eth' },
//   // { value: 4201, label: 'USDC on Optimism Testnet',symbol: 'usdc' },
//   // { value: 99810, label: 'ETH on Caldera Goerli Appchain',symbol: 'eth' },
//   // { value: 99811, label: 'USDC on Caldera Goerli Appchain' ,symbol: 'usdc'},
//   // { value: 2220, label: 'ETH on Conduit Goerli Appchain',symbol: 'eth' },
//   // { value: 2221, label: 'USDC on Conduit Goerli Appchain',symbol: 'usdc' },
//   // { value: 93720, label: 'OAS on Oasys Testnet',symbol: 'oas' },
//   // { value: 93721, label: 'USDC on Oasys Testnet',symbol:'usdc' },
//   // { value: 201970, label: 'OAS on SAND Verse', symbol:'oas' },
//   // { value: 201971, label: 'USDC on SAND Verse', symbol:'usdc' },
//   // { value: 408750, label: 'OAS on Home Verse Testnet', symbol:'oas' },
//   // { value: 408751, label: 'USDC on Home Verse Testnet', symbol:'usdc' },
//   // { value: 431130, label: 'Avax on Avalanche Fuji testnet',symbol:'avax' },
//   // { value: 431131, label: 'USDC on Avalanche Fuji testnet', symbol:'usdc' },
//   // { value: 431140, label: 'Avax on Avalanche Mainnet', symbol:'avax' },
//   // { value: 431141, label: 'USDC on Avalanche Mainnet', symbol:'usdc' },
//   // { value: 431147, label: 'LODE on Avalanche Mainnet', symbol:'lode' },
//   // { value: 431148, label: 'AGX on Avalanche Mainnet', symbol:'agx'},
//   // { value: 431149, label: 'AUX on Avalanche Mainnet', symbol:'avax' },
//   // { value: 4311420, label: 'USDT on Avalanche Mainnet', symbol:'usdt' },
//   // { value: 1370, label: 'MATIC Polygon Mainnet', symbol:'matic' },
//   // { value: 1371, label: 'USDC Polygon Mainnet', symbol:'usdc' },
//   // { value: 13720, label: 'USDT on Polygon Mainnet', symbol:'usdt' },
//   // { value: 974, label: 'RPG BSC Testnet',  symbol:'rpg' },
//   // { value: 539350, label: 'JEWEL on DFK Mainnet', symbol:'jewel' },
//   // { value: 539351, label: 'USDC on DFK Mainnet', symbol:'usdc' },
//   // { value: 5393512, label: 'AVAX on DFK Mainnet', symbol:'avax' },
//   // { value: 5393513, label: 'CRYSTAL on DFK Mainnet', symbol:'crystal' },
//   // { value: 5393514, label: 'KLAY on DFK Mainnet', symbol:'klay' },
//   // { value: 5393520, label: 'USDT on DFK Mainnet', symbol:'usdt' },
//   // { value: 2480, label: 'OAS on Oasys Mainnet', symbol: 'oas' },
//   // { value: 2481, label: 'USDC on Oasys Mainnet',symbol:'usdc' },
//   // { value: 24821, label: 'MCHC on Oasys Mainnet', symbol:'mchc' },
//   // { value: 24820, label: 'USDT on Oasys Mainnet', symbol:'usdt' },
//   // { value: 190110, label: 'OAS on Homeverse Mainnet', symbol: 'oas' },
//   // { value: 190111, label: 'USDC on Homeverse Mainnet',symbol:'usdc' },
//   // { value: 13718, label: 'DOGA Mainnet', symbol:'doga' },
//   // { value: 1901119, label: 'MARD on Homeverse', symbol:'mard' },
//   // { value: 24819, label: 'MARD on Oasys', symbol:'mard' },
//   // { value: 4311412, label: 'SHRAP on Avalanche Mainnet', symbol:'shrap' },
//   // { value: 295480, label: 'OAS on MCH Verse', symbol:'oas' },
//   // { value: 295481, label: 'USDC on MCH Verse', symbol:'usdc' },
//   // { value: 2954821, label: 'MCHC on MCH Verse', symbol:'mchc' }
// ]);
// const token = ref(tokens.value[0]);
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
  let tokensWithValues = [];
  for (let i = 0; i < props.tokensList?.length; i++) {
    let token = props.tokensList[i];
    const balance = 0;
    const price = 0;
    const value = token.singularity_value;
    const itemPush = {
      ...token,
      price,
      balance,
      value,
    };
    tokensWithValues.push(itemPush);
  }

  if (props.ignoreBalances) return tokensWithValues;
  else return tokensWithValues;
  //else return orderBy(tokensWithValues, ['value', 'balance'], ['desc', 'desc']);
}

async function onSelectToken(token: object): Promise<void> {
  emit('select', token);
  emit('close');
}
function handleSearch(text) {
  search.value = text;
  const query = text.toLowerCase();

  const rs = tokens?.value?.filter(item => {
    // Check if the item's name, symbol, or address contains the search query
    return (
      item.name.toLowerCase().includes(query) ||
      item.symbol.toLowerCase().includes(query) ||
      item.address.toLowerCase().includes(query)
    );
  });

  tokensShow.value = rs;
}
const handleAddressField = async () => {
  const userInfo = await window.SingularityEvent.getConnectUserInfo();
  const userAvailabelAddresses =
    userInfo?.metaData?.wallet?.accounts?.evmPublicAddress || [];
  const userSelectedAddress = userAvailabelAddresses.length
    ? userAvailabelAddresses[0]?.publicAddress || ''
    : '';
  if (userSelectedAddress) {
    userAddress.value = userSelectedAddress;
  }
};
const initiateTransaction = async token => {
  try {
    await handleAddressField();
    const clientReferenceId = uuidv4();
    let body = {
      clientReferenceId,
      singularityTransactionType: 'RECEIVE',
      transactionLabel: `Payment token ${token.symbol}`,
      transactionDescription: `Buy ${token.symbol}`,
      transactionIconLink:
        'https://singularity-icon-assets.s3.ap-south-1.amazonaws.com/currency/ape.svg',
      clientReceiveObject: {
        clientRequestedAssetId: token.value,
        clientRequestedAssetQuantity: 30,
      },
      optionalAssets: tokens.value
        ?.filter(token => token.value)
        ?.map(token => token.value),
    };
    if (userAddress.value) {
      body = {
        ...body,
        clientReceiveObject: {
          ...body.clientReceiveObject,
          address: userAddress.value,
        },
      };
    }

    const secret =
      'cCTRcQsQYkHhO6yC1TPwqaj6VyYdlrRhpo70DTwrrwp5B7AKDpBTDCGO9tXJGz1sW0rbzjpBkrdbNPlM9ADge50f';
    // const secret =
    //   'aOMA87BhkaKXUXKy1XJE3WmLqU9Elgmd0875qQvTnxHebECDGqTgQrXZcWGAoURD7Cm36J8tbe7q5YuCgCTsVMPX';

    const requestString = JSON.stringify(body);
    const signature = Hex.stringify(hmacSHA512(requestString, secret));
    window.SingularityEvent.transactionFlow(requestString, signature);
    // if (userAddress && handleBuyAsset) {
    //   handleBuyAsset();
    // }
  } catch (err) {
    window.alert('Some error occured');
    console.error(err);
  }
};
const handleBuy = token => {
  initiateTransaction(token);
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
                    :disabled="item?.isComingSoon"
                    :label="
                      item?.isComingSoon
                        ? $t('singularity.comingSoon')
                        : $t('singularity.buyTokenBtn')
                    "
                    classCustom="pink-white-shadow"
                    block
                    @click.prevent="handleBuy(item)"
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


