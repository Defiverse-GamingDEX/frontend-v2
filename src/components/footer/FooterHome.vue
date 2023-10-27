<template>
  <footer v-once>
    <div
      class="xl:container lg:px-4 xl:mx-auto dark:border-t dark:border-gray-800"
    >
      <div class="flex md:flex-row flex-wrap py-12 px-4 lg:px-0 list-footer">
        <!-- nav link -->
        <div class="md:hidden item">
          <p v-for="i in link_nav" :key="i.text">
            <router-link
              class="text-lg font-medium link"
              :to="{ name: i.name_link, params: { networkSlug } }"
            >
              {{ $t(i.text) }}
            </router-link>
          </p>
        </div>
        <!-- nav link -->

        <!-- links -->
        <div
          v-for="(i, idx) in links"
          :key="idx"
          class="item"
          :class="{ 'w-40': idx === links.length - 1 }"
        >
          <div class="label">{{ i.label }}</div>
          <p v-for="j in i.childs" :key="j.link">
            <BalLink :href="j.link" external noStyle class="link">
              {{ j.text }}
            </BalLink>
          </p>
        </div>
        <!-- /links -->

        <!-- Community -->
        <div class="item">
          <div class="label">Community</div>
          <div class="flex flex-wrap gap-3">
            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Twitter"
              external
              noStyle
            >
              <IconTwitter />
            </BalLink>
            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Discord"
              external
              noStyle
            >
              <IconDiscord />
            </BalLink>
            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Medium"
              external
              noStyle
            >
              <IconMedium />
            </BalLink>
            <!-- <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Youtube"
              external
              noStyle
            >
              <IconYoutube />
            </BalLink> -->
            <!-- <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Github"
              external
              noStyle
            >
              <IconGithub />
            </BalLink> -->
            <!-- <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Linkedin"
              external
              noStyle
            >
              <IconLinkedin />
            </BalLink> -->
            <!-- <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Mail"
              external
              noStyle
            >
              <IconMail />
            </BalLink> -->
          </div>
        </div>
        <!-- /Community -->
      </div>
    </div>
  </footer>
</template>

<script>
import { useI18n } from 'vue-i18n';

import { isThirdPartyServicesModalVisible } from '@/App.vue';
import IconDiscord from '@/components/icons/IconDiscord.vue';
import IconGithub from '@/components/icons/IconGithub.vue';

import IconMedium from '@/components/icons/IconMedium.vue';
import IconTwitter from '@/components/icons/IconTwitter.vue';

import { EXTERNAL_LINKS } from '@/constants/links';
import { NAV_LINKS } from '@/constants/navLinks';

import useNetwork from '@/composables/useNetwork';

export default {
  components: {
    IconTwitter,
    IconDiscord,
    IconMedium,
    IconGithub,
  },
  setup() {
    const { t } = useI18n();
    const { networkSlug } = useNetwork();

    return {
      EXTERNAL_LINKS,
      t,
      networkSlug,
      isThirdPartyServicesModalVisible,
      link_nav: NAV_LINKS,

      links: [
        {
          label: 'dex.defiverse.net',
          childs: [
            {
              text: 'Home',
              link: 'https://dex.defiverse.net/#/',
            },
          ],
        },
        {
          label: 'Infrastructure',
          childs: [
            {
              text: 'Explore pools',
              link: 'https://dex.defiverse.net/#/defiverse/pool',
            },
            {
              text: 'Vote with veDFV',
              link: 'https://dex.defiverse.net/#/defiverse/vedfv',
            },
            {
              text: 'Claim incentives',
              link: 'https://dex.defiverse.net/#/defiverse/claim',
            },
          ],
        },
        {
          label: 'Learn',
          childs: [
            {
              text: 'Documentation',
              link: 'https://docs.gaming-dex.com/',
            },

            // {
            //   text: 'Whitepaper',
            //   link: 'https://docs.gaming-dex.com/',
            // },
          ],
        },
      ],
    };
  },
};
</script>

<style scoped>
footer {
  @apply bg-primary-800 dark:bg-gray-900;
}

footer :deep(.logotype) {
  @apply origin-top-left;

  transform: scale(1.5);
}

.link {
  @apply text-white font-semibold mb-3 dark:text-white transition-colors flex items-center no-underline hover:text-gray-600;
}

.link--external {
  @apply text-sm;
}

.link:hover,
.link:focus-visible {
  @apply text-gray-600 dark:text-yellow-500 no-underline;
}

.link:focus:not(:focus-visible) {
  outline: none;
}

.router-link-active {
  @apply text-blue-600 dark:text-blue-400;
}

.list-footer .item {
  @apply w-1/5;
}
.list-footer .item.w-40 {
  width: 40%;
}

.list-footer .item .label {
  color: #beebff;
  @apply mb-4;
}
@media screen and (max-width: 767px) {
  .list-footer .item {
    @apply w-1/2 mt-5;
  }
}
</style>
