<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import { EXTERNAL_LINKS } from '@/constants/links';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    const protocols = [
      {
        id: 'Valhalla',
        name: 'Valhalla: Perp',
        imgSrc: '/images/banners/valhalla.webp',
      },
      {
        id: 'Euphoria',
        name: 'Euhoria: Derivative',
        imgSrc: '/images/banners/euphoria.png',
      },
      { id: 'Cap', name: 'Cap: Stablecoin', imgSrc: '/images/banners/cap.png' },
      { id: 'Avon', name: 'Avon: Lending', imgSrc: '/images/banners/avon.png' },
      {
        id: 'Blackhaven',
        name: 'Blackhaven: Lending',
        imgSrc: '/images/banners/blackhaven.png',
      },
      {
        id: 'HelloTrade',
        name: 'Hellotrade: RWA',
        imgSrc: '/images/banners/hellotrade.png',
      },
    ];

    return {
      EXTERNAL_LINKS,
      t,
      protocols,
    };
  },
});
</script>

<template>
  <div v-once class="featured-protocols">
    <h3 class="mb-4 text-white">
      {{ $t('featuredProtocols.title') }}
    </h3>
    <div class="flex flex-wrap justify-center -mx-2">
      <!--
      <div class="col-span-12 xs:col-span-6 lg:col-span-3">
        <BalCard
          title="Element Finance"
          imgSrc="/images/banners/element.jpg"
          class="hover:shadow-xl transition-shadow"
          hFull
          growContent
        >
          <p>
            {{ $t('featuredProtocols.Element') }}
          </p>
          <template #footer>
            <BalLink :href="EXTERNAL_LINKS.Element.Home" external>
              <span>{{ $t('learnMore') }}</span>
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="relative top-0.5 ml-0.5"
              />
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div class="col-span-12 xs:col-span-6 lg:col-span-3">
        <BalCard
          title="Fjord Foundry"
          imgSrc="/images/banners/fjord.png"
          class="hover:shadow-xl transition-shadow"
          hFull
          growContent
        >
          <p>{{ $t('featuredProtocols.Copper') }}</p>
          <template #footer>
            <BalLink :href="EXTERNAL_LINKS.Copper.Home" external>
              <span>{{ $t('learnMore') }}</span>
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="relative top-0.5 ml-0.5"
              />
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div class="col-span-12 xs:col-span-6 lg:col-span-3">
        <BalCard
          title="Mycelium"
          imgSrc="/images/banners/mycelium.jpg"
          class="hover:shadow-xl transition-shadow"
          hFull
          growContent
        >
          <div>
            <p>{{ $t('featuredProtocols.Tracer') }}</p>
          </div>
          <template #footer>
            <BalLink :href="EXTERNAL_LINKS.Tracer.Home" external>
              <span>{{ $t('learnMore') }}</span>
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="relative top-0.5 ml-0.5"
              />
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div class="col-span-12 xs:col-span-6 lg:col-span-3">
        <BalCard
          title="Sense Finance"
          imgSrc="/images/banners/sense.png"
          class="hover:shadow-xl transition-shadow"
          hFull
          growContent
        >
          <div>
            <p>{{ $t('featuredProtocols.Sense') }}</p>
          </div>
          <template #footer>
            <BalLink :href="EXTERNAL_LINKS.Sense.Home" external>
              <span>{{ $t('learnMore') }}</span>
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="relative top-0.5 ml-0.5"
              />
            </BalLink>
          </template>
        </BalCard>
      </div>
      -->

      <div
        v-for="protocol in protocols"
        :key="protocol.id"
        class="px-2 mb-4 w-full xs:w-1/2 lg:w-3/12"
      >
        <BalCard
          :title="protocol.name"
          :imgSrc="protocol.imgSrc"
          class="hover:shadow-xl transition-shadow"
          hFull
          growContent
          imgFit="contain"
        >
          <div>
            <p>{{ t(`featuredProtocols.${protocol.id}`) }}</p>
          </div>
          <template #footer>
            <BalLink :href="EXTERNAL_LINKS[protocol.id].Home" external>
              <span>{{ t('learnMore') }}</span>
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="relative top-0.5 ml-0.5"
              />
            </BalLink>
          </template>
        </BalCard>
      </div>
    </div>
  </div>
</template>
<style scoped>
:deep(.card-container) {
  justify-content: space-between;
  height: 100%;
}

.featured-protocols :deep(.feature) {
  height: 8rem;
  object-fit: contain;
  width: 100%;
}
</style>
