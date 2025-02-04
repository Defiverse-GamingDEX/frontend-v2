const isTestnet = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
let NAV_LINKS_MAINNET = [
  {
    text: 'pool',
    path: 'pool',
    name_link: 'list-pool',
    goal_key: 'ClickNavPools',
  },
  { text: 'swap', path: 'swap', name_link: 'swap', goal_key: 'ClickNavSwap' },
  // {
  //   text: 'claim',
  //   path: 'claim',
  //   name_link: 'claim',
  //   goal_key: 'ClickNavClaim',
  // },
  // {
  //   text: 'portfolio',
  //   path: 'portfolio',
  //   name_link: 'portfolio',
  //   goal_key: 'ClickNavPortfolio',
  // },
  // {
  //   text: 'veGDT',
  //   path: 'vegdt',
  //   name_link: 'vebal',
  //   goal_key: 'ClickNavVebal',
  // },
  // TODO: hide temp 01/02/2025
  // {
  //   text: 'Bridge',
  //   path: 'bridge',
  //   name_link: 'bridge',
  //   goal_key: 'ClickNavBridge',
  // },
];
if (isTestnet) {
  NAV_LINKS_MAINNET = [
    ...NAV_LINKS_MAINNET,
    {
      text: 'claim',
      path: 'claim',
      name_link: 'claim',
      goal_key: 'ClickNavClaim',
    },
    {
      text: 'portfolio',
      path: 'portfolio',
      name_link: 'portfolio',
      goal_key: 'ClickNavPortfolio',
    },
    {
      text: 'veGDT',
      path: 'vegdt',
      name_link: 'vebal',
      goal_key: 'ClickNavVebal',
    },
  ];
}
export const NAV_LINKS = [...NAV_LINKS_MAINNET];
