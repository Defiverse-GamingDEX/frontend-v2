<template>
  <div>
    <h5 class="mb-4 text-lg font-bold text-center">
      <span v-if="[56, 97].includes(Number(chainId))">
        {{ $t('transfer.importBEP20Token') }}
      </span>
      <span v-else>
        {{ $t('transfer.importERC20Token') }}
      </span>
    </h5>
    <div>
      <p class="mb-2 text-base font-bold">{{ $t('transfer.tokenAddress') }}</p>
      <BalTextInput
        v-model="tokenAddress"
        name="tokenAddressInput"
        :placeholder="$t('transfer.pleaseEnterAddress')"
        size="sm"
        class="w-full"
        autoFocus
        :rules="[isRequired(), isValidAddressV2()]"
        validateOn="input"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        :disabled="loading || loadingCheck"
      />

      <div v-if="loadingCheck" class="text-green-700">Checking...</div>
      <div v-if="isTokenInvalid" class="text-red-500">
        {{ $t('transfer.tokenNotFound') }}
      </div>
      <div v-if="tokenInfo" class="mt-2">
        <p class="mb-1 text-base font-bold">{{ $t('transfer.tokenInfo') }}:</p>
        <div class="flex flex-wrap items-center">
          <BalAsset
            :address="tokenInfo.address"
            :iconURI="tokenInfo.logoURI"
            :size="24"
            class="mr-2"
          />
          <div>
            <span class="font-semibold">{{ tokenInfo?.name }}</span>
            <span class="text-gray-400">&nbsp;{{ tokenInfo?.symbol }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <div class="flex justify-end mt-4">
        <BalBtn
          color="blue"
          :tag="tokenInfo ? 'button' : 'div'"
          :outline="false"
          :disabled="!tokenInfo"
          :loading="loading"
          :class="loading ? 'py-2 px-4 h-auto' : 'py-4 px-4 h-auto'"
          @click="importToken"
        >
          {{ $t('transfer.import') }}
        </BalBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isAddress } from '@ethersproject/address';
import { isValidAddressV2, isRequired } from '@/lib/utils/validations';
import { TokenInfo } from '@/types/TokenList';
import i18n from '@/plugins/i18n';
import useNotifications from '@/composables/useNotifications';
import useTokensLocal from '@/composables/transfer/useTokensLocal';
import useWeb3 from '@/services/web3/useWeb3';
import TokenService from '@/services/transfer/token.service';

const emit = defineEmits(['onImported']);

const tokenAddress = ref('');
const loading = ref(false);
const loadingCheck = ref(false);
const tokenInfo = ref<TokenInfo | null>(null);
const isTokenInvalid = ref(false);

const { importToken: importTokenLocal } = useTokensLocal();
const { chainId, account, getProvider } = useWeb3();
const { addNotification } = useNotifications();

/**
 * FUNCTIONS
 */
async function onCheckAddress(): Promise<void> {
  isTokenInvalid.value = false;
  try {
    if (!isAddress(tokenAddress.value)) {
      tokenInfo.value = null;
      return;
    }
    loadingCheck.value = true;
    const provider = getProvider();
    const tokenService = new TokenService(provider);
    const info = await tokenService.getInfoTokenErc20(tokenAddress.value);
    tokenInfo.value = info;
  } catch (error) {
    tokenInfo.value = null;
    isTokenInvalid.value = true;
  }
  loadingCheck.value = false;
}

async function importToken(): Promise<void> {
  try {
    if (!tokenInfo.value) {
      throw { message: i18n.global.t('transfer.tokenNotFound') };
    }
    loading.value = true;
    importTokenLocal(tokenInfo.value);
    const address = tokenInfo.value.address;
    const provider = getProvider();
    const tokenService = new TokenService(provider);
    const balances = await tokenService.getBalanceTokens(account.value, {
      [address]: tokenInfo.value,
    });
    loading.value = false;
    emit('onImported', {
      ...tokenInfo.value,
      balance: balances[address],
    });
    addNotification({
      type: 'success',
      title: '',
      message: i18n.global.t('transfer.tokenAddedSuccess'),
    });
  } catch (e: any) {
    loading.value = false;
    let message = e?.message || i18n.global.t('transfer.tokenImportFailed');

    addNotification({
      type: 'error',
      title: '',
      message: message,
    });
  }
}

/**
 * WATCHERS
 */

let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(tokenAddress, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    onCheckAddress();
  }, 500);
});
</script>