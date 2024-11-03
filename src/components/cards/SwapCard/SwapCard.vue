<template>
  <BalCard
    class="relative card-container bg-blue"
    :shadow="swapCardShadow"
    noBorder
  >
    <template #header>
      <div class="flex justify-between items-center w-full">
        <h4>{{ title }}</h4>
        <SwapSettingsPopover
          :context="SwapSettingsContext.swap"
          :isGasless="swapping.swapGasless.value"
        />
      </div>
    </template>
    <div>
      <SwapPair
        ref="refSwapPair"
        v-model:tokenInAmount="tokenInAmount"
        v-model:tokenInAddress="tokenInAddress"
        v-model:tokenOutAmount="tokenOutAmount"
        v-model:tokenOutAddress="tokenOutAddress"
        v-model:exactIn="exactIn"
        :swapLoading="
          swapping.isBalancerSwap.value ? swapping.isLoading.value : false
        "
        :effectivePriceMessage="swapping.effectivePriceMessage"
        class="mb-4"
        @amount-change="swapping.handleAmountChange"
        @modal-anti-trader-warning-change="updateModalAntiTraderWarning"
        @update:token-in-trade-info="updateTokenInTradeInfo"
      />
      <BalAlert
        v-if="error"
        class="p-3 mb-4"
        type="error"
        size="sm"
        :title="error.header"
        :description="error.body"
        :actionLabel="error.label"
        block
        @action-click="handleErrorButtonClick"
      />
      <BalAlert
        v-else-if="warning"
        class="p-3 mb-4"
        type="warning"
        size="sm"
        :title="warning.header"
        :description="warning.body"
        block
      />

      <BalAlert
        v-if="tokenInTraderInfo?.isProtectedToken"
        class="mb-4"
        title="ATF Warning"
        type="error"
      >
        <p class="text-gray-600 dark:text-gray-400">
          This token is subject to the AT-Field. You cannot sell more tokens
          than you have acquired in the game.
        </p>
        <a
          class="text-blue-600 hover:text-purple-600 focus:text-purple-600 dark:text-blue-400 dark:hover:text-yellow-500 dark:focus:text-yellow-500 transition-colors"
          href="https://docs.gaming-dex.com/product/anti-trader-field-at-field"
          target="_blank"
        >
          Learn more about AT-Field
        </a>
      </BalAlert>

      <BalBtn
        v-if="swapping.isLoading.value"
        loading
        disabled
        :loadingLabel="
          swapping.isCowswapSwap.value ? $t('loadingBestPrice') : $t('loading')
        "
        block
      />
      <BalBtn
        v-else
        :label="$t('preview')"
        :disabled="swapDisabled || modalAntiTraderWarning"
        classCustom="pink-white-shadow"
        block
        @click.prevent="handlePreviewButton"
      />
      <div
        v-if="swapping.isCowswapSupportedOnNetwork.value"
        class="flex items-center mt-5 h-8 text-sm"
      >
        <Transition name="fade" mode="out-in">
          <div
            v-if="swapping.isGaslessSwappingDisabled.value"
            class="text-secondary"
          >
            <div class="flex gap-2 items-center">
              <span class="text-lg">⛽</span>
              <Transition name="fade" mode="out-in">
                <p v-if="swapping.isWrap.value">
                  {{ $t('swapToggle.wrapEth') }}
                </p>
                <p v-else-if="swapping.isUnwrap.value">
                  {{ $t('swapToggle.unwrapEth') }}
                </p>
                <p v-else>
                  {{ $t('swapToggle.fromEth') }}
                </p>
              </Transition>
            </div>
          </div>

          <div v-else>
            <div class="flex items-center swap-gasless">
              <BalTooltip
                width="64"
                :disabled="!swapping.isGaslessSwappingDisabled.value"
              >
                <template #activator>
                  <BalToggle
                    name="swapGasless"
                    :checked="swapping.swapGasless.value"
                    :disabled="swapping.isGaslessSwappingDisabled.value"
                    @toggle="swapping.toggleSwapGasless"
                  />
                </template>
                <div
                  v-text="
                    swapping.isWrapUnwrapSwap.value
                      ? $t('swapGaslessToggle.disabledTooltip.wrapUnwrap')
                      : $t('swapGaslessToggle.disabledTooltip.eth')
                  "
                />
              </BalTooltip>
              <Transition name="fade" mode="out-in">
                <span
                  v-if="swapping.swapGasless.value"
                  class="pl-2 text-sm text-gray-600 dark:text-gray-400"
                  >{{ $t('swapToggle.swapGasless') }}</span
                >
                <span
                  v-else
                  class="pl-2 text-sm text-gray-600 dark:text-gray-400"
                  >{{ $t('swapToggle.swapWithGas') }}</span
                >
              </Transition>
              <BalTooltip width="64">
                <template #activator>
                  <BalIcon
                    name="info"
                    size="xs"
                    class="flex ml-1 text-gray-400"
                  />
                </template>
                <div v-html="$t('swapGaslessToggle.tooltip')" />
              </BalTooltip>
            </div>
          </div>
        </Transition>
      </div>
      <SwapRoute
        v-if="alwaysShowRoutes"
        :addressIn="swapping.tokenIn.value.address"
        :amountIn="swapping.tokenInAmountInput.value"
        :addressOut="swapping.tokenOut.value.address"
        :amountOut="swapping.tokenOutAmountInput.value"
        :pools="pools"
        :sorReturn="swapping.sor.sorReturn.value"
        class="mt-4"
      />
    </div>
  </BalCard>
  <SingularityComponent />

  <teleport to="#modal">
    <SwapPreviewModal
      v-if="modalSwapPreviewIsOpen"
      :swapping="swapping"
      :error="error"
      :warning="warning"
      @swap="swap"
      @close="handlePreviewModalClose"
    />
  </teleport>
