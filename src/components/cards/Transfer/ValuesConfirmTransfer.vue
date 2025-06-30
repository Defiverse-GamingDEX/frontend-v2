<template>
  <div>
    <BalTable
      :columns="columns"
      :data="rewardsData"
      :noResultsLabel="$t('noResultsTable.noBalIncentives')"
      skeletonClass="h-24"
      :square="upToLargeBreakpoint"
    >
      <template #orderCell="{ no }">
        <div class="py-2 px-4 text-center">
          {{ no }}
        </div>
      </template>
      <template #addressCell="item">
        <div class="py-2 px-4 text-left">
          <span v-if="!item.isValid" class="text-red-500">{{
            $t('invalidFormat')
          }}</span>
          <span v-else>
            {{ truncateText(item?.address, 16, 8, 4) }}
          </span>
        </div>
      </template>
      <template #amountCell="item">
        <div v-if="item.isValid" class="py-2 px-4 text-right">
          <span class="font-bold">{{
            fNum2(item?.amount, FNumFormats.token)
          }}</span>
          <span class="text-sm text-gray-400"> &nbsp;{{ symbolShow }} </span>
        </div>
      </template>
    </BalTable>
    <div
      v-if="props.total"
      class="flex justify-between items-center p-4 align-top bg-white dark:bg-gray-850 border-t dark:border-gray-900"
    >
      <span class="font-semibold text-left"> {{ $t('total') }} </span>
      <span class="font-semibold text-left">
        <span class="font-bold">{{
          fNum2(props.total, FNumFormats.token)
        }}</span>
        <span class="text-sm text-gray-400"> &nbsp;{{ symbolShow }} </span>
      </span>
    </div>
    <div
      v-if="props.remaining"
      class="flex justify-between items-center px-4 align-top bg-white dark:bg-gray-850 dark:border-gray-900"
    >
      <span class="font-semibold text-left"> {{ $t('remaining') }} </span>
      <span
        :class="[
          'font-semibold text-left',
          { ['text-red-500']: Number(props.remaining) < 0 },
        ]"
      >
        <span class="font-bold">
          {{ Number(props.remaining) < 0 ? '-' : ''
          }}{{ fNum2(Math.abs(Number(props.remaining)), FNumFormats.token) }}
        </span>
        <span class="text-sm text-gray-400"> &nbsp;{{ symbolShow }} </span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ValueTextAreaType } from '@/composables/transfer/useTransferTokens';
import { useI18n } from 'vue-i18n';
import useBreakpoints from '@/composables/useBreakpoints';
import { truncateText } from '@/plugins/utils.js';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

interface Props {
  data: ValueTextAreaType[];
  headers: string[];
  symbol?: string;
  total?: string;
  remaining?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  headers: () => [],
  symbol: '',
  total: '',
  remaining: '',
});

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum2 } = useNumbers();

const columns = computed(() => {
  const tmp = props.headers?.map(i => {
    return {
      name: t(i),
      id: i,
      accessor: 'no',
      Cell: i + 'Cell',
      noGrow: true,
      align: i == 'amount' ? 'right' : 'left',
      className: '!p-4',
      cellClassName: '!p-4',
    };
  });
  return [
    {
      name: t('orderNumberText'),
      id: 'icons',
      accessor: 'no',
      Cell: 'orderCell',
      width: 50,
      noGrow: true,
      align: 'left',
      className: '!p-4',
      cellClassName: '!p-4',
    },
    ...tmp,
  ];
});

const rewardsData = computed(() => {
  return props.data?.map((val, idx) => {
    let values = {};
    val?.value.forEach((el, jdx) => {
      values[props.headers[jdx]] = el;
    });
    return {
      no: idx + 1,
      isValid: val.isValid,
      ...values,
    };
  });
});

const symbolShow = computed(() => {
  return truncateText(props.symbol, 16, 8, 0);
});
</script>