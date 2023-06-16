<script lang="ts" setup>
const list = [
  {
    content: `The weighted pools are highly versatile and customizable pools. These pools employ a weighted calculation and are best suited for general use with tokens that are not necessarily price correlated. (e.g. USDC/OAS). 
Unlike traditional AMM pools, which only offer a 50/50 weighting, Gaming DEX weighted pools enable users to create pools with varying token counts and weightings, such as 80/20 or 60/20/20 pools.`,
    img: '',
    author: 'Weighted Pools',
  },
  {
    content: `AT-Field only prevents the sale of traders. This will be done by limiting the sending of utility tokens to the SwapContract in the Gaming DEX so that users cannot swap utility tokens for other tokens in excess of the amount earned by playing the game (obtained by the Oracle).`,
    img: '',
    author: 'AT-Field',
  },
  {
    content: `The native token of both DeFi Verse and Gaming DEX, DFV, encompasses various utilities. DFV serves as the DeFi Verse's gas and base currency, while also being utilized as incentives for providing liquidity. Adjustments to incentives for specific pools are made through a voting system known as veDFV. Protocol revenue distributions are also carried out via veDFV, which is used for various other forms of governance voting. Furthermore, it plays a role in boosting rewards for liquidity providers through something called incentive boosts.`,
    img: '',
    author: 'DFV Token',
  },
];
</script>

<template>
  <div class="study-home">
    <div class="study-home-content">
      <!--  -->
      <div class="study-home-content__case">
        <div class="flex flex-col justify-between left">
          <div class="text-xs tag-title">About</div>
          <div class="mt-4 text-4xl title">Gaming DEX</div>
          <div class="mt-4 text-sm content">
            <p>
              Gaming DEX, based on the Balancer DEX, is a DeFi protocol
              developed for the Oasys Layer 2 blockchain, offering increased
              token liquidity for blockchain games. Designed with intuitive
              UI/UX and features like "Flexible Pools" and "Anti-Trader Field",
              it simplifies DeFi interactions for average gamers. It also
              facilitates prepaid payment tokens for each game on Oasys,
              creating a more fluid user experience and reducing costs.
              Furthermore, Gaming DEX is crucial for converting prepaid tokens
              back to fiat currency. By allowing exchange of in-game currencies,
              Gaming DEX converts in-game data into transferable assets across
              different games, necessitating a trading platform like DEX.
            </p>
          </div>
        </div>
        <!-- <div class="right">
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
        </div> -->
      </div>
      <!--  -->

      <div class="study-home-content__list">
        <div v-for="(i, idx) in list" :key="idx" class="item">
          <div class="text-sm content">{{ i.content }}</div>
          <div class="flex items-center author">
            <!-- <img class="w-16 h-16 rounded-full" :src="i.img" /> -->
            <div class="mt-4 text-xl font-bold">{{ i.author }}</div>
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
  @apply px-8;
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
