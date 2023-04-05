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
        <div v-for="(i, idx) in links" :key="idx" class="item">
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
            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Youtube"
              external
              noStyle
            >
              <IconYoutube />
            </BalLink>
            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Github"
              external
              noStyle
            >
              <IconGithub />
            </BalLink>
            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Linkedin"
              external
              noStyle
            >
              <IconLinkedin />
            </BalLink>
            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Social.Mail"
              external
              noStyle
            >
              <IconMail />
            </BalLink>
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
import IconLinkedin from '@/components/icons/IconLinkedin.vue';
import IconMail from '@/components/icons/IconMail.vue';
import IconMedium from '@/components/icons/IconMedium.vue';
import IconTwitter from '@/components/icons/IconTwitter.vue';
import IconYoutube from '@/components/icons/IconYoutube.vue';
import { EXTERNAL_LINKS } from '@/constants/links';
import { NAV_LINKS } from '@/constants/navLinks';

import useNetwork from '@/composables/useNetwork';

export default {
  components: {
    IconTwitter,
    IconDiscord,
    IconMedium,
    IconYoutube,
    IconGithub,
    IconMail,
    IconLinkedin,
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
          label: 'Balancer.fi',
          childs: [
            { text: 'Home', link: EXTERNAL_LINKS.Balancer.Home },
            { text: 'Build', link: EXTERNAL_LINKS.Balancer.Build },
          ],
        },
        {
          label: 'Infrastructure',
          childs: [
            { text: 'Explore pools', link: 'https://app.balancer.fi/#/' },
            {
              text: 'Vote with veBAL',
              link: 'https://app.balancer.fi/#/vebal',
            },
            {
              text: 'Claim incentives',
              link: 'https://app.balancer.fi/#/claim',
            },
          ],
        },
        {
          label: 'Learn',
          childs: [
            { text: 'Documentation', link: EXTERNAL_LINKS.Balancer.Docs },
            {
              text: 'Question Center',
              link: 'https://app.balancer.fi/#/risks',
            },
            { text: 'Whitepaper', link: 'https://balancer.fi/whitepaper.pdf' },
            {
              text: 'Careers',
              link: 'https://wellfound.com/company/balancer-labs-1',
            },
          ],
        },
        {
          label: 'Ecosystem',
          childs: [
            { text: 'Snapshot governance', link: EXTERNAL_LINKS.Balancer.Vote },
            {
              text: 'Immunefi bug bounty',
              link: EXTERNAL_LINKS.Balancer.BugBounty,
            },
            {
              text: 'Dune analytics',
              link: `${EXTERNAL_LINKS.Balancer.Home}/whitepaper.pdf`,
            },
            { text: 'Forum', link: EXTERNAL_LINKS.Balancer.Forum },
            { text: 'Grants', link: EXTERNAL_LINKS.Balancer.Grants },
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
