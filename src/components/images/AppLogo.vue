<script lang="ts" setup>
import { computed } from 'vue';

import useDarkMode from '@/composables/useDarkMode';
import useTailwind from '@/composables/useTailwind';

/**
 * TYPES
 */
type Props = {
  forceDark?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  forceDark: false,
});

/**
 * COMPOSABLES
 */
const { darkMode } = useDarkMode();
const tailwind = useTailwind();

/**
 * COMPUTED
 */
const fillColor = computed(() => {
  if (props.forceDark) return tailwind.theme.colors.white;

  return darkMode.value
    ? tailwind.theme.colors.white
    : tailwind.theme.colors.gray['900'];
});
</script>

<template>
  <div class="flex items-center sm:mr-4 app-logo">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="202.399"
      height="38.501"
      viewBox="0 0 202.399 38.501"
    >
      <g
        id="Group_562"
        data-name="Group 562"
        transform="translate(-883.129 -2369.996)"
      >
        <path
          id="Path_185"
          data-name="Path 185"
          d="M1079.95,2408.316a5.483,5.483,0,0,1-3.076-.933,5.567,5.567,0,0,1-2-2.406l-2.171,2.17-4.432-4.431-4.432,4.432-2.17-2.17a5.522,5.522,0,0,1-5.076,3.337,5.531,5.531,0,0,1-2.2-10.611l-2.171-2.171,5.332-5.33-6.54-5.473,1.025-9.86,9.859-1.024,6.372,7.613,6.371-7.613,9.86,1.024,1.024,9.86-6.539,5.472,5.33,5.331-2.17,2.171a5.516,5.516,0,0,1,3.316,5.56,5.544,5.544,0,0,1-2.356,4.064,5.478,5.478,0,0,1-3.158.988Z"
        />
        <path
          id="Path_186"
          data-name="Path 186"
          d="M1079.95,2404.466a5.481,5.481,0,0,1-3.076-.933,5.563,5.563,0,0,1-2-2.405l-2.171,2.17-4.432-4.431-4.432,4.431-2.17-2.17a5.525,5.525,0,0,1-5.076,3.338,5.532,5.532,0,0,1-2.2-10.612l-2.171-2.171,5.332-5.33-6.54-5.473,1.025-9.86L1061.9,2370l6.372,7.613,6.371-7.613,9.86,1.024,1.024,9.86-6.539,5.473,5.33,5.33-2.17,2.171a5.517,5.517,0,0,1,3.316,5.561,5.54,5.54,0,0,1-2.356,4.063,5.48,5.48,0,0,1-3.158.988Z"
        />
        <path
          id="Path_187"
          data-name="Path 187"
          d="M890.473,2408.5l-7.344-7.354V2381.4l7.343-7.367,16.9.013V2408.5Z"
        />
        <path
          id="Path_188"
          data-name="Path 188"
          d="M987.823,2408.5l-7.345-7.354V2381.4l7.343-7.367,16.9.013V2408.5Z"
        />
        <rect
          id="Rectangle_65"
          data-name="Rectangle 65"
          width="14.035"
          height="34.449"
          transform="translate(949.818 2374.048)"
        />
        <path
          id="Path_189"
          data-name="Path 189"
          d="M939.61,2408.5V2396.4l-.639.547-.639-.547V2408.5H924.3v-34.449h11.944l2.73,3.119,2.729-3.119h11.944V2408.5Z"
        />
        <rect
          id="Rectangle_66"
          data-name="Rectangle 66"
          width="24.242"
          height="34.449"
          transform="translate(960.064 2374.048)"
        />
        <path
          id="Path_190"
          data-name="Path 190"
          d="M903.714,2408.5V2381.41l7.344-7.365,16.9.013,0,34.439Z"
        />
        <path
          id="Path_191"
          data-name="Path 191"
          d="M890.473,2405.4l-7.344-7.354V2378.3l7.343-7.368,16.9.013V2405.4Z"
        />
        <path
          id="Path_192"
          data-name="Path 192"
          d="M886.956,2379.886v16.574l5.1,5.11h11.483V2386.26h-3.828l-5.1,5.1h2.552v3.828h-2.552l-1.276-1.276v-11.483l1.276-1.278h8.931v-6.379l-11.483-.009Z"
          fill="#fff"
        />
        <path
          id="Path_193"
          data-name="Path 193"
          d="M987.823,2405.4l-7.345-7.354V2378.3l7.343-7.368,16.9.013V2405.4Z"
        />
        <path
          id="Path_194"
          data-name="Path 194"
          d="M984.306,2379.886v16.574l5.1,5.11h11.483V2386.26h-3.828l-5.1,5.1h2.552v3.828h-2.552l-1.276-1.276v-11.483l1.276-1.278h8.931v-6.379l-11.483-.009Z"
          fill="#fff"
        />
        <rect
          id="Rectangle_67"
          data-name="Rectangle 67"
          width="14.035"
          height="34.449"
          transform="translate(949.818 2370.949)"
        />
        <path
          id="Path_195"
          data-name="Path 195"
          d="M953.645,2395.191v6.38h6.38v-26.794h-6.38Z"
          fill="#fff"
        />
        <path
          id="Path_196"
          data-name="Path 196"
          d="M939.61,2405.4v-12.093l-.639.547-.639-.547V2405.4H924.3v-34.449h11.944l2.73,3.119,2.729-3.119h11.944V2405.4Z"
        />
        <path
          id="Path_197"
          data-name="Path 197"
          d="M938.972,2379.88l-4.467-5.1h-6.38v26.794h6.38v-16.587l4.466,3.828,4.466-3.828v16.587h6.38v-26.794h-6.38Z"
          fill="#fff"
        />
        <rect
          id="Rectangle_68"
          data-name="Rectangle 68"
          width="24.242"
          height="34.449"
          transform="translate(960.064 2370.949)"
        />
        <path
          id="Path_198"
          data-name="Path 198"
          d="M974.1,2382.432l-3.828-3.828v-3.828h-6.38v26.794h6.38v-14.035l3.828,3.828v10.207h6.38v-26.794H974.1Z"
          fill="#fff"
        />
        <path
          id="Path_199"
          data-name="Path 199"
          d="M903.714,2405.4v-27.087l7.344-7.365,16.9.013,0,34.44Z"
        />
        <path
          id="Path_200"
          data-name="Path 200"
          d="M907.542,2379.893v21.677h6.379v-8.928h3.826v8.928h6.38v-26.787l-11.483-.009Z"
          fill="#fff"
        />
        <path
          id="Path_201"
          data-name="Path 201"
          d="M913.983,2391.113a2.426,2.426,0,0,1-2.423-2.422v-.8h-.8a2.426,2.426,0,0,1-2.422-2.423v-3.706a2.425,2.425,0,0,1,2.422-2.422h.8v-.8a2.426,2.426,0,0,1,2.423-2.423h3.706a2.426,2.426,0,0,1,2.423,2.423v.8h.8a2.425,2.425,0,0,1,2.423,2.422v3.706a2.426,2.426,0,0,1-2.423,2.423h-.8v.8a2.426,2.426,0,0,1-2.423,2.422Z"
        />
        <path
          id="Path_202"
          data-name="Path 202"
          d="M921.338,2381.828v3.58a.6.6,0,0,1-.6.6h-2.505v2.505a.6.6,0,0,1-.6.6h-3.579a.6.6,0,0,1-.6-.6v-2.505h-2.5a.6.6,0,0,1-.605-.6v-3.58a.6.6,0,0,1,.605-.6h2.5v-2.5a.6.6,0,0,1,.6-.6h3.58a.6.6,0,0,1,.6.6v2.5h2.505A.6.6,0,0,1,921.338,2381.828Z"
          fill="#ff6d00"
        />
        <path
          id="Path_203"
          data-name="Path 203"
          d="M1009.8,2408.5v-34.449h16.9l7.346,7.346v19.743l-7.343,7.361Z"
        />
        <path
          id="Path_204"
          data-name="Path 204"
          d="M1009.8,2405.4v-34.449h16.9l7.346,7.346v19.742l-7.343,7.361Z"
        />
        <path
          id="Path_205"
          data-name="Path 205"
          d="M1013.627,2374.777v26.793h11.483l5.1-5.116V2379.88l-5.1-5.1Zm10.2,19.165-1.251,1.249h-2.573v-14.035h2.568l1.256,1.257Z"
          fill="#fff"
        />
        <path
          id="Path_206"
          data-name="Path 206"
          d="M1037.659,2408.405l-7.445-7.454v-19.883l7.444-7.469,17.142.013v34.793Z"
        />
        <path
          id="Path_207"
          data-name="Path 207"
          d="M1037.659,2405.57l-7.445-7.454v-19.883l7.444-7.469,17.142.013v34.793Z"
        />
        <path
          id="Path_208"
          data-name="Path 208"
          d="M1041.869,2381.154h8.931v-6.38l-11.483-.009-5.1,5.121v16.574l5.1,5.11H1050.8v-6.379h-8.931l-1.276-1.276v-2.623h9.073v-6.379h-9.073v-2.481Z"
          fill="#fff"
        />
        <path
          id="Path_209"
          data-name="Path 209"
          d="M1055.224,2373.875l-.589,5.672,18.057,15.111,1.294.411,4.146,4.146,2.431-2.431-4.146-4.146-.411-1.294-15.111-18.057Z"
          fill="#bcbcbc"
        />
        <path
          id="Path_210"
          data-name="Path 210"
          d="M1055.224,2373.875l-.589,5.672,18.057,15.111,1.294.411,4.146,4.146,1.216-1.216Z"
          fill="#e0e0e0"
        />
        <path
          id="Path_211"
          data-name="Path 211"
          d="M1080.217,2391.683l-1.92-1.919-7.183,7.183,1.92,1.92,1.994-1.995a.539.539,0,0,1,.763,0l2.091,2.091a2.405,2.405,0,1,0,2.517-2.423l-2.138-2.138a.539.539,0,0,1,0-.763Zm.7,7.887a.9.9,0,1,1,0-1.279A.9.9,0,0,1,1080.92,2399.57Z"
          fill="#ff6d00"
        />
        <path
          id="Path_212"
          data-name="Path 212"
          d="M1053.81,2396.783l5.215-5.215.382-1.206,16.047-19.176,8.345.867.867,8.345-19.176,16.047-1.206.383-5.215,5.215Z"
        />
        <path
          id="Path_213"
          data-name="Path 213"
          d="M1081.979,2373.875l-5.672-.589-15.111,18.057-.411,1.294-4.146,4.146,2.431,2.431,4.146-4.146,1.294-.411,18.057-15.111Z"
          fill="#bcbcbc"
        />
        <path
          id="Path_214"
          data-name="Path 214"
          d="M1081.979,2373.875l-5.672-.589-15.111,18.057-.411,1.294-4.146,4.146,1.216,1.216Z"
          fill="#e0e0e0"
        />
        <path
          id="Path_215"
          data-name="Path 215"
          d="M1064.169,2398.867l1.92-1.92-7.183-7.183-1.92,1.919,1.995,1.995a.539.539,0,0,1,0,.763l-2.091,2.091a2.405,2.405,0,1,0,2.423,2.517l2.138-2.138a.539.539,0,0,1,.763,0Zm-7.886.7a.9.9,0,1,1,1.279,0A.9.9,0,0,1,1056.283,2399.57Z"
          fill="#ff6d00"
        />
        <line
          id="Line_1"
          data-name="Line 1"
          x2="3.963"
          transform="translate(1057.604 2378.379)"
          fill="none"
          stroke="#fff"
          stroke-linecap="round"
          stroke-width="1"
        />
        <line
          id="Line_2"
          data-name="Line 2"
          y2="7.198"
          transform="translate(1059.587 2374.782)"
          fill="none"
          stroke="#fff"
          stroke-linecap="round"
          stroke-width="1"
        />
        <line
          id="Line_3"
          data-name="Line 3"
          x2="3.963"
          transform="translate(1075.412 2378.379)"
          fill="none"
          stroke="#fff"
          stroke-linecap="round"
          stroke-width="1"
        />
        <line
          id="Line_4"
          data-name="Line 4"
          y2="7.198"
          transform="translate(1077.395 2374.782)"
          fill="none"
          stroke="#fff"
          stroke-linecap="round"
          stroke-width="1"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.app-logo :deep(.logotype) {
  @apply origin-top-left relative;

  transform: scale(1.1);
}

.svg-path {
  transition: fill 0.2s ease-out;
}

.logo-svg:hover .svg-path {
  fill: theme('colors.purple.700');
}

.dark .logo-svg:hover .svg-path {
  fill: theme('colors.yellow.500');
}
</style>
