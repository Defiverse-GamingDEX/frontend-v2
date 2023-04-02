<script lang="ts" setup>
import AppHero from '@/components/heros/AppHero.vue';
import useFathom from '@/composables/useFathom';
import { EXTERNAL_LINKS } from '@/constants/links';

/**
 * COMPOSABLES
 */
const { trackGoal, Goals } = useFathom();

const list_app = [
  { text: 'Balancer app', link: 'app.balancer.fi' },
  { text: 'Beethoven X', link: 'op.beets.fi' },
  { text: 'Aura', link: 'aura.finance' },
  { text: 'Element', link: 'element.fi' },
];
</script>

<template>
  <div class="home-hero">
    <AppHero class="h-64">
      <h1 class="headline" v-text="$t('defiLiquidityHome')" />
      <p class="headline headline-next" v-text="$t('applications')" />

      <div class="flex justify-center mt-6">
        <BalBtn
          class="mr-4"
          tag="a"
          :href="EXTERNAL_LINKS.Balancer.Home"
          target="_blank"
          rel="noreferrer"
          classCustom="outline-3"
          @click="trackGoal(Goals.ClickHeroLearnMore)"
        >
          {{ $t('explorePools') }}
        </BalBtn>
        <BalBtn
          tag="a"
          :href="EXTERNAL_LINKS.Balancer.Build"
          target="_blank"
          rel="noreferrer"
          classCustom="gray-blue"
          @click="trackGoal(Goals.ClickHeroLearnMore)"
        >
          {{ $t('startBuilding') }}
        </BalBtn>
      </div>
    </AppHero>

    <div class="list-app">
      <div v-for="i in list_app" :key="i.link" class="item-app">
        <div class="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48.937"
            height="49.008"
            viewBox="0 0 48.937 49.008"
          >
            <g
              id="Group_543"
              data-name="Group 543"
              transform="translate(-1578.238 -1597.159)"
            >
              <path
                id="Path_89"
                data-name="Path 89"
                d="M1602.707,1597.159c-14.178,0-24.469,4.786-24.469,11.378s10.29,11.377,24.469,11.377,24.468-4.784,24.468-11.377S1616.884,1597.159,1602.707,1597.159Zm14.3,15.658a41.4,41.4,0,0,1-14.3,2.3c-11.827,0-19.674-3.962-19.674-6.582,0-1.375,2.057-3.016,5.37-4.281a41.394,41.394,0,0,1,14.3-2.3c11.827,0,19.673,3.962,19.673,6.583C1622.38,1609.912,1620.323,1611.552,1617.011,1612.817Z"
                transform="translate(0)"
                fill="currentColor"
              />
              <path
                id="Path_90"
                data-name="Path 90"
                d="M1627.025,1630.123a2.375,2.375,0,0,0-3.514-1.526l-.016.01a2.407,2.407,0,0,0-1.144,2.575,1.392,1.392,0,0,1,.03.283c0,1.375-2.058,3.015-5.369,4.28a41.4,41.4,0,0,1-14.3,2.3c-11.827,0-19.674-3.962-19.674-6.582a1.44,1.44,0,0,1,.029-.282,2.417,2.417,0,0,0-1.174-2.594,2.376,2.376,0,0,0-3.5,1.534,6.124,6.124,0,0,0-.15,1.343c0,6.592,10.29,11.377,24.469,11.377s24.468-4.784,24.468-11.377A6.1,6.1,0,0,0,1627.025,1630.123Z"
                transform="translate(0 -9.802)"
                fill="currentColor"
              />
              <path
                id="Path_91"
                data-name="Path 91"
                d="M1627.025,1649.287a2.375,2.375,0,0,0-3.514-1.526l-.016.01a2.406,2.406,0,0,0-1.144,2.575,1.392,1.392,0,0,1,.03.283c0,1.375-2.058,3.015-5.369,4.28a41.391,41.391,0,0,1-14.3,2.3c-11.827,0-19.674-3.962-19.674-6.583a1.438,1.438,0,0,1,.029-.282,2.417,2.417,0,0,0-1.174-2.594,2.376,2.376,0,0,0-3.5,1.533,6.126,6.126,0,0,0-.15,1.343c0,6.593,10.29,11.377,24.469,11.377s24.468-4.785,24.468-11.377A6.1,6.1,0,0,0,1627.025,1649.287Z"
                transform="translate(0 -15.84)"
                fill="currentColor"
              />
            </g>
          </svg>
        </div>
        <div class="text">{{ i.text }}</div>
        <div class="link">
          <BalLink :href="`https://${i.link}`" target="_blank" external noStyle>
            {{ i.link }}
          </BalLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.headline {
  @apply text-white text-center text-4xl md:text-5xl pb-2 font-bold;
}

.headline.headline-next {
  color: #ffc250;
}

.home-hero {
  background-image: url('/images/backgrounds/bg2-min.png');
  background-repeat: no-repeat;
  background-position: bottom;
  background-size: 100% 100%;
  padding-bottom: 12vw;
  min-height: calc(100vh - 3rem);
}

.list-app {
  @apply m-16 max-w-4xl mx-auto flex flex-wrap;
}

.item-app {
  @apply w-1/4 px-6 text-center;
}

.item-app .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 80%) 0% 0% no-repeat padding-box;
  border-radius: 50%;
  width: 10rem;
  height: 10rem;
  margin: auto;
  margin-bottom: 1rem;
}

.item-app .text {
  @apply text-lg text-primary-100;
}

.item-app .link {
  color: #2382af;
  @apply text-sm mt-1;
}
@media (max-width: 1024px) {
  .home-hero {
    min-height: 0;
    background-size: contain;
  }

  .item-app .icon {
    width: 8rem;
    height: 8rem;
  }
}
@media (max-width: 767px) {
  .list-app {
    @apply m-6;
  }

  .item-app {
    @apply w-1/2 py-3;
  }
}
</style>
