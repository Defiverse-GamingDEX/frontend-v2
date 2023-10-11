<script setup lang="ts">
import { orderBy } from 'lodash';
import { computed, reactive, toRef, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import TokenListItem from '@/components/lists/TokenListItem.vue';
import TokenListsListItem from '@/components/lists/TokenListsListItem.vue';
import { useTokens } from '@/providers/tokens.provider';
import useUrls from '@/composables/useUrls';

interface Props {
  open?: boolean;
  tokensList: Array<any>;
  ignoreBalances?: boolean;
}

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
const loading = ref(false);

/**
 * COMPUTED
 */

const tokens = computed(() => {
  console.log(props.tokensList, 'props.tokensList');
  let tokensWithValues = props.tokensList.map(token => {
    console.log(token, 'token');
    const balance = balanceFor(token.address);
    const price = priceFor(token.address);
    const value = Number(balance) * price;
    console.log(balance, 'balance');
    console.log(price, 'price');
    console.log(value, 'value');
    return {
      ...token,
      price,
      balance,
      value,
    };
  });
  if (props.ignoreBalances) return tokensWithValues;
  else return orderBy(tokensWithValues, ['value', 'balance'], ['desc', 'desc']);
});
console.log(tokens, 'tokens');
/**
 * METHODS
 */
async function onSelectToken(token: string): Promise<void> {
  if (!getToken(token)) {
    await injectTokens([token]);
  }

  emit('select', token);
  emit('close');
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


