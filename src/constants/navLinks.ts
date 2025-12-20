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
    chainsSupport: [17117, 9372, 248, 16116, 6343],
  },
  {
    text: 'portfolio',
    path: 'portfolio',
    name_link: 'portfolio',
    goal_key: 'ClickNavPortfolio',
    chainsSupport: [17117, 9372, 248, 16116, 6343],
  },
  {
    text: 'Vote',
    path: 'sZ',
    name_link: 'vebal',
    goal_key: 'ClickNavVebal',
    chainsSupport: [9372, 248, 6343],
  },
  {
    text: 'Bridge',
    path: 'bridge',
    name_link: 'bridge',
    goal_key: 'ClickNavBridge',
    chainsSupport: [248, 16116],
  },
  {
    text: 'transfer.transfer',
    path: 'transfer/token',
    name_link: 'transfer-token',
    goal_key: 'ClickNavTransferToken',
    chainsSupport: [248, 16116],
    children: [
      {
        text: 'transfer.transferToken',
        path: 'transfer/token',
        name_link: 'transfer-token',
        goal_key: 'ClickNavTransferToken',
        chainsSupport: null,
      },
      {
        text: 'transfer.transferNft',
        path: 'transfer/nft',
        name_link: 'transfer-nft',
        goal_key: 'ClickNavTransferNft',
        chainsSupport: null,
      },
    ],
  },
];

export const NAV_LINKS = [...NAV_LINKS_MAINNET];
