import defiverseJson from './defiverse.listed.tokenlist.json';
import defiverseTestnetJson from './defiverse.testnet.listed.tokenlist.json';

export interface TokenListMap {
  Balancer: {
    Default: string;
    Vetted: string;
  };
  External: string[];
}

interface TokenListMapByNetwork {
  [networkKey: string]: TokenListMap;
}

/**
 * Mapping of the TokenLists used on each network
 */
export const TOKEN_LIST_MAP: TokenListMapByNetwork = {
  '1': {
    Balancer: {
      Default:
        'https://raw.githubusercontent.com/balancer-labs/assets/master/generated/listed.tokenlist.json',
      Vetted:
        'https://raw.githubusercontent.com/balancer-labs/assets/master/generated/vetted.tokenlist.json',
    },
    External: [
      'ipns://tokens.uniswap.org',
      'https://www.gemini.com/uniswap/manifest.json',
    ],
  },
  '5': {
    Balancer: {
      Default:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/goerli.listed.tokenlist.json',
      Vetted:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/goerli.vetted.tokenlist.json',
    },
    External: [],
  },
  '10': {
    Balancer: {
      Default: '',
      Vetted: '',
    },
    External: [],
  },
  '137': {
    Balancer: {
      Default:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/polygon.listed.tokenlist.json',
      Vetted:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/polygon.vetted.tokenlist.json',
    },
    External: [
      'https://unpkg.com/quickswap-default-token-list@1.0.67/build/quickswap-default.tokenlist.json',
    ],
  },
  '42161': {
    Balancer: {
      Default:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/arbitrum.listed.tokenlist.json',
      Vetted:
        'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/generated/arbitrum.vetted.tokenlist.json',
    },
    External: [],
  },
  '16116': {
    Balancer: {
      Default: JSON.stringify(defiverseJson),
      Vetted: JSON.stringify(defiverseJson),
    },
    External: [],
  },
  '17117': {
    Balancer: {
      Default: JSON.stringify(defiverseTestnetJson),
      Vetted: JSON.stringify(defiverseTestnetJson),
    },
    External: [],
  },
  // just add for Bridge network
  '29548': {
    Balancer: {
      Default: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
      Vetted: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
    },
    External: [],
  },
  '2400': {
    Balancer: {
      Default: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
      Vetted: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
    },
    External: [],
  },
  '19011': {
    Balancer: {
      Default: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
      Vetted: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
    },
    External: [],
  },
  '5555': {
    Balancer: {
      Default: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
      Vetted: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
    },
    External: [],
  },
  '7225878': {
    Balancer: {
      Default: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
      Vetted: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
    },
    External: [],
  },
  '43113': {
    Balancer: {
      Default: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
      Vetted: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
    },
    External: [],
  },
  '248': {
    Balancer: {
      Default: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
      Vetted: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
    },
    External: [],
  },
  '9372': {
    Balancer: {
      Default: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
      Vetted: JSON.stringify(defiverseTestnetJson), //TODO NOT USE
    },
    External: [],
  },
};
