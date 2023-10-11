<script setup lang="ts">
import { orderBy } from 'lodash';
import { computed, reactive, toRef, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/services/web3/useWeb3';
import { useTokens } from '@/providers/tokens.provider';
import { fromWei } from 'web3-utils';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { default as ERC20ABI } from '@/lib/abi/ERC20.json';

interface Props {
  open?: boolean;
  tokensList: Array<any>;
  ignoreBalances?: boolean;
}
const { account, isWalletReady } = useWeb3();
console.log(account, 'accountAAA');
const props = withDefaults(defineProps<Props>(), {
  open: false,
  ignoreBalances: false,
});

const emit = defineEmits(['close', 'select']);

/**
 * COMPOSABLES
 */

const {
  getToken,
  searchTokens,
  priceFor,
  balanceFor,
  dynamicDataLoading,
  nativeAsset,
  injectTokens,
} = useTokens();
const { t } = useI18n();

/**
 * DATA
 */
const loading = ref(true);
const tokens = ref([]);
/**
 * COMPUTED
 */
/**
 * WATCHERS
 */
watch(account, () => {
  console.log(account, 'accountBBB');
  if (account.value) {
    getTokensBalance();
  }
});
/**
 * LIFECYCLES
 */
onMounted(() => {
  tokens.value = createTokens();
  if (account.value) {
    getTokensBalance();
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
async function getTokensBalance() {
  console.log(tokens, account, 'getTokensBalance');
  if (tokens.value.length > 0) {
    for (let i = 0; i < tokens.value.length; i++) {
      let token = tokens.value[i];
      const balance = await getBalance(token, account.value);
      token.balance = balance;
      // const price = priceFor(token.address);
      // const value = Number(balance) * price;
    }
  }
}
async function onSelectToken(token: string): Promise<void> {
  if (!getToken(token)) {
    await injectTokens([token]);
  }

  emit('select', token);
  emit('close');
}
async function getBalance(token, walletAddress) {
  const { address, rpc } = token;
  const provider = new JsonRpcProvider(rpc);
  const tokenContract = new Contract(address, ERC20ABI, provider);
  const tokenBalance = await tokenContract.balanceOf(walletAddress);
  console.log(provider, address, tokenBalance, 'provider');
  //let balance = await provider.getBalance(address); //get native balance
  console.log(tokenBalance, 'balanceBBB');
  let rs = tokenBalance?.toString();

  console.log(rs, 'rsAAA');
  return rs;
}
</script>

<template>
  <BalModal show noContentPad @close="$emit('close')">
    <div class="overflow-hidden">
      <div v-if="tokens.length > 0" class="token-list">
        {{ tokens }}
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

<style scoped>
.list-height {
  height: 70vh;
}
</style>


