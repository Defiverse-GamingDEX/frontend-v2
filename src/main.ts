import '@/assets/css/index.css';
import '@/assets/css/tailwind.css';
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css';

import { registerPlugins } from '@/plugins';
import registerDirectives from '@/plugins/directives';
import initSentry from '@/plugins/sentry';
import '@/plugins/singularity';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import mitt from 'mitt';
import { createApp } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
import Root from './Root.vue';
import { initDependencies } from './dependencies';
const emitter = mitt();
window.emitter = emitter;
console.log(window.emitter, 'window.emitter');
initDependencies();

echarts.use([
  TooltipComponent,
  CanvasRenderer,
  LineChart,
  GridComponent,
  LegendComponent,
  BarChart,
  PieChart,
]);

const app = createApp(Root);

app.component('Jazzicon', Jazzicon);

registerPlugins(app);
registerDirectives(app);
initSentry(app);
app.mount('#app');

export default app;