</template>

<script lang="ts">
import SwapPreviewModal from '@/components/modals/SwapPreviewModal.vue';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import { useSwapState } from '@/composables/swap/useSwapState';
import useSwapping from '@/composables/swap/useSwapping';
import useValidation from '@/composables/swap/useValidation';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { TOKENS } from '@/constants/tokens';
import { lsGet } from '@/lib/utils';
import { WrapType } from '@/lib/utils/balancer/wrapper';
import { isRequired } from '@/lib/utils/validations';
import { useTokens } from '@/providers/tokens.provider';
import { ApiErrorCodes } from '@/services/cowswap/errors/OperatorError';
import useWeb3 from '@/services/web3/useWeb3';
import { SubgraphPoolBase } from '@defiverse/balancer-sdk';
import { getAddress, isAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import SingularityComponent from '../SingularityCard/SingularityComponent.vue';
import SwapPair from './SwapPair.vue';
import SwapRoute from './SwapRoute.vue';
export default defineComponent({
  components: {
    SwapPair,
    SwapPreviewModal,
    SwapRoute,
    SwapSettingsPopover,
    SingularityComponent,
  },
  setup() {
    // STATES
    const refSwapPair = ref(null);
    // COMPOSABLES
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();
    const { bp } = useBreakpoints();
    const { fNum2 } = useNumbers();
    const { appNetworkConfig, isMismatchedNetwork } = useWeb3();
    const { nativeAsset } = useTokens();
    const {
      tokenInAddress,
      tokenOutAddress,
      tokenInAmount,
      tokenOutAmount,
      setTokenInAddress,
      setTokenOutAddress,
      setTokenInAmount,
      setTokenOutAmount,
      setInitialized,
    } = useSwapState();
    // DATA
    const exactIn = ref(true);
    const modalSwapPreviewIsOpen = ref(false);
    const dismissedErrors = ref({
      highPriceImpact: false,
    });
    const modalAntiTraderWarning = ref<boolean>(false);

    const alwaysShowRoutes = lsGet('alwaysShowRoutes', false);
    const swapCardShadow = computed(() => {
      switch (bp.value) {
        case 'xs':
          return 'none';
        case 'sm':
          return 'lg';
        default:
          return 'xl';
      }
    });
    const swapping = useSwapping(
      exactIn,
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount
    );
    const { errorMessage } = useValidation(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount
    );
    const tokenInTraderInfo = ref<any>(undefined);
    // COMPUTED
    const isHighPriceImpact = computed(
      () =>
        swapping.sor.validationErrors.value.highPriceImpact &&
        !dismissedErrors.value.highPriceImpact
    );
    const swapDisabled = computed(() => {
      if (
        tokenOutAddress.value?.toLowerCase() ===
          '0x5a89e11cb554e00c2f51c4bb7f05bc7ab0fa6351' ||
        tokenOutAddress.value?.toLowerCase() ===
          '0x6b382742b07aabba58c38d792b5d7cbaab246e99'
      ) {
        return true; // Disable swap in case OAS --> WOAS
      }
      const hasMismatchedNetwork = isMismatchedNetwork.value;
      const hasAmountsError =
        !tokenInAmount.value ||
        !tokenOutAmount.value ||
        Number(tokenInAmount.value) === 0 ||
        Number(tokenOutAmount.value) === 0;

      const hasCowswapErrors =
        swapping.isCowswapSwap.value &&
        swapping.cowswap.hasValidationError.value;
      const hasBalancerErrors =
        swapping.isBalancerSwap.value && isHighPriceImpact.value;
      return (
        hasAmountsError ||
        hasCowswapErrors ||
        hasBalancerErrors ||
        hasMismatchedNetwork
      );
    });
    const title = computed(() => {
      if (swapping.wrapType.value === WrapType.Wrap) {
        return `${t('wrap')} ${swapping?.tokenIn?.value?.symbol}`;
      }
      if (swapping.wrapType.value === WrapType.Unwrap) {
        return `${t('unwrap')} ${swapping?.tokenOut?.value?.symbol}`;
      }
      return t('swap');
    });
    const pools = computed<SubgraphPoolBase[]>(
      // @ts-ignore-next-line -- Fix types incompatibility error. Related to BigNumber?
      () => {
        return swapping.sor.pools.value;
      }
    );
    const error = computed(() => {
      if (isMismatchedNetwork.value) {
        return {
          header: t('switchNetwork'),
          body: t('networkMismatch', [appNetworkConfig.name]),
        };
      }
      if (swapping.isBalancerSwap.value && !swapping.isLoading.value) {
        if (swapping.sor.validationErrors.value.noSwaps) {
          return {
            header: t('insufficientLiquidity'),
            body: t('insufficientLiquidityDetailed'),
          };
        }
      }
      if (swapping.isCowswapSwap.value) {
        if (swapping.cowswap.validationError.value != null) {
          const validationError = swapping.cowswap.validationError.value;
          if (validationError === ApiErrorCodes.SellAmountDoesNotCoverFee) {
            return {
              header: t('cowswapErrors.lowAmount.header'),
              body: t('cowswapErrors.lowAmount.body'),
            };
          } else if (validationError === ApiErrorCodes.PriceExceedsBalance) {
            return {
              header: t('cowswapErrors.lowBalance.header', [
                swapping.tokenIn.value.symbol,
              ]),
              body: t('cowswapErrors.lowBalance.body', [
                swapping.tokenIn.value.symbol,
                fNum2(
                  formatUnits(
                    swapping.getQuote().maximumInAmount,
                    swapping.tokenIn.value.decimals
                  ),
                  FNumFormats.token
                ),
                fNum2(swapping.slippageBufferRate.value, FNumFormats.percent),
              ]),
            };
          } else if (validationError === ApiErrorCodes.NoLiquidity) {
            return {
              header: t('cowswapErrors.noLiquidity.header', [
                swapping.tokenIn.value.symbol,
              ]),
              body: t('cowswapErrors.noLiquidity.body'),
            };
          } else {
            return {
              header: t('cowswapErrors.genericError.header'),
              body: swapping.cowswap.validationError.value,
            };
          }
        }
      } else if (swapping.isBalancerSwap.value) {
        if (isHighPriceImpact.value) {
          return {
            header: t('highPriceImpact'),
            body: t('highPriceImpactDetailed'),
            label: t('accept'),
          };
        }
      }
      return undefined;
    });
    const warning = computed(() => {
      if (swapping.isCowswapSwap.value) {
        if (swapping.cowswap.warnings.value.highFees) {
          return {
            header: t('cowswapWarnings.highFees.header'),
            body: t('cowswapWarnings.highFees.body'),
          };
        }
      }
      return undefined;
    });

    // METHODS
    function swap() {
      swapping.swap(() => {
        setTimeout(() => {
          refSwapPair.value?.updateTraderInfo();
        }, 3000);

        swapping.resetAmounts();
        modalSwapPreviewIsOpen.value = false;
      });
    }

    function handleErrorButtonClick() {
      if (swapping.sor.validationErrors.value.highPriceImpact) {
        dismissedErrors.value.highPriceImpact = true;
      }
    }
    async function populateInitialTokens(): Promise<void> {
      console.log('Populating initial tokens', route, route.query);
      let assetIn = router.currentRoute.value.params.assetIn as string;
      if (assetIn === nativeAsset.deeplinkId) {
        assetIn = nativeAsset.address;
      } else if (isAddress(assetIn)) {
        assetIn = getAddress(assetIn);
      }
      let assetOut = router.currentRoute.value.params.assetOut as string;
      if (assetOut === nativeAsset.deeplinkId) {
        assetOut = nativeAsset.address;
      } else if (isAddress(assetOut)) {
        assetOut = getAddress(assetOut);
      }
      setTokenInAddress(assetIn || store.state.swap.inputAsset);
      setTokenOutAddress(assetOut || store.state.swap.outputAsset);

      let assetInAmount = router.currentRoute.value.query?.inAmount as string;
      let assetOutAmount = router.currentRoute.value.query?.outAmount as string;
      if (assetInAmount) {
        setTokenInAmount(assetInAmount);
      }
      if (!assetInAmount && assetOutAmount) {
        setTokenOutAmount(assetOutAmount);
      }
    }
    function switchToWETH() {
      tokenInAddress.value = appNetworkConfig.addresses.weth;
    }
    function handlePreviewButton() {
      swapping.resetSubmissionError();
      modalSwapPreviewIsOpen.value = true;
    }
    function handlePreviewModalClose() {
      swapping.resetSubmissionError();
      modalSwapPreviewIsOpen.value = false;
    }
    function updateModalAntiTraderWarning(payload) {
      modalAntiTraderWarning.value = payload;
    }
    function updateTokenInTradeInfo(info) {
      tokenInTraderInfo.value = info;
    }
    // INIT
    onBeforeMount(() => {
      populateInitialTokens();
      setInitialized(true);
    });
    onBeforeUnmount(() => {
      // reset amount
      if (modalAntiTraderWarning.value === true) {
        setTokenInAmount('');
        setTokenOutAmount('');
      }
    });
    return {
      refSwapPair,
      // constants
      TOKENS,
      // context
      SwapSettingsContext,
      // data
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      modalSwapPreviewIsOpen,
      alwaysShowRoutes,
      exactIn,
      swapping,
      modalAntiTraderWarning,
      tokenInTraderInfo,
      // computed
      pools,
      title,
      error,
      warning,
      errorMessage,
      isRequired,
      swapDisabled,
      swapCardShadow,
      handlePreviewButton,
      handlePreviewModalClose,
      // methods
      swap,
      switchToWETH,
      handleErrorButtonClick,
      updateModalAntiTraderWarning,
      updateTokenInTradeInfo,
    };
  },
});
</script>
<style scoped lang="scss">
/* This is needed because the swap settings popover overflows */
.card-container {
  overflow: unset;
}

.swap-gasless :deep(.bal-toggle) {
  width: 3rem;
}

.gas-symbol {
  @apply h-8 w-8 rounded-full flex items-center justify-center text-lg bg-gray-50 dark:bg-gray-800;
}

.gas-symbol::before {
  content: '⛽';
}

.signature-symbol::before {
  content: '✍️';
}
.atf-description {
  > a {
  }
}
</style>
