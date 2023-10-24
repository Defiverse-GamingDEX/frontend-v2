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
            validateOn="input"
            autocomplete="off"
            autocorrect="off"
            step="any"
            spellcheck="false"
            v-bind="$attrs"
            inputAlignRight
            @update:model-value="handleSearch($event)"
          >
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
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 0px 7px 14px #0071a598;
  border-radius: 20px;
  padding: 24px 20px;
  .title {
    font-size: 18px;
    font-weight: bold;
    line-height: 22px;
    color: #243f41;
    margin-bottom: 24px;
  }
  .list-container {
    .item-info {
      background: #ffffff 0% 0% no-repeat padding-box;
      box-shadow: 0px 1px 3px #00000029;
      border-radius: 10px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      padding: 6px;
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
      &.active {
        box-shadow: inset 1px 1px 5px #00000072;
      }
      &:last-child {
        margin-bottom: 0px;
      }
      .item-img {
        margin-right: 12px;
        > img {
          width: 24px;
          height: 24px;
        }
      }
      .item-label {
        font-size: 18px;
        line-height: 22px;
        font-weight: bold;
        letter-spacing: 0px;
        color: #0a425c;
      }
    }
  }
}
</style>


