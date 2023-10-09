export const BRIDGE_NETWORKS = [
  {
    chain_id: '0x1',
    chain_id_decimals: 1,
    img_url: '@/assets/images/bridge/networks/ethereum.png',
    name: 'Ethereum Mainnet',
    gasPrice: null,
    explorer: 'https://scan.defiverse.net',
    rpc: 'https://etherscan.io',
    type: 'L1',
    tokens: [], // TODO hard or import
  },
  {
    chain_id: '0x89',
    chain_id_decimals: 137,
    img_url: '@/assets/images/bridge/networks/polygon.png',
    name: 'Polygon Mainnet',
    gasPrice: null,
    explorer: 'https://polygonscan.com',
    rpc: 'https://polygon-mainnet.infura.io',
    type: 'L1',
    tokens: [], // TODO hard or import
  },
  {
    chain_id: '0x3EF4',
    chain_id_decimals: 16116,
    img_url: '@/assets/images/bridge/networks/defi.png',
    name: 'Defiverse Mainnet',
    gasPrice: 5000000000000,
    explorer: 'https://scan.defiverse.net',
    rpc: 'https://rpc.defiverse.net',
    type: 'L2',
    tokens: [], // TODO hard or import
  },
  {
    chain_id: '0x736C',
    chain_id_decimals: 29548,
    name: 'MCHVerse Mainnet',
    img_url: '@/assets/images/bridge/networks/mch.png',
    gasPrice: null,
    explorer: 'https://explorer.oasys.mycryptoheroes.net',
    rpc: 'https://rpc.oasys.mycryptoheroes.net',
    type: 'L2',
    tokens: [], // TODO hard or import
  },
  {
    chain_id: '0x960',
    chain_id_decimals: 2400,
    name: 'TCGVerse Mainnet',
    img_url: '@/assets/images/bridge/networks/tcg.png',
    gasPrice: null,
    explorer: 'https://explorer.tcgverse.xyz',
    rpc: 'https://rpc.tcgverse.xyz',
    type: 'L2',
    tokens: [], // TODO hard or import
  },
  {
    chain_id: '0x4a43',
    chain_id_decimals: 19011,
    name: 'HOMEVerse Mainnet',
    img_url: '@/assets/images/bridge/networks/home.png',
    gasPrice: null,
    explorer: 'https://explorer.oasys.homeverse.games',
    rpc: 'https://rpc.mainnet.oasys.homeverse.games',
    type: 'L2',
    tokens: [], // TODO hard or import
  },
  {
    chain_id: '0x15b3',
    chain_id_decimals: 5555,
    name: 'ChainVerse Mainnet',
    img_url: '@/assets/images/bridge/networks/chain.png',
    gasPrice: null,
    explorer: 'https://explorer.chainverse.info',
    rpc: 'https://rpc.chainverse.info',
    type: 'L2',
    tokens: [], // TODO hard or import
  },
  {
    chain_id: '0x6E4216',
    chain_id_decimals: 7225878,
    name: 'SaakuruVerse Mainnet',
    img_url: '@/assets/images/bridge/networks/saakuru.png',
    gasPrice: null,
    explorer: 'https://explorer.saakuru.network',
    rpc: 'https://rpc.saakuru.network',
    type: 'L2',
    tokens: [], // TODO hard or import
  },
  {
    chain_id: '0x42DD',
    chain_id_decimals: 17117,
    name: 'Defiverse Testnet',
    img_url: '@/assets/images/bridge/networks/defi.png',
    gasPrice: 50000000000,
    explorer: 'https://scan-testnet.defiverse.net',
    rpc: 'https://rpc-testnet.defiverse.net',
    type: 'L2',
    tokens: [], // TODO hard or import
  },
];
