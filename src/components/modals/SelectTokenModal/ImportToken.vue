<script>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { isAddress } from '@ethersproject/address';
import { isValidAddressV2, isRequired } from '@/lib/utils/validations';
import useNotifications from '@/composables/useNotifications';
import bridgeApi from '@/composables/bridge/bridge.price.api';
import useWeb3 from '@/services/web3/useWeb3';
import { forceRefreshTokens } from '@/providers/token-lists.provider';
import TokenImageUpload from './TokenImageUpload.vue';

export default {
  name: 'ImportToken',
  components: {
    TokenImageUpload,
  },
  emits: ['select', 'switch-tab'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const tokenAddress = ref('');
    const error = ref('');
    const loading = ref(false);
    const tokenFound = ref(false);
    const tokenInfo = ref(null);
    const logoUrl = ref('');
    const inputRules = computed(() => {
      const rules = [isRequired(), isValidAddressV2()];
      return rules;
    });
    const { chainId } = useWeb3();
    const { addNotification } = useNotifications();

    // Only validate the address format
    function validateAddress(event) {
      console.log('validateAddress ~ event:', event);
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

        // 1. Call API to import token
        const params = {
          address: tokenAddress.value,
          chain_id: chainId.value,
        };

        // Add logo_url if available
        if (logoUrl.value) {
          params.logo_url = logoUrl.value;
        }

        await bridgeApi.importToken(params);

        // 2. Wait for backend processing
        await new Promise(resolve => setTimeout(resolve, 800));

        // 3. Update token list and uris
        const success = await forceRefreshTokens(chainId.value);

        // 4. Success notification
        addNotification({
          type: 'success',
          title: '',
          message: 'Import token success',
        });

        // 5. Emit select event to choose token
        emit('select', tokenAddress.value);

        // 6. Reset form for next use
        // Note: We don't reset immediately to allow the modal to close
        setTimeout(() => {
          tokenAddress.value = '';
          logoUrl.value = '';
          error.value = '';
        }, 500);
      } catch (e) {
        console.error('Error importing token:', e);
        let message =
          e.response?.data?.message || e.message || 'Import token failed';
        if (message === 'TOKEN_IS_EXISTS') {
          message = 'Token is exists';
        }
        if (message === 'INVALID_TOKEN') {
          message = 'Token is not ERC20 token';
        }
        addNotification({
          type: 'error',
          title: '',
          message: message,
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
      console.log('handleKeyDown ~ event:', event);
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
      logoUrl,
      importToken,
      inputRules,
      handleKeyDown,
      isAddressValid, // Export the computed property
    };
  },
};
</script>

<template>
  <div class="p-4">
    <!-- Move TokenImageUpload component before address input -->
    <TokenImageUpload v-model:logoUrl="logoUrl" />

    <div class="mb-4">
      <p class="mb-2 text-base font-bold">{{ 'Token address' }}</p>
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
          :tag="isAddressValid ? 'button' : 'div'"
          :outline="false"
          :disabled="!tokenAddress || !isAddressValid"
          :loading="loading"
          class="py-4 px-4 !h-auto"
          @click="importToken"
        >
          {{ 'Import token' }}
        </BalBtn>
      </div>
    </div>
  </div>
</template>