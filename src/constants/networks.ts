import defiverseJson from '@/constants/defiverse.listed.tokenlist.json';
import defiverseTestnetJson from '@/constants/defiverse.testnet.listed.tokenlist.json';

import oasysTestnetJson from '@/constants/oasys.testnet.listed.tokenlist.json';
import oasysJson from '@/constants/oasys.listed.tokenlist.json';

const IS_TESTNET = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
let networks: any = [
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
  // // {
  // //   id: 'arbitrum',
  // //   name: 'Arbitrum',
  // //   networkSlug: 'arbitrum',
  // //   key: '42161',
  // // },
  {
    id: 'defiverse',
    name: 'Defiverse',
    networkSlug: 'defiverse',
    key: '16116',
    tokens: defiverseJson.tokens,
    // price: 5000000000000, // 5000 Gwei
    // gasUnit: 'wei',
    maxPriorityFee: 0,
  },
  // // bridge networks
  // {
  //   id: 'mchverse',
  //   name: 'MCHVerse',
  //   networkSlug: 'mchverse',
  //   key: '29548',
  //   tokens: defiverseJson.tokens, // TODO not right
  //   price: null,
  //   gasUnit: 'wei',
  //   maxPriorityFee: 0,
  // },
  // {
  //   id: 'tcgverse',
  //   name: 'TCGVerse',
  //   networkSlug: 'tcgverse',
  //   key: '2400',
  //   tokens: defiverseJson.tokens, // TODO not right
  //   price: null,
  //   gasUnit: 'wei',
  //   maxPriorityFee: 0,
  // },
  // {
  //   id: 'homeverse',
  //   name: 'HOMEVerse',
  //   networkSlug: 'homeverse',
  //   key: '19011',
  //   tokens: defiverseJson.tokens, // TODO not right
  //   price: null,
  //   gasUnit: 'wei',
  //   maxPriorityFee: 0,
  // },
  // {
  //   id: 'chainverse',
  //   name: 'ChainVerse',
  //   networkSlug: 'chainverse',
  //   key: '5555',
  //   tokens: defiverseJson.tokens, // TODO not right
  //   price: null,
  //   gasUnit: 'wei',
  //   maxPriorityFee: 0,
  // },
  // {
  //   id: 'saakuru',
  //   name: 'SaakuruVerse',
  //   networkSlug: 'saakuru',
  //   key: '7225878',
  //   tokens: defiverseJson.tokens, // TODO not right
  //   price: null,
  //   gasUnit: 'wei',
  //   maxPriorityFee: 0,
  // },
  {
    id: 'oasys',
    name: 'Oasys',
    networkSlug: 'oasys',
    key: '248',
    tokens: oasysJson.tokens,
    // price: 35000000000, // 50 Gwei
    gasUnit: 'wei',
    maxPriorityFee: 0,
  },
];

let networksDev = [
  {
    id: 'defiverse-testnet',
    name: 'DefiVerse-Testnet',
    networkSlug: 'defiverse-testnet',
    key: '17117',
    tokens: defiverseTestnetJson.tokens,
    price: 35000000000, // 50 Gwei
    gasUnit: 'wei',
    maxPriorityFee: 0,
  },
  {
    id: 'oasys-testnet',
    name: 'Oasys-Testnet',
    networkSlug: 'oasys-testnet',
    key: '9372',
    tokens: oasysTestnetJson.tokens,
    // price: 35000000000, // 50 Gwei
    gasUnit: 'wei',
    maxPriorityFee: 0,
  },
];

// add network for bridge testnet
if (IS_TESTNET == true) {
  networksDev = [
    ...networksDev,
    // {
    //   id: 'goerli',
    //   name: 'Goerli',
    //   networkSlug: 'goerli',
    //   key: '5',
    // },
    // {
    //   id: 'avalanche-testnet',
    //   name: 'Avalanche Testnet',
    //   networkSlug: 'avalanche-testnet',
    //   key: '43113',
    // },
  ];
  networks = [];
}

export default {
  networks,
  networksDev,
};
