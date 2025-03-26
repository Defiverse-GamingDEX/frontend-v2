<script>
import { ref, computed } from 'vue'; // Added computed to imports
import { useI18n } from 'vue-i18n';
import { useTokens } from '@/providers/tokens.provider';
import { isAddress } from '@ethersproject/address';
import { isValidAddressV2, isRequired } from '@/lib/utils/validations';
import useNotifications from '@/composables/useNotifications';
export default {
  name: 'ImportToken',
  emits: ['select'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { injectTokens, searchTokens } = useTokens();
    const { notify } = useNotifications();
    const tokenAddress = ref('');
    const error = ref('');
    const loading = ref(false);
    const tokenFound = ref(false);
    const tokenInfo = ref(null);
    const inputRules = computed(() => {
      const rules = [isRequired(), isValidAddressV2()];
      return rules;
    });
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
      console.log(
        '🚀 ~ validateAddress ~ tokenAddress.value:',
        tokenAddress.value
      );
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
        // TODO call BE here
        await injectTokens([tokenAddress.value]);
        emit('select', tokenAddress.value);
      } catch (e) {
        console.error('Error importing token:', e);
        notify({
          title: 'Error',
          description: 'Error importing token',
          type: 'error',
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

    return {
      tokenAddress,
      error,
      loading,
      tokenFound,
      tokenInfo,
      importToken,
      inputRules,
      isAddressValid, // Export the computed property
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
          :disabled="!tokenAddress || !isAddressValid"
          @click="importToken"
        >
          <BalLoadingIcon v-if="loading" /> {{ 'Import token' }}
        </BalBtn>
      </div>
    </div>
  </div>
</template>