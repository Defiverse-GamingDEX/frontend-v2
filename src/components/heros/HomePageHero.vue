<script lang="ts" setup>
import AppHero from '@/components/heros/AppHero.vue';
import useFathom from '@/composables/useFathom';
import { EXTERNAL_LINKS } from '@/constants/links';
import useNetwork from '@/composables/useNetwork';
import Feature from '@/components/heros/Feature.vue';
import FooterHome from '@/components/footer/FooterHome.vue';
/**
 * COMPOSABLES
 */
const { trackGoal, Goals } = useFathom();

const { networkSlug } = useNetwork();

const list_app = [
  {
    text: 'Chain Colosseum Phoenix',
    link: '',
    iconUrl: '/images/home/pnx_icon.png',
    href: 'https://phoenix.chaincolosseum.org/',
  },
  { text: 'Coming soon', link: '' },
  { text: 'Coming soon', link: '' },
  { text: 'Coming soon', link: '' },
];
const list_features = [
  {
    iconUrl: '/images/home/weight-pool.png',
    title: `Weighted Pools`,
    description: `The weighted pools are highly versatile and customizable pools. These pools employ a weighted calculation and are best suited for general use with tokens that are not necessarily price correlated. (e.g. USDC/OAS). Unlike traditional AMM pools, which only offer a 50/50 weighting, Gaming DEX weighted pools enable users to create pools with varying token counts and weightings, such as 80/20 or 60/20/20 pools.`,
    href: 'https://docs.gaming-dex.com/product/pools/weight-pools',
  },
  {
    iconUrl: '/images/home/composable-pool.png',
    title: `Composable Stable Pools`,
    description: `Designed for assets expected to consistently swap at near parity or at a predetermined exchange rate, Composable Stable Pools employ Stable Math. This system, based on the principles of StableSwap popularized by Curve, allows for substantial swaps without significant price impact, greatly enhancing capital efficiency for similar and correlated asset swaps.`,
    href: 'https://docs.gaming-dex.com/product/pools/stable-pool',
  },
  {
    iconUrl: '/images/home/atf-field.png',
    title: `AT-Field`,
    description: `AT-Field only prevents the sale of traders. This will be done by limiting the sending of utility tokens to the SwapContract in the Gaming DEX so that users cannot swap utility tokens for other tokens in excess of the amount earned by playing the game (obtained by the Oracle).`,
    href: 'https://docs.gaming-dex.com/product/anti-trader-field-at-field',
  },
  {
    iconUrl: '/images/home/multi-gems-swap.png',
    title: `MultiGemSwap`,
    description: `”MultiGemSwap” is a system that ensures liquidity for “gems” across blockchain games. While traditional social games allowed gems to be used only within a specific game, this system enables the exchange of gems between different games. Even gems left unused after quitting a game can now be utilized in another, enhancing both the gaming experience and investment efficiency`,
    href: 'https://docs.gaming-dex.com/product/multigemswap',
  },
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
          classCustom="outline-3"
          tag="router-link"
          :to="{ name: 'list-pool', params: { networkSlug } }"
        >
          {{ $t('explorePools') }}
        </BalBtn>
        <!-- <BalBtn
          class="mr-4"
          tag="router-link"
          :to="{ name: 'pool', params: { networkSlug } }"
          target="_blank"
          rel="noreferrer"
          classCustom="outline-3"
          @click="trackGoal(Goals.ClickPoolsTableRow)"
        >
          {{ $t('explorePools') }}
        </BalBtn> -->
        <!-- <BalBtn
          tag="a"
          :href="EXTERNAL_LINKS.Balancer.Build"
          target="_blank"
          rel="noreferrer"
          classCustom="gray-blue"
          @click="trackGoal(Goals.ClickHeroLearnMore)"
        >
          {{ $t('startBuilding') }}
        </BalBtn> -->
      </div>
    </AppHero>

    <div class="list-app">
      <div v-for="i in list_app" :key="i.link" class="item-app">
        <a :href="i.href" target="_blank">
          <div class="icon">
            <div v-if="i.iconUrl" class="app-icon">
              <img alt="" :src="i.iconUrl" />
            </div>
            <div v-else class="empty-icon">
              <img alt="" src="/images/home/coming-soon.png" />
            </div>
          </div>
          <div class="text">{{ i.text }}</div>
          <div v-if="i.link" class="link">
            <BalLink
              :href="`https://${i.link}`"
              target="_blank"
              external
              noStyle
            >
              {{ i.link }}
            </BalLink>
          </div>
        </a>
      </div>
    </div>
    <div class="features-container">
      <div class="features-title">Key feature</div>
      <div class="features-items">
        <Feature :feature="list_features[0]" />
      </div>
    </div>
    <div class="bacnground-ground-map">
      <Feature :feature="list_features[1]" />
      <div class="features-title original">Original feature</div>
    </div>
    <div class="bacnground-hell-map">
      <div class="features-items">
        <Feature :feature="list_features[2]" class="mb-8" />
        <Feature :feature="list_features[3]" />
      </div>

      <div class="footer-home">
        <FooterHome />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.headline {
  @apply text-white text-center text-4xl md:text-5xl pb-2 font-bold;
}

.headline.headline-next {
  color: #ffc250;
}

.home-hero {
  background-image: url('/images/backgrounds/bg-min-new.png');
  background-repeat: no-repeat;
  background-position-y: -600px;
  background-size: 100% 2000px;
  min-height: calc(100vh - 3rem);
}

.footer-home {
  width: 100%;
  margin-top: 260px;
  background: #2e0704c4;
  @media (max-width: 1024px) {
    margin-top: 120px;
  }
}
.features-title {
  font-size: 44px;
  line-height: 53px;
  font-weight: bold;
  margin-bottom: 80px;
  color: #fff;
  &.original {
    margin-top: 114px;
  }
}
.features-items {
  @media (max-width: 1024px) {
    padding: 0px 16px;
  }
}
.bacnground-ground-map {
  background: #013347;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 36px;
  @media (max-width: 1024px) {
    padding: 16px;
  }
}
.bacnground-hell-map {
  background-image: url('/images/backgrounds/foot-min.png');
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-size: cover;
  margin-top: -1px;
}
.features-container {
  margin-top: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 1024px) {
    margin-top: 120px;
  }
}
.list-app {
  @apply m-16 max-w-4xl mx-auto flex flex-wrap;
}

.item-app {
  @apply w-1/4 px-6 text-center;
  &:hover {
    opacity: 0.9;
  }
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
  .app-icon {
    > img {
      width: 100%;
    }
  }
  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    > img {
      width: 50%;
    }
  }
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
    background-size: cover;
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
