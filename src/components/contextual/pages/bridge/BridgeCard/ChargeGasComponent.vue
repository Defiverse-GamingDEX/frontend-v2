

<script setup lang="ts">
import ChargeGasIcon from './ChargeGasIcon.vue';
import { useI18n } from 'vue-i18n';
// PROPS
type Props = {
  isChargeGas?: boolean;
};
// STATES
const isChecked = ref(false);
const props = withDefaults(defineProps<Props>(), {
  isChargeGas: false,
});
// EMITS
const emit = defineEmits<{
  (e: 'update:changeGas', isChecked: boolean): void;
}>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
/**
 * WATCHERS
 */
watchEffect(() => {
  isChecked.value = props?.isChargeGas;
});

// FUNCTIONS
function toggleGas() {
  isChecked.value = !isChecked.value;
  emit('update:changeGas', isChecked.value);
}
</script>

<template>
  <div class="charge-gas-component">
    <div class="gas-label">Charge gas</div>
    <div class="gas-control">
      <BalToggle name="chargeGas" :checked="isChecked" @toggle="toggleGas">
        <template #icon>
          <ChargeGasIcon />
        </template>
        <template #track-label>
          <div>{{ isChecked === true ? 'ON' : 'OFF' }}</div>
        </template>
      </BalToggle>
    </div>
    <div class="gas-tooltip">
      <BalTooltip width="64">
        <template #activator>
          <BalIcon
            name="help-circle"
            size="md"
            class="flex ml-3 text-gray-400"
          />
        </template>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          v-html="
            t(
              'This option allows you to exchenge a small amount of OAS from the sent tokens as gas fees for DeFiVerse. When activated, 10 OAS will be automatically converted.'
            )
          "
        />
      </BalTooltip>
    </div>
  </div>
</template>
<style scoped lang="scss">
.charge-gas-component {
  display: flex;
  align-items: center;
  justify-content: center;
  .gas-label {
    font-size: 14px;
    line-height: 14px;
    font-weight: bold;
    letter-spacing: 0px;
    color: #808080;
    margin-right: 12px;
  }
  .gas-control {
    :deep() {
      .bal-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f9fa 0% 0% no-repeat padding-box;
        box-shadow: inset 0px 1px 3px #0000004a;
        border-radius: 18px;
        padding: 2px 2px 2px 12px;
        width: 112px;
        height: 36px;

        .bal-toggle-checkbox {
          height: 30px;
          width: 30px;
          background: #f5f9fa 0% 0% no-repeat padding-box;
          box-shadow: inset 0px -5px 3px #0000004a;
          border: 0px;
          left: 40px;
          right: auto;
          z-index: 2;
          &:checked {
            left: auto;
            right: 6px;
            + svg {
              color: #16a34a;
            }
            + svg + .bal-toggle-track {
              background: #64c187;
              > div {
                margin-left: 8px;
                color: #16a34a;
              }
            }
          }
        }
        > svg {
          margin-right: 4px;
          color: #dc2626;
        }
        .bal-toggle-track {
          width: 72px;
          height: 32px;
          background: #e57070;
          position: relative;
          display: flex;
          align-items: center;
          > div {
            margin-left: auto;
            margin-right: 6px;
            color: #dc2626;
            text-shadow: inset 0px 3px 6px #00000029;
            font-size: 16px;
            font-weight: bold;
            line-height: 16px;
          }
        }
      }
    }
  }
}
</style>
