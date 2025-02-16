<template>
  <BalPopover>
    <template #activator>
      <BalBtn
        circle
        color="white"
        size="sm"
        class="mb-2 text-secondary icon-spin-anim"
        @click="onActivatorClick"
      >
        <BalIcon name="settings" size="sm" />
      </BalBtn>
    </template>

    <div>
      <div class="flex items-baseline">
        <span class="mb-2 font-medium" v-text="$t('slippageTolerance')" />
        <BalTooltip>
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-1 text-gray-400" />
          </template>
          <div v-html="$t('marketConditionsWarning')" />
        </BalTooltip>
      </div>
      <AppSlippageForm class="mt-1" />
    </div>
    <div v-if="isEIP1559SupportedNetwork" class="mt-6">
      <div class="flex items-baseline">
        <span class="mb-2 font-medium" v-text="$t('transactionType')" />
        <BalTooltip>
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-1 text-gray-400" />
          </template>
          <div v-text="$t('ethereumTxTypeTooltip')" />
        </BalTooltip>
      </div>
      <div class="flex mt-1">
        <BalBtnGroup
          v-model="ethereumTxType"
          :options="ethereumTxTypeOptions"
          @update:model-value="setEthereumTxType"
        />
      </div>
    </div>
    <div v-if="isGassless && context === SwapSettingsContext.swap" class="mt-6">
      <div class="flex items-baseline">
        <span class="mb-2 font-medium" v-text="$t('transactionDeadline')" />
        <BalTooltip>
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-1 text-gray-400" />
          </template>
          <div v-html="$t('transactionDeadlineTooltip')" />
        </BalTooltip>
      </div>
      <div class="flex mt-1">
        <div
          class="flex items-center px-1 rounded-lg border dark:border-gray-700 shadow-inner"
        >
          <input
            v-model="appTransactionDeadline"
            class="w-8 text-right bg-transparent"
            placeholder="20"
            type="number"
            step="1"
            min="0"
            @update:modelValue="setTransactionDeadline"
          />
        </div>
        <div class="px-2">minutes</div>
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, Ref, toRefs } from 'vue';
import { useStore } from 'vuex';

import AppSlippageForm from '@/components/forms/AppSlippageForm.vue';
import useEthereumTxType from '@/composables/useEthereumTxType';
import useFathom from '@/composables/useFathom';
import { ethereumTxTypeOptions } from '@/constants/options';
import useWeb3 from '@/services/web3/useWeb3';

export enum SwapSettingsContext {
  swap,
  invest,
}

export default defineComponent({
  name: 'SwapSettingsPopover',

  components: {
    AppSlippageForm,
  },

  props: {
    context: {
      type: [String, Number] as PropType<SwapSettingsContext>,
      required: true,
    },
    isGassless: { type: Boolean, default: false },
  },

  setup(props) {
    // DATA
    const { context }: { context: Ref<SwapSettingsContext> } = toRefs(props);

    // COMPOSABLES
    const store = useStore();
    const { explorerLinks, isEIP1559SupportedNetwork } = useWeb3();
    const { trackGoal, Goals } = useFathom();
    const { ethereumTxType, setEthereumTxType } = useEthereumTxType();

    // COMPUTED
    const appTransactionDeadline = computed<number>(
      () => store.state.app.transactionDeadline
    );

    // METHODS
    const setTransactionDeadline = transactionDeadline =>
      store.commit('app/setTransactionDeadline', transactionDeadline);

    function onActivatorClick(): void {
      if (context.value === SwapSettingsContext.swap) {
        trackGoal(Goals.ClickSwapSettings);
      } else if (context.value === SwapSettingsContext.invest) {
        trackGoal(Goals.ClickJoinPoolSettings);
      }
    }

    return {
      Goals,
      // types,
      SwapSettingsContext,
      // computed
      appTransactionDeadline,
      isEIP1559SupportedNetwork,
      // methods
      setTransactionDeadline,
      explorer: explorerLinks,
      onActivatorClick,
      ethereumTxType,
      setEthereumTxType,
      ethereumTxTypeOptions,
    };
  },
});
</script>

<style>
.swap-settings-option:hover {
  @apply text-blue-500 border-blue-500;
}

.swap-settings-option.active {
  @apply text-blue-500 border-blue-500;
}
</style>
