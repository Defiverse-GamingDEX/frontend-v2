<script setup lang="ts">
import { useI18n } from 'vue-i18n';
interface Props {
  open?: boolean;
  networkList: Array<any>;
  networkChoose?: any;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  networkList: () => [],
  networkChoose: () => {},
});

const emit = defineEmits(['close', 'select']);

/**
 * STATES
 */
const search = ref('');
const networkListShow = ref(props?.networkList || []);
/**
 * COMPOSABLES
 */
const { t } = useI18n();

/**
 * LIFECYCLES
 */
onMounted(() => {});

/**
 * METHODS
 */
function handleSearch(text) {
  console.log(text, 'text');
  search.value = text;
  const query = text.toLowerCase();
  console.log(query, 'query');
  console.log(props?.networkList, 'props?.networkList');
  const rs = props?.networkList?.filter(item =>
    item?.name?.toLowerCase()?.includes(query)
  );
  console.log(rs, 'rs');
  networkListShow.value = rs;
}
async function onSelectNetwork(network: number): Promise<void> {
  emit('select', network);
  emit('close');
}
</script>

<template>
  <BalModal show noContentPad @close="$emit('close')">
    <div class="overflow-hidden">
      <div class="network-list">
        <div class="title">{{ $t('selectChain') }}</div>
        <div class="search-form-container">
          <BalTextInput
            :modelValue="search"
            name="search"
            :placeholder="$t('searchByName')"
            type="text"
            autoFocus
            size="sm"
            @update:model-value="handleSearch($event)"
          >
            <template #prepend>
              <div class="flex justify-center items-center w-8 h-full">
                <BalIcon name="search" size="sm" class="mr-2 text-gray-500" />
              </div>
            </template>
          </BalTextInput>
        </div>
        <div v-if="networkListShow.length > 0" class="list-container">
          <div
            v-for="(item, index) in networkListShow"
            :key="index"
            class="item-info"
            :class="{
              active:
                item.chain_id_decimals === networkChoose?.chain_id_decimals,
            }"
            @click="onSelectNetwork(item.chain_id_decimals)"
          >
            <div class="item-img">
              <img width="48" height="48" :src="item.img_url" />
            </div>
            <div class="item-label">{{ item.name }}</div>
          </div>
        </div>
        <div
          v-else
          class="p-12 h-96 text-center text-secondary"
          v-text="$t('errorNoNetworks')"
        />
      </div>

      <!-- <div v-else-if="loading" class="flex justify-center items-center h-96">
        <BalLoadingIcon />
      </div> -->
    </div>
  </BalModal>
</template>

<style scoped lang="scss">
.network-list {
  border-radius: 20px;
  padding: 24px 20px;
  .title {
    font-size: 18px;
    font-weight: bold;
    line-height: 22px;
    color: #243f41;
    margin-bottom: 8px;
  }
  .search-form-container {
    margin-bottom: 8px;
  }
  .list-container {
    .item-info {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      border-radius: 0.5rem;
      &:hover {
        background: #eff6ff;
      }
      &.active {
        background: #eff6ff;
      }
      &:last-child {
        margin-bottom: 0px;
      }
      .item-img {
        margin-right: 12px;
        > img {
          width: 36px;
          height: 36px;
        }
      }
    }
  }
}
</style>


