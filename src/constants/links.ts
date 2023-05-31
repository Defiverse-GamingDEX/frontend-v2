export const EXTERNAL_LINKS = {
  Balancer: {
    Home: 'https://balancer.fi',
    Build: 'https://balancer.fi/build/',
    Analytics: 'https://dune.xyz/balancerlabs',
    BalForGas:
      'https://docs.balancer.finance/core-concepts/bal-balancer-governance-token/bal-for-gas',
    BugBounty: 'https://immunefi.com/bounty/balancer/',
    Docs: 'https://docs.balancer.fi',
    Forum: 'https://forum.balancer.finance/',
    Grants: 'http://grants.balancer.community/',
    Social: {
      Discord:
        'https://discord.com/channels/1112739208692514948/1112739209321652316',
      Github: 'https://github.com/GamingDEX',
      Mail: 'mailto:contact@balancer.finance',
      Medium: 'https://medium.com/@GamingDEX_Oasys',
      Linkedin: 'https://www.linkedin.com/company/balancer-labs/',
      Twitter: 'https://twitter.com/GamingDEX_Oasys',
      Youtube: 'https://www.youtube.com/channel/UCBRHug6Hu3nmbxwVMt8x_Ow',
    },
    Vote: 'https://vote.balancer.finance/',
  },
  Gauntlet: {
    Home: 'https://gauntlet.network',
  },
  Ethereum: {
    Wallets: 'https://ethereum.org/en/wallets',
  },
  Element: {
    Home: 'https://element.fi',
    Earn: 'https://app.element.fi/mint',
    Pools: {
      LUSD: 'https://app.element.fi/pools/0x56F30398d13F111401d6e7ffE758254a0946687d',
      USDC: 'https://app.element.fi/pools/0x7Edde0CB05ED19e03A9a47CD5E53fC57FDe1c80c',
    },
  },
  Copper: {
    Home: 'https://fjordfoundry.com/?utm_source=balancer&utm_medium=website',
    Auctions: (poolAddress: string, networkPrefix = '') =>
      `https://${networkPrefix}copperlaunch.com/auctions/${poolAddress}`,
  },
  Tracer: {
    Home: 'https://mycelium.xyz/',
  },
  Sense: {
    Home: 'https://sense.finance/',
  },
};
