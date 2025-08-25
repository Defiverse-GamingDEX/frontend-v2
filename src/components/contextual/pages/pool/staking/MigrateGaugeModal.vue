<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Pool } from '@/services/pool/types';
import StakingGaugeMigrate from './StakingGaugeMigrate.vue';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';

/**
 * TYPES
 */
type Props = {
  isVisible: boolean;
  pool: Pool;
  gaugeInfo: any;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();
const emit = defineEmits(['close', 'success']);

/**
 * STATE
 */
const showFireworks = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { setCurrentPool } = usePoolStaking();

/**
 * METHODS
 */
function handleClose() {
  showFireworks.value = false;
  emit('close');
}

function handleSuccess() {
  showFireworks.value = true;
  emit('success');
}

/**
 * WATCHERS
 */
onMounted(() => {
  setCurrentPool(props.pool.id);
});

watch(
  () => props.pool,
  newPool => {
    setCurrentPool(newPool.id);
  }
);
</script>

<template>
  <teleport to="#modal">
    <BalModal :show="isVisible" :fireworks="showFireworks" @close="handleClose">
      <template #header>
        <div class="flex items-center">
          <BalCircle
            v-if="showFireworks"
            size="8"
            color="green"
            class="mr-2 text-white"
          >
            <BalIcon name="check" />
          </BalCircle>
          <h4>
            {{ t('migratePool.migrateStakedTokens') }}
          </h4>
        </div>
      </template>

      <StakingGaugeMigrate
        :pool="pool"
        :gaugeInfo="gaugeInfo"
        @close="handleClose"
        @success="handleSuccess"
      />
    </BalModal>
  </teleport>
</template>
