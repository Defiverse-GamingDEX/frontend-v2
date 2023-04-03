<script lang="ts" setup>
const list = [
  {
    content:
      'Balancer is the epitome of technical excellence and innovation in the DeFi space. Balancer V2 is another testimony of continued effort to innovate through clever design. DeFiance Capital is proud to support Balancer in this exciting journey.',
    img: '/images/home/mask.png',
    author: 'Arthur_0x DeFiance Capital',
  },
  {
    content:
      'The most informed see the writing on the wall for how integral Balancer is becoming to DeFi liquidity. It is beloved by builders for allowing them to build a vast array of liquidity pools to solve pressing problems. Over time, it will find itself at the center of more & more pivotal liquidity experiments.',
    img: '/images/home/mask.png',
    author: 'Arthur_0x DeFiance Capital',
  },
  {
    content:
      'Balancer’s thoughtful architecture enables a wide range of innovative liquidity strategies. No other exchange or asset management protocol provides as much flexibility for builders.',
    img: '/images/home/mask.png',
    author: 'Arthur_0x DeFiance Capital',
  },
];
</script>

<template>
  <div class="study-home">
    <div class="study-home-content">
      <!--  -->
      <div class="study-home-content__case">
        <div class="flex flex-col justify-between left">
          <div class="text-xs tag-title">CASE STUDY</div>
          <div class="mt-4 text-4xl title">AAVE</div>
          <div class="mt-4 text-sm content">
            <p>
              Aave and Balancer have a long history of working together to bring
              capital efficiency and value to both communities. This includes
              Aave launching their 80/20 AAVE/ETH Safety Incentive pool on
              Balancer and the recent Boosted Pool integration.
            </p>
            <p class="mt-3">
              The DAOs recently completed a token swap to further align the
              interests of both communities.
            </p>
          </div>
        </div>
        <div class="right">
          <img class="w-16 h-16 rounded-full" src="/images/home/mask.png" />
          <div class="mt-4 text-sm content">
            <p>
              “Part of what makes DeFi so exciting is its composability, and
              with Balancer this has resulted in a partnership that optimises
              the experience for liquidity providers through the use of Balancer
              Aave Boosted Pools and opens up new possibilities for Aave stakers
              with the AAVE/ETH Safety Incentive pool. We look forward to
              exploring more synergies with Balancer in the future.”
            </p>
            <p class="mt-3">Stani Kulechov</p>
            <p>Founder and CEO of Aave</p>
          </div>
        </div>
      </div>
      <!--  -->

      <div class="study-home-content__list">
        <div v-for="(i, idx) in list" :key="idx" class="item">
          <div class="text-sm content">{{ i.content }}</div>
          <div class="flex items-center mt-10 author">
            <img class="w-16 h-16 rounded-full" :src="i.img" />
            <div class="mr-8 ml-4 text-sm">{{ i.author }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.study-home {
  @apply bg-white;
}

.study-home-content {
  @apply max-w-4xl mx-auto relative pt-72;
}

.study-home-content__case {
  background: transparent linear-gradient(103deg, #7ed6ff 0%, #95c476 100%) 0%
    0% no-repeat padding-box;
  border-radius: 25px;
  @apply text-white py-10 px-2 flex flex-wrap absolute -top-28;
}

.study-home-content__case .left,
.study-home-content__case .right {
  @apply w-1/2 px-8;
}

.study-home-content__list {
  @apply flex flex-wrap pb-24 text-primary-100;
}

.study-home-content__list .item {
  @apply w-1/3 px-8 flex flex-col	justify-between;
}

@media screen and (max-width: 992px) {
  .study-home-content {
    @apply px-4 pt-6;
  }

  .study-home-content__case {
    @apply static;
  }

  .study-home-content__list {
    @apply pt-4;
  }
}
@media screen and (max-width: 600px) {
  .study-home-content__case {
    @apply flex-col p-4 pb-8;
  }

  .study-home-content__case .left,
  .study-home-content__case .right {
    @apply w-full px-4 mt-4;
  }

  .study-home-content__list {
    @apply pb-10;
  }

  .study-home-content__list .item {
    @apply w-full border rounded-lg	py-4 mt-4;
  }

  .study-home-content__list .item .author {
    @apply mt-4;
  }
}
</style>
