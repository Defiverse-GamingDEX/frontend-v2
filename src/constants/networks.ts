import defiverseJson from '@/constants/defiverse.listed.tokenlist.json';
import defiverseTestnetJson from '@/constants/defiverse.testnet.listed.tokenlist.json';

const networks = [
  // {
  //   id: 'ethereum',
  //   name: 'Ethereum',
  //   networkSlug: 'ethereum',
  //   key: '1',
  // },
  // {
  //   id: 'polygon',
  //   name: 'Polygon',
  //   networkSlug: 'polygon',
  //   key: '137',
  // },
  // {
  //   id: 'arbitrum',
  //   name: 'Arbitrum',
  //   networkSlug: 'arbitrum',
  //   key: '42161',
  // },
  {
    id: 'defiverse',
    name: 'Defiverse',
    networkSlug: 'defiverse',
    key: '16116',
    tokens: defiverseJson.tokens,
  },
];

const networksDev = [
  // {
  //   id: 'goerli',
  //   name: 'Goerli',
  //   networkSlug: 'goerli',
  //   key: '5',
  // },
  {
    id: 'defiverse-testnet',
    name: 'Defiverse-Testnet',
    networkSlug: 'defiverse-testnet',
    key: '17117',
    tokens: defiverseTestnetJson.tokens,
  },
];

export default {
  networks,
  networksDev,
};
