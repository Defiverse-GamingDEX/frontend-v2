import blocknative from '@/plugins/blocknative';
import i18n from '@/plugins/i18n';
import router from '@/plugins/router';
import vueQuery from '@/plugins/vueQuery';
import Web3Plugin from '@/services/web3/web3.plugin';
import store from '@/store';
import { App } from 'vue';
import VueVirtualScroller from 'vue3-virtual-scroller';

export function registerPlugins(app: App) {
  app
    .use(i18n)
    .use(router)
    .use(store)
    .use(blocknative)
    .use(vueQuery)
    .use(Web3Plugin)
    .use(VueVirtualScroller);
  return app;
}
