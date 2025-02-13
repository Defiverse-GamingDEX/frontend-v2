import defiverseJson from './defiverse.listed.tokenlist.json';
import defiverseTestnetJson from './defiverse.testnet.listed.tokenlist.json';
import oasysJson from './oasys.listed.tokenlist.json';
import oasysTestnetJson from './oasys.testnet.listed.tokenlist.json';

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

// Hàm để fetch JSON từ API
async function fetchTokenLists() {
  console.log('🚀 ~ fetchTokenLists ~ fetchTokenLists:', fetchTokenLists);
  try {
    const [defiverseResponse, defiverseTestnetResponse] = await Promise.all([
      fetch(
        'https://moccasin-raw-lemming-987.mypinata.cloud/ipfs/bafkreicdvv7s2ret62ssob4twrcqkbooww2je4hspjos3uken77emjrjla'
      ),
      fetch(
        'https://moccasin-raw-lemming-987.mypinata.cloud/ipfs/bafkreieopw3gng3r7ydxsr4a27ki7inen32to6vinrlho65oiemiwb45eu'
      ),
    ]);

    const defiverseJsonFromApi = await defiverseResponse.json();
    console.log(
      '🚀 ~ fetchTokenLists ~ defiverseJsonFromApi:',
      defiverseJsonFromApi
    );
    const defiverseTestnetJsonFromApi = await defiverseTestnetResponse.json();
    console.log(
      '🚀 ~ fetchTokenLists ~ defiverseTestnetJsonFromApi:',
      defiverseTestnetJsonFromApi
    );

    // Cập nhật TOKEN_LIST_MAP với dữ liệu từ API
    return {
      defiverseJson: defiverseJsonFromApi,
      defiverseTestnetJson: defiverseTestnetJsonFromApi,
    };
  } catch (error) {
    console.error('Error fetching token lists:', error);
    // Fallback về JSON local nếu API fail
    return {
      defiverseJson,
      defiverseTestnetJson,
    };
  }
}

// Khởi tạo TOKEN_LIST_MAP với promise
export const initializeTokenListMap = async () => {
  const {
    defiverseJson: fetchedDefiverse,
    defiverseTestnetJson: fetchedDefiverseTestnet,
  } = await fetchTokenLists();

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
        Default: JSON.stringify(fetchedDefiverse),
        Vetted: JSON.stringify(fetchedDefiverse),
      },
      External: [],
    },
    '17117': {
      Balancer: {
        Default: JSON.stringify(fetchedDefiverseTestnet),
        Vetted: JSON.stringify(fetchedDefiverseTestnet),
      },
      External: [],
    },
    '248': {
      Balancer: {
        Default: JSON.stringify(oasysJson),
        Vetted: JSON.stringify(oasysJson),
      },
      External: [],
    },
    '9372': {
      Balancer: {
        Default: JSON.stringify(oasysTestnetJson),
        Vetted: JSON.stringify(oasysTestnetJson),
      },
      External: [],
    },
    // just add for Bridge network
    '29548': {
      Balancer: {
        Default: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
        Vetted: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
      },
      External: [],
    },
    '2400': {
      Balancer: {
        Default: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
        Vetted: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
      },
      External: [],
    },
    '19011': {
      Balancer: {
        Default: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
        Vetted: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
      },
      External: [],
    },
    '5555': {
      Balancer: {
        Default: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
        Vetted: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
      },
      External: [],
    },
    '7225878': {
      Balancer: {
        Default: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
        Vetted: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
      },
      External: [],
    },
    '43113': {
      Balancer: {
        Default: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
        Vetted: JSON.stringify(fetchedDefiverseTestnet), //TODO NOT USE
      },
      External: [],
    },
  };
};
