<script>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { isAddress } from '@ethersproject/address';
import { isValidAddressV2, isRequired } from '@/lib/utils/validations';
import useNotifications from '@/composables/useNotifications';
import bridgeApi from '@/composables/bridge/bridge.price.api';
import useWeb3 from '@/services/web3/useWeb3';
import { fetchTokenListsByChainId } from '@/constants/tokenlists';
import { useTokenLists } from '@/providers/token-lists.provider';

export default {
  name: 'ImportToken',
  emits: ['select', 'switch-tab'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const tokenAddress = ref('0xD77c861Db1142104c8F5822Fe3A15351d0c704F6');
    const error = ref('');
    const loading = ref(false);
    const tokenFound = ref(false);
    const tokenInfo = ref(null);
    const inputRules = computed(() => {
      const rules = [isRequired(), isValidAddressV2()];
      return rules;
    });
    const { account, chainId } = useWeb3();
    const { addNotification } = useNotifications();
    const tokenLists = useTokenLists();

    // A function to force a complete refresh of the token lists
    async function forceRefreshTokens() {
      try {
        console.log('Forcing a complete token list refresh');
        // Fetch fresh token data from API
        const updatedTokensData = await fetchTokenListsByChainId(chainId.value);

        if (updatedTokensData && updatedTokensData[chainId.value]) {
          const newTokens = updatedTokensData[chainId.value];
          console.log(
            `Refreshed token list has ${newTokens.tokens.length} tokens`
          );

          // Convert to the format needed for token lists
          const tokenListKey = JSON.stringify(newTokens);

          // Clear and reload the token lists
          tokenLists.allTokenLists.value = {
            [tokenListKey]: newTokens,
          };

          // Update active keys
          tokenLists.activeListKeys.value = [tokenListKey];
          // Update approvedTokenLists

          return true;
        }
        return false;
      } catch (error) {
        console.error('Error refreshing token lists:', error);
        return false;
      }
    }

    // Only validate the address format
    function validateAddress(event) {
      console.log('🚀 ~ validateAddress ~ event:', event);
      // If called from importToken (no event), use the current value
      if (!event) {
        error.value = '';

        if (!tokenAddress.value) {
          error.value = t('addressRequired');
          return false;
        }

        if (!isAddress(tokenAddress.value)) {
          error.value = t('invalidAddress');
          return false;
        }

        return true;
      }

      // If called from input event
      tokenAddress.value = event.target.value;
      error.value = '';

      if (!tokenAddress.value) {
        error.value = t('addressRequired');
        return false;
      }

      if (!isAddress(tokenAddress.value)) {
        error.value = t('invalidAddress');
        return false;
      }

      return true;
    }
    async function importToken() {
      if (!validateAddress()) return;

      try {
        loading.value = true;
        // Call backend to import token
        const params = {
          address: tokenAddress.value,
          chain_id: chainId.value,
        };
        // const rs = await bridgeApi.importToken(params);
        // console.log('🚀 ~ importToken ~ rs:', rs);

        // Wait to ensure backend has processed the token
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update token list with retry mechanism
        console.log('Starting token list refresh after import');
        let success = await forceRefreshTokens();

        // If first attempt fails, retry after a delay
        if (!success) {
          console.log('First refresh attempt failed, retrying...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          success = await forceRefreshTokens();
        }

        // Final check
        if (success) {
          console.log('Token lists successfully refreshed with new token');
        } else {
          console.warn('Token lists may not have been fully refreshed');
        }

        addNotification({
          type: 'success',
          title: '',
          message: 'Import token success',
        });

        // Emit select event with the imported token address
        emit('select', tokenAddress.value);
      } catch (e) {
        console.error('Error importing token:', e);
        addNotification({
          type: 'error',
          title: '',
          message:
            e.response?.data?.message || e.message || 'Import token failed',
        });
      } finally {
        loading.value = false;
      }
    }

    // Add a computed property to check if the address is valid
    const isAddressValid = computed(() => {
      if (!tokenAddress.value) return false;
      return isAddress(tokenAddress.value);
    });

    // Add this function to handle keydown events
    function handleKeyDown(event) {
      console.log('🚀 ~ handleKeyDown ~ event:', event);
      // Prevent form submission on Enter key
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation(); // Add this to stop event bubbling
        // Optionally trigger the import if the address is valid
        if (isAddressValid.value && isAddressValid.value) {
          importToken();
        }
      }
    }

    return {
      tokenAddress,
      error,
      loading,
      tokenFound,
      tokenInfo,
      importToken,
      inputRules,
      handleKeyDown,
      isAddressValid, // Export the computed property
      forceRefreshTokens,
    };
  },
};
</script>

<template>
  <div class="p-4">
    <div class="mb-4">
      <p class="mb-2 text-base">{{ 'Token address' }}</p>
      <BalTextInput
        v-model="tokenAddress"
        name="tokenAddressInput"
        placeholder="Enter token contract address"
        size="sm"
        class="w-full"
        autoFocus
        :rules="inputRules"
        validateOn="input"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        @keydown="handleKeyDown"
      />
      <div v-if="error" class="mt-2 text-sm text-red-500">
        {{ error }}
      </div>
    </div>

    <div class="mt-4">
      <div class="flex justify-end mt-4">
        <BalBtn
          color="blue"
          classCustom="pink-white-shadow"
          size="sm"
          :loading="loading"
          :disabled="!tokenAddress || !isAddressValid"
          @click="importToken"
        >
          {{ 'Import token' }}
        </BalBtn>
      </div>
    </div>
  </div>
</template>