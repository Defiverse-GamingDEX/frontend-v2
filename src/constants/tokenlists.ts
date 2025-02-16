import defiverseJson from './defiverse.listed.tokenlist.json';
import defiverseTestnetJson from './defiverse.testnet.listed.tokenlist.json';
import oasysJson from './oasys.listed.tokenlist.json';
import oasysTestnetJson from './oasys.testnet.listed.tokenlist.json';
import axios from 'axios';
const IS_TESTNET = import.meta.env.VITE_IS_TESTNET === 'true';
//const chain_ids = IS_TESTNET ? '9372,17117' : '248,16116';
const BASE_API_URL = IS_TESTNET
  ? 'https://price-api-testnet.gaming-dex.com'
  : 'https://price-api.gaming-dex.com';
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

// async function fetchTokenLists() {
//   try {
//     const oasysChainId = IS_TESTNET ? 9372 : 248;
//     const defiverseChainId = IS_TESTNET ? 17117 : 16116;
//     const [oasysResponse, defiverseResponse] = await Promise.all([
//       axios.get(
//         `${BASE_API_URL}/api/v1/tokens/search?chain_id=${oasysChainId}`
//       ),
//       axios.get(
//         `${BASE_API_URL}/api/v1/tokens/search?chain_id=${defiverseChainId}`
//       ),
//     ]);

//     const oasysJsonFromApi = await oasysResponse.data;
//     const defiverseJsonFromApi = await defiverseResponse.data;

//     return {
//       oasysJsonBE: oasysJsonFromApi,
//       defiverseJsonBE: defiverseJsonFromApi,
//     };
//   } catch (error) {
//     console.error('Error fetching token lists:', error);

//     return {
//       oasysJson,
//       defiverseJson,
//     };
//   }
// }
async function fetchTokenLists() {
  try {
    const oasysChainId = IS_TESTNET ? 9372 : 248;
    const defiverseChainId = IS_TESTNET ? 17117 : 16116;
    const [response] = await Promise.all([
      axios.get(
        `${BASE_API_URL}/api/v1/tokens/search?chain_id=${oasysChainId},${defiverseChainId}`
      ),
    ]);

    const jsonFromApi = await response.data;
    const oasysJsonFromApi = jsonFromApi[oasysChainId];
    const defiverseJsonFromApi = jsonFromApi[defiverseChainId];

    return {
      oasysJsonBE: oasysJsonFromApi,
      defiverseJsonBE: defiverseJsonFromApi,
    };
  } catch (error) {
    console.error('Error fetching token lists:', error);

    return {
      oasysJson,
      defiverseJson,
    };
  }
}
// init TOKEN_LIST_MAP
export const initializeTokenListMap = async () => {
  const { oasysJsonBE: oasysJsonBE, defiverseJsonBE: defiverseJsonBE } =
    await fetchTokenLists();
  return {
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
        Default: JSON.stringify(defiverseJsonBE),
        Vetted: JSON.stringify(defiverseJsonBE),
      },
      External: [],
    },
    '17117': {
      Balancer: {
        Default: JSON.stringify(defiverseJsonBE),
        Vetted: JSON.stringify(defiverseJsonBE),
      },
      External: [],
    },
    '248': {
      Balancer: {
        Default: JSON.stringify(oasysJsonBE),
        Vetted: JSON.stringify(oasysJsonBE),
      },
      External: [],
    },
    '9372': {
      Balancer: {
        Default: JSON.stringify(oasysJsonBE),
        Vetted: JSON.stringify(oasysJsonBE),
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
  };
};
