const NAV_LINKS_MAINNET = [
  {
    text: 'pool',
    path: 'pool',
    name_link: 'list-pool',
    goal_key: 'ClickNavPools',
  },
  { text: 'swap', path: 'swap', name_link: 'swap', goal_key: 'ClickNavSwap' },
  {
    text: 'claim',
    path: 'claim',
    name_link: 'claim',
    goal_key: 'ClickNavClaim',
    chainsSupport: [17117, 9372],
  },
  {
    text: 'portfolio',
    path: 'portfolio',
    name_link: 'portfolio',
    goal_key: 'ClickNavPortfolio',
    chainsSupport: [17117, 9372],
  },
  {
    text: 'sZ',
    path: 'sZ',
    name_link: 'vebal',
    goal_key: 'ClickNavVebal',
    chainsSupport: [17117, 9372, 248],
  },
  {
    text: 'Bridge',
    path: 'bridge',
    name_link: 'bridge',
    goal_key: 'ClickNavBridge',
    chainsSupport: [248, 16116],
  },
];

export const NAV_LINKS = [...NAV_LINKS_MAINNET];
