import { Network } from '@balancer-labs/sdk';

import { PoolToken, PoolType } from '@/services/balancer/subgraph/types';

export type VotingGauge = {
  address: string;
  network: Network;
  pool: {
    id: string;
    address: string;
    poolType: PoolType;
    symbol: string;
    tokens: Pick<PoolToken, 'address' | 'weight' | 'symbol'>[];
  };
  tokenLogoURIs: Record<string, string>;
};

export const KOVAN_VOTING_GAUGES: VotingGauge[] = [
  {
    address: '0xE190E5363C925513228Bf25E4633C8cca4809C9a',
    network: Network.KOVAN,
    pool: {
      id: '0x647c1fd457b95b75d0972ff08fe01d7d7bda05df000200000000000000000001',
      address: '0x647c1FD457b95b75D0972fF08FE01d7D7bda05dF',
      poolType: PoolType.Weighted,
      symbol: 'B-50WBTC-50WETH',
      tokens: [
        {
          address: '0x1C8E3Bcb3378a443CC591f154c5CE0EBb4dA9648',
          weight: '0.5',
          symbol: 'WBTC'
        },
        {
          address: '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x1C8E3Bcb3378a443CC591f154c5CE0EBb4dA9648':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x5E7B7B41377Ce4B76d6008F7a91ff9346551c853',
    network: Network.KOVAN,
    pool: {
      id: '0xf767f0a3fcf1eafec2180b7de79d0c559d7e7e370001000000000000000003e3',
      address: '',
      poolType: PoolType.Weighted,
      symbol: '17WBTC-50BAL-33USDC',
      tokens: [
        {
          address: '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648',
          weight: '0.1667',
          symbol: 'WBTC'
        },
        {
          address: '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7',
          weight: '0.5',
          symbol: 'BAL'
        },
        {
          address: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
          weight: '0.3333',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x1c8e3bcb3378a443cc591f154c5ce0ebb4da9648':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      '0x41286bb1d3e870f3f750eb7e1c25d7e48c8a1ac7':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xba100000625a3754423978a60c9317c58a424e3D/logo.png',
      '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    }
  },
  {
    address: '0xf34D5E5715CC6CC9493f5bD252185E8acdc1De0d',
    network: Network.KOVAN,
    pool: {
      id: '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8',
      address: '0x8fd162f338B770F7E879030830cDe9173367f301',
      poolType: PoolType.StablePhantom,
      symbol: 'bb-a-USD ',
      tokens: [
        {
          address: '0x0Bbd32B14A6503EE20F87df38Cf2d5d3b59eA2F5',
          weight: 'null',
          symbol: 'bb-a-USDC'
        },
        {
          address: '0xe667D48618e71c2a02E4a1B66Ed9dEf1426938b6',
          weight: 'null',
          symbol: 'bb-a-USDT'
        },
        {
          address: '0xfCCcB77A946b6a3BD59d149F083B5BfbB8004D6D',
          weight: 'null',
          symbol: 'bb-a-DAI'
        }
      ]
    },
    tokenLogoURIs: {
      '0x0Bbd32B14A6503EE20F87df38Cf2d5d3b59eA2F5':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x9210f1204b5a24742eba12f710636d76240df3d0.png',
      '0xe667D48618e71c2a02E4a1B66Ed9dEf1426938b6':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x2bbf681cc4eb09218bee85ea2a5d3d13fa40fc0c.png',
      '0xfCCcB77A946b6a3BD59d149F083B5BfbB8004D6D':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x804cdb9116a10bb78768d3252355a1b18067bf8f.png'
    }
  }
];

export const MAINNET_VOTING_GAUGES: VotingGauge[] = [
  {
    address: '0x34f33CDaED8ba0E1CEECE80e5f4a73bcf234cfac',
    network: Network.MAINNET,
    pool: {
      id: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
      address: '0x06Df3b2bbB68adc8B0e302443692037ED9f91b42',
      poolType: PoolType.Stable,
      symbol: 'staBAL3',
      tokens: [
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          weight: 'null',
          symbol: 'DAI'
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          weight: 'null',
          symbol: 'USDC'
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          weight: 'null',
          symbol: 'USDT'
        }
      ]
    },
    tokenLogoURIs: {
      '0x6B175474E89094C44Da98b954EedeAC495271d0F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
    }
  },
  {
    address: '0x605eA53472A496c3d483869Fe8F355c12E861e19',
    network: Network.MAINNET,
    pool: {
      id: '0x072f14b85add63488ddad88f855fda4a99d6ac9b000200000000000000000027',
      address: '0x072f14B85ADd63488DDaD88f855Fda4A99d6aC9B',
      poolType: PoolType.Weighted,
      symbol: 'B-50SNX-50WETH',
      tokens: [
        {
          address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
          weight: '0.5',
          symbol: 'SNX'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x4ca6AC0509E6381Ca7CD872a6cdC0Fbf00600Fa1',
    network: Network.MAINNET,
    pool: {
      id: '0x0b09dea16768f0799065c475be02919503cb2a3500020000000000000000001a',
      address: '0x0b09deA16768f0799065C475bE02919503cB2a35',
      poolType: PoolType.Weighted,
      symbol: 'B-60WETH-40DAI',
      tokens: [
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          weight: '0.4',
          symbol: 'DAI'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.6',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x6B175474E89094C44Da98b954EedeAC495271d0F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x5F4d57fd9Ca75625e4B7520c71c02948A48595d0',
    network: Network.MAINNET,
    pool: {
      id: '0x186084ff790c65088ba694df11758fae4943ee9e000200000000000000000013',
      address: '0x186084fF790C65088BA694Df11758faE4943EE9E',
      poolType: PoolType.Weighted,
      symbol: 'B-50WETH-50YFI',
      tokens: [
        {
          address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
          weight: '0.5',
          symbol: 'YFI'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x79eF6103A513951a3b25743DB509E267685726B7',
    network: Network.MAINNET,
    pool: {
      id: '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112',
      address: '0x1E19CF2D73a72Ef1332C882F20534B6519Be0276',
      poolType: PoolType.MetaStable,
      symbol: 'B-rETH-STABLE',
      tokens: [
        {
          address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
          weight: 'null',
          symbol: 'rETH'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: 'null',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0xae78736Cd615f374D3085123A210448E74Fc6393':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xae78736cd615f374d3085123a210448e74fc6393.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x5A481455E62D5825429C8c416f3B8D2938755B64',
    network: Network.MAINNET,
    pool: {
      id: '0x27c9f71cc31464b906e0006d4fcbc8900f48f15f00020000000000000000010f',
      address: '0x27C9f71cC31464B906E0006d4FcBC8900F48f15f',
      poolType: PoolType.Weighted,
      symbol: '80D2D-20USDC',
      tokens: [
        {
          address: '0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad',
          weight: '0.8',
          symbol: 'D2D'
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          weight: '0.2',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad.png',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    }
  },
  {
    address: '0xcD4722B7c24C29e0413BDCd9e51404B4539D14aE',
    network: Network.MAINNET,
    pool: {
      id: '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080',
      address: '0x32296969Ef14EB0c6d29669C550D4a0449130230',
      poolType: PoolType.MetaStable,
      symbol: 'B-stETH-STABLE',
      tokens: [
        {
          address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
          weight: 'null',
          symbol: 'wstETH'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: 'null',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xb154d9D7f6C5d618c08D276f94239c03CFBF4575',
    network: Network.MAINNET,
    pool: {
      id: '0x350196326aeaa9b98f1903fb5e8fc2686f85318c000200000000000000000084',
      address: '0x350196326AEAA9b98f1903fb5e8fc2686f85318C',
      poolType: PoolType.Weighted,
      symbol: 'VBPT',
      tokens: [
        {
          address: '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321',
          weight: '0.8',
          symbol: 'VITA'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xdB7D7C535B4081Bb8B719237bdb7DB9f23Cc0b83',
    network: Network.MAINNET,
    pool: {
      id: '0x3e5fa9518ea95c3e533eb377c001702a9aacaa32000200000000000000000052',
      address: '0x3e5FA9518eA95c3E533EB377C001702A9AaCAA32',
      poolType: PoolType.Weighted,
      symbol: 'B-50WETH-50USDT',
      tokens: [
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          weight: '0.5',
          symbol: 'USDT'
        }
      ]
    },
    tokenLogoURIs: {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
    }
  },
  {
    address: '0xaB5ea78c8323212cC5736bfe4874557Bc778Bfbf',
    network: Network.MAINNET,
    pool: {
      id: '0x4bd6d86debdb9f5413e631ad386c4427dc9d01b20002000000000000000000ec',
      address: '0x4bd6D86dEBdB9F5413e631Ad386c4427DC9D01B2',
      poolType: PoolType.Stable,
      symbol: 'LPePyvWBTC-29APR22',
      tokens: [
        {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          weight: 'null',
          symbol: 'WBTC'
        },
        {
          address: '0x49e9e169f0B661Ea0A883f490564F4CC275123Ed',
          weight: 'null',
          symbol: 'ePyvWBTC-29APR22'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      '0x49e9e169f0B661Ea0A883f490564F4CC275123Ed': ''
    }
  },
  {
    address: '0x8F4a5C19A74D7111bC0e1486640F0aAB537dE5A1',
    network: Network.MAINNET,
    pool: {
      id: '0x51735bdfbfe3fc13dea8dc6502e2e958989429610002000000000000000000a0',
      address: '0x51735bdFBFE3fC13dEa8DC6502E2E95898942961',
      poolType: PoolType.Weighted,
      symbol: 'B-80UNN-20WETH',
      tokens: [
        {
          address: '0x226f7b842E0F0120b7E194D05432b3fd14773a9D',
          weight: '0.8',
          symbol: 'UNN'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x226f7b842E0F0120b7E194D05432b3fd14773a9D':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x226f7b842E0F0120b7E194D05432b3fd14773a9D/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xD61dc7452C852B866c0Ae49F4e87C38884AE231d',
    network: Network.MAINNET,
    pool: {
      id: '0x5d66fff62c17d841935b60df5f07f6cf79bd0f4700020000000000000000014c',
      address: '0x5d66FfF62c17D841935b60df5F07f6CF79Bd0F47',
      poolType: PoolType.Weighted,
      symbol: '50Silo-50WETH',
      tokens: [
        {
          address: '0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8',
          weight: '0.5',
          symbol: 'Silo'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x6f80310ca7f2c654691d1383149fa1a57d8ab1f8.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xC5f8B1de80145e3a74524a3d1a772a31eD2B50cc',
    network: Network.MAINNET,
    pool: {
      id: '0x5f7fa48d765053f8dd85e052843e12d23e3d7bc50002000000000000000000c0',
      address: '0x5f7FA48d765053F8dD85E052843e12D23e3D7BC5',
      poolType: PoolType.Weighted,
      symbol: 'NWWP',
      tokens: [
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        },
        {
          address: '0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5',
          weight: '0.5',
          symbol: 'NOTE'
        }
      ]
    },
    tokenLogoURIs: {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      '0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xcfeaead4947f0705a14ec42ac3d44129e1ef3ed5.png'
    }
  },
  {
    address: '0x7A89f34E976285b7b885b32b2dE566389C2436a0',
    network: Network.MAINNET,
    pool: {
      id: '0x702605f43471183158938c1a3e5f5a359d7b31ba00020000000000000000009f',
      address: '0x702605F43471183158938C1a3e5f5A359d7b31ba',
      poolType: PoolType.Weighted,
      symbol: 'B-80BAL-20WETH',
      tokens: [
        {
          address: '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7',
          weight: '0.8',
          symbol: 'GRO'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x68d019f64A7aa97e2D4e7363AEE42251D08124Fb',
    network: Network.MAINNET,
    pool: {
      id: '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe',
      address: '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2',
      poolType: PoolType.StablePhantom,
      symbol: 'bb-a-USD',
      tokens: [
        {
          address: '0x2BBf681cC4eb09218BEe85EA2a5d3D13Fa40fC0C',
          weight: 'null',
          symbol: 'bb-a-USDT'
        },
        {
          address: '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2',
          weight: 'null',
          symbol: 'bb-a-USD'
        },
        {
          address: '0x804CdB9116a10bB78768D3252355a1b18067bF8f',
          weight: 'null',
          symbol: 'bb-a-DAI'
        },
        {
          address: '0x9210F1204b5a24742Eba12f710636D76240dF3d0',
          weight: 'null',
          symbol: 'bb-a-USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2BBf681cC4eb09218BEe85EA2a5d3D13Fa40fC0C':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x2bbf681cc4eb09218bee85ea2a5d3d13fa40fc0c.png',
      '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb2.png',
      '0x804CdB9116a10bB78768D3252355a1b18067bF8f':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x804cdb9116a10bb78768d3252355a1b18067bf8f.png',
      '0x9210F1204b5a24742Eba12f710636D76240dF3d0':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x9210f1204b5a24742eba12f710636d76240df3d0.png'
    }
  },
  {
    address: '0x78DF155d6d75Ca2a1b1B2027f37414Ac1e7A1Ed8',
    network: Network.MAINNET,
    pool: {
      id: '0x7edde0cb05ed19e03a9a47cd5e53fc57fde1c80c0002000000000000000000c8',
      address: '0x7Edde0CB05ED19e03A9a47CD5E53fC57FDe1c80c',
      poolType: PoolType.Stable,
      symbol: 'LPePyvUSDC-29APR22',
      tokens: [
        {
          address: '0x52C9886d5D87B0f06EbACBEff750B5Ffad5d17d9',
          weight: 'null',
          symbol: 'ePyvUSDC-29APR22'
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          weight: 'null',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x52C9886d5D87B0f06EbACBEff750B5Ffad5d17d9': '',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    }
  },
  {
    address: '0xc43d32BC349cea7e0fe829F53E26096c184756fa',
    network: Network.MAINNET,
    pool: {
      id: '0x8f4205e1604133d1875a3e771ae7e4f2b086563900020000000000000000010e',
      address: '0x8f4205e1604133d1875a3E771AE7e4F2b0865639',
      poolType: PoolType.Weighted,
      symbol: '50N/A-50N/A',
      tokens: [
        {
          address: '0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad',
          weight: '0.5',
          symbol: 'D2D'
        },
        {
          address: '0xba100000625a3754423978a60c9317c58a424e3D',
          weight: '0.5',
          symbol: 'BAL'
        }
      ]
    },
    tokenLogoURIs: {
      '0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad.png',
      '0xba100000625a3754423978a60c9317c58a424e3D':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xba100000625a3754423978a60c9317c58a424e3D/logo.png'
    }
  },
  {
    address: '0x4f9463405F5bC7b4C1304222c1dF76EFbD81a407',
    network: Network.MAINNET,
    pool: {
      id: '0x90291319f1d4ea3ad4db0dd8fe9e12baf749e84500020000000000000000013c',
      address: '0x90291319F1D4eA3ad4dB0Dd8fe9E12BAF749E845',
      poolType: PoolType.Weighted,
      symbol: 'B-30FEI-70WETH',
      tokens: [
        {
          address: '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
          weight: '0.3',
          symbol: 'FEI'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.7',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x956F47F50A910163D8BF957Cf5846D573E7f87CA':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x956F47F50A910163D8BF957Cf5846D573E7f87CA/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x9AB7B0C7b154f626451c9e8a68dC04f58fb6e5Ce',
    network: Network.MAINNET,
    pool: {
      id: '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019',
      address: '0x96646936b91d6B9D7D0c47C496AfBF3D6ec7B6f8',
      poolType: PoolType.Weighted,
      symbol: 'B-50USDC-50WETH',
      tokens: [
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          weight: '0.5',
          symbol: 'USDC'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xE273d4aCC555A245a80cB494E9E0dE5cD18Ed530',
    network: Network.MAINNET,
    pool: {
      id: '0x96ba9025311e2f47b840a1f68ed57a3df1ea8747000200000000000000000160',
      address: '0x96bA9025311e2f47B840A1f68ED57A3DF1EA8747',
      poolType: PoolType.Weighted,
      symbol: '20DAI-80TCR',
      tokens: [
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          weight: '0.2',
          symbol: 'DAI'
        },
        {
          address: '0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050',
          weight: '0.8',
          symbol: 'TCR'
        }
      ]
    },
    tokenLogoURIs: {
      '0x6B175474E89094C44Da98b954EedeAC495271d0F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
      '0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050.png'
    }
  },
  {
    address: '0x4e311e207CEAaaed421F17E909DA16527565Daef',
    network: Network.MAINNET,
    pool: {
      id: '0xa02e4b3d18d4e6b8d18ac421fbc3dfff8933c40a00020000000000000000004b',
      address: '0xa02E4b3d18D4E6B8d18Ac421fBc3dfFF8933c40a',
      poolType: PoolType.Weighted,
      symbol: 'B-50MATIC-50WETH',
      tokens: [
        {
          address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
          weight: '0.5',
          symbol: 'MATIC'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x4E3c048BE671852277Ad6ce29Fd5207aA12fabff',
    network: Network.MAINNET,
    pool: {
      id: '0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e',
      address: '0xA6F548DF93de924d73be7D25dC02554c6bD66dB5',
      poolType: PoolType.Weighted,
      symbol: 'B-50WBTC-50WETH',
      tokens: [
        {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          weight: '0.5',
          symbol: 'WBTC'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x055d483D00b0FFe0c1123c96363889Fb03fa13a4',
    network: Network.MAINNET,
    pool: {
      id: '0xbaeec99c90e3420ec6c1e7a769d2a856d2898e4d00020000000000000000008a',
      address: '0xBaeEC99c90E3420Ec6c1e7A769d2A856d2898e4D',
      poolType: PoolType.Weighted,
      symbol: 'B-50VITA-50WETH',
      tokens: [
        {
          address: '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321',
          weight: '0.5',
          symbol: 'VITA'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x942CB1Ed80D3FF8028B3DD726e0E2A9671bc6202',
    network: Network.MAINNET,
    pool: {
      id: '0xbf96189eee9357a95c7719f4f5047f76bde804e5000200000000000000000087',
      address: '0xBF96189Eee9357a95C7719f4F5047F76bdE804E5',
      poolType: PoolType.Weighted,
      symbol: 'B-80LDO-20WETH',
      tokens: [
        {
          address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
          weight: '0.8',
          symbol: 'LDO'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x5a98fcbea516cf06857215779fd812ca3bef1b32.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xbeC2d02008Dc64A6AD519471048CF3D3aF5ca0C5',
    network: Network.MAINNET,
    pool: {
      id: '0xe2469f47ab58cf9cf59f9822e3c5de4950a41c49000200000000000000000089',
      address: '0xe2469f47aB58cf9CF59F9822e3C5De4950a41C49',
      poolType: PoolType.Weighted,
      symbol: 'mBPT',
      tokens: [
        {
          address: '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2',
          weight: '0.8',
          symbol: 'MTA'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x31e7F53D27BFB324656FACAa69Fe440169522E1C',
    network: Network.MAINNET,
    pool: {
      id: '0xe99481dc77691d8e2456e5f3f61c1810adfc1503000200000000000000000018',
      address: '0xE99481DC77691d8E2456E5f3F61C1810adFC1503',
      poolType: PoolType.Weighted,
      symbol: 'B-50LINK-50WETH',
      tokens: [
        {
          address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
          weight: '0.5',
          symbol: 'LINK'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x514910771AF9Ca656af840dff83E8264EcF986CA':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xD6E4d70bdA78FBa018c2429e1b84153b9284298e',
    network: Network.MAINNET,
    pool: {
      id: '0xec60a5fef79a92c741cb74fdd6bfc340c0279b01000200000000000000000015',
      address: '0xeC60a5FeF79a92c741Cb74FdD6bfC340C0279B01',
      poolType: PoolType.Weighted,
      symbol: 'B-50REN-50WETH',
      tokens: [
        {
          address: '0x408e41876cCCDC0F92210600ef50372656052a38',
          weight: '0.5',
          symbol: 'REN'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x408e41876cCCDC0F92210600ef50372656052a38':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x408e41876cCCDC0F92210600ef50372656052a38/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0x78259f2e946B11a0bE404d29d3cc017eCddE84C6',
    network: Network.MAINNET,
    pool: {
      id: '0xedf085f65b4f6c155e13155502ef925c9a756003000200000000000000000123',
      address: '0xEdf085f65b4F6c155e13155502Ef925c9a756003',
      poolType: PoolType.Stable,
      symbol: 'LPePyvDAI-29APR22',
      tokens: [
        {
          address: '0x2c72692E94E757679289aC85d3556b2c0f717E0E',
          weight: 'null',
          symbol: 'ePyvDAI-29APR22'
        },
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          weight: 'null',
          symbol: 'DAI'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2c72692E94E757679289aC85d3556b2c0f717E0E': '',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png'
    }
  },
  {
    address: '0xAFc28B2412B343574E8673D4fb6b220473677602',
    network: Network.MAINNET,
    pool: {
      id: '0xefaa1604e82e1b3af8430b90192c1b9e8197e377000200000000000000000021',
      address: '0xEFAa1604e82e1B3AF8430b90192c1B9e8197e377',
      poolType: PoolType.Weighted,
      symbol: 'B-50COMP-50WETH',
      tokens: [
        {
          address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
          weight: '0.5',
          symbol: 'COMP'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0xc00e94Cb662C3520282E6f5717214004A7f26888':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xCB664132622f29943f67FA56CCfD1e24CC8B4995',
    network: Network.MAINNET,
    pool: {
      id: '0xf4c0dd9b82da36c07605df83c8a416f11724d88b000200000000000000000026',
      address: '0xF4C0DD9B82DA36C07605df83c8a416F11724d88b',
      poolType: PoolType.Weighted,
      symbol: 'B-80GNO-20WETH',
      tokens: [
        {
          address: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
          weight: '0.8',
          symbol: 'GNO'
        },
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x6810e776880C02933D47DB1b9fc05908e5386b96':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6810e776880C02933D47DB1b9fc05908e5386b96/logo.png',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }
  },
  {
    address: '0xf4339872Ad09B34a29Be76EE81D4F30BCf7dbf9F',
    network: Network.MAINNET,
    pool: {
      id: '0xf5aaf7ee8c39b651cebf5f1f50c10631e78e0ef9000200000000000000000069',
      address: '0xf5aAf7Ee8C39B651CEBF5f1F50C10631E78e0ef9',
      poolType: PoolType.Weighted,
      symbol: 'BPTUMAUSDC',
      tokens: [
        {
          address: '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828',
          weight: '0.5',
          symbol: 'UMA'
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          weight: '0.5',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828/logo.png',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    }
  },
  {
    address: '0x57d40FF4cF7441A04A05628911F57bb940B6C238',
    network: Network.MAINNET,
    pool: {
      id: '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      address: '0xFeadd389a5c427952D8fdb8057D6C8ba1156cC56',
      poolType: PoolType.Stable,
      symbol: 'staBAL3-BTC',
      tokens: [
        {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          weight: 'null',
          symbol: 'WBTC'
        },
        {
          address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
          weight: 'null',
          symbol: 'renBTC'
        },
        {
          address: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
          weight: 'null',
          symbol: 'sBTC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D/logo.png',
      '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6.png'
    }
  },
  {
    address: '0xa57453737849A4029325dfAb3F6034656644E104',
    network: Network.MAINNET,
    pool: {
      id: '0x17ddd9646a69c9445cd8a9f921d4cd93bf50d108000200000000000000000159',
      address: '0x17dDd9646a69C9445CD8A9f921d4cD93BF50D108',
      poolType: PoolType.Weighted,
      symbol: '20WETH-80HAUS',
      tokens: [
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.2',
          symbol: 'WETH'
        },
        {
          address: '0xf2051511B9b121394FA75B8F7d4E7424337af687',
          weight: '0.8',
          symbol: 'HAUS'
        }
      ]
    },
    tokenLogoURIs: {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      '0xf2051511B9b121394FA75B8F7d4E7424337af687':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xf2051511b9b121394fa75b8f7d4e7424337af687.png'
    }
  },
  {
    address: '0xA6468eca7633246Dcb24E5599681767D27d1F978',
    network: Network.MAINNET,
    pool: {
      id: '0x92762b42a06dcdddc5b7362cfb01e631c4d44b40000200000000000000000182',
      address: '0x92762B42A06dCDDDc5B7362Cfb01E631c4D44B40',
      poolType: PoolType.Weighted,
      symbol: '50COW-50GNO',
      tokens: [
        {
          address: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
          weight: '0.5',
          symbol: 'GNO'
        },
        {
          address: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
          weight: '0.5',
          symbol: 'COW'
        }
      ]
    },
    tokenLogoURIs: {
      '0x6810e776880C02933D47DB1b9fc05908e5386b96':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6810e776880C02933D47DB1b9fc05908e5386b96/logo.png',
      '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab.png'
    }
  },
  {
    address: '0x158772F59Fe0d3b75805fC11139b46CBc89F70e5',
    network: Network.MAINNET,
    pool: {
      id: '0xde8c195aa41c11a0c4787372defbbddaa31306d2000200000000000000000181',
      address: '0xde8C195Aa41C11a0c4787372deFBbDdAa31306D2',
      poolType: PoolType.Weighted,
      symbol: '50COW-50WETH',
      tokens: [
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          weight: '0.5',
          symbol: 'WETH'
        },
        {
          address: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
          weight: '0.5',
          symbol: 'COW'
        }
      ]
    },
    tokenLogoURIs: {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB':
        'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab.png'
    }
  },
  {
    address: '0xc77E5645Dbe48d54afC06655e39D3Fe17eB76C1c',
    network: Network.ARBITRUM,
    pool: {
      id: '0xb340b6b1a34019853cb05b2de6ee8ffd0b89a008000100000000000000000036',
      address: '0xB340B6b1a34019853Cb05B2De6eE8ffD0B89a008',
      poolType: PoolType.Weighted,
      symbol: '33DPX-33RDPX-33WETH',
      tokens: [
        {
          address: '0x32Eb7902D4134bf98A28b963D26de779AF92A212',
          weight: '0.3333',
          symbol: 'RDPX'
        },
        {
          address: '0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55',
          weight: '0.3334',
          symbol: 'DPX'
        },
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.3333',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x32Eb7902D4134bf98A28b963D26de779AF92A212': '',
      '0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55': '',
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png'
    }
  },
  {
    address: '0x359EA8618c405023Fc4B98dAb1B01F373792a126',
    network: Network.ARBITRUM,
    pool: {
      id: '0x64541216bafffeec8ea535bb71fbc927831d0595000100000000000000000002',
      address: '0x64541216bAFFFEec8ea535BB71Fbc927831d0595',
      poolType: PoolType.Weighted,
      symbol: 'B-33WETH-33WBTC-33USDC',
      tokens: [
        {
          address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          weight: '0.333333333333333333',
          symbol: 'WBTC'
        },
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.333333333333333334',
          symbol: 'WETH'
        },
        {
          address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
          weight: '0.333333333333333333',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f': '',
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png',
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png'
    }
  },
  {
    address: '0xB0de49429fBb80c635432bbAD0B3965b28560177',
    network: Network.ARBITRUM,
    pool: {
      id: '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f',
      address: '0x5A5884FC31948D59DF2aEcCCa143dE900d49e1a3',
      poolType: PoolType.Stable,
      symbol: 'VST-USDC-USDT-DAI-BSP',
      tokens: [
        {
          address: '0x64343594Ab9b56e99087BfA6F2335Db24c2d1F17',
          weight: 'null',
          symbol: 'VST'
        },
        {
          address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
          weight: 'null',
          symbol: 'DAI'
        },
        {
          address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
          weight: 'null',
          symbol: 'USDT'
        },
        {
          address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
          weight: 'null',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x64343594Ab9b56e99087BfA6F2335Db24c2d1F17': '',
      '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1/logo.png',
      '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png',
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png'
    }
  },
  {
    address: '0x785F08fB77ec934c01736E30546f87B4daccBe50',
    network: Network.ARBITRUM,
    pool: {
      id: '0x1779900c7707885720d39aa741f4086886307e9e00020000000000000000004b',
      address: '0x1779900c7707885720d39aA741F4086886307e9E',
      poolType: PoolType.Weighted,
      symbol: '80MAGIC-20WETH',
      tokens: [
        {
          address: '0x539bdE0d7Dbd336b79148AA742883198BBF60342',
          weight: '0.8',
          symbol: 'MAGIC'
        },
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x539bdE0d7Dbd336b79148AA742883198BBF60342': '',
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png'
    }
  },
  {
    address: '0x899F737750db562b88c1E412eE1902980D3a4844',
    network: Network.ARBITRUM,
    pool: {
      id: '0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac000200000000000000000017',
      address: '0xc2F082d33b5B8eF3A7E3de30da54EFd3114512aC',
      poolType: PoolType.Weighted,
      symbol: 'B-80PICKLE-20WETH',
      tokens: [
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.2',
          symbol: 'WETH'
        },
        {
          address: '0x965772e0E9c84b6f359c8597C891108DcF1c5B1A',
          weight: '0.8',
          symbol: 'PICKLE'
        }
      ]
    },
    tokenLogoURIs: {
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png',
      '0x965772e0E9c84b6f359c8597C891108DcF1c5B1A': ''
    }
  },
  {
    address: '0x435272180a4125f3B47c92826F482FC6cc165958',
    network: Network.ARBITRUM,
    pool: {
      id: '0x651e00ffd5ecfa7f3d4f33d62ede0a97cf62ede2000200000000000000000006',
      address: '0x651e00FfD5eCfA7F3d4F33d62eDe0a97Cf62EdE2',
      poolType: PoolType.Weighted,
      symbol: 'B-80LINK-20WETH',
      tokens: [
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.2',
          symbol: 'WETH'
        },
        {
          address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
          weight: '0.8',
          symbol: 'LINK'
        }
      ]
    },
    tokenLogoURIs: {
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png',
      '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4': ''
    }
  },
  {
    address: '0x3fDb6fB126521A28f06893F9629DA12f7B7266Eb',
    network: Network.ARBITRUM,
    pool: {
      id: '0x0adeb25cb5920d4f7447af4a0428072edc2cee2200020000000000000000004a',
      address: '0x0adeb25cb5920d4f7447af4a0428072EdC2cEE22',
      poolType: PoolType.Weighted,
      symbol: '80GMX-20WETH',
      tokens: [
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.2',
          symbol: 'WETH'
        },
        {
          address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
          weight: '0.8',
          symbol: 'GMX'
        }
      ]
    },
    tokenLogoURIs: {
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png',
      '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a/logo.png'
    }
  },
  {
    address: '0xF0ea3559Cf098455921d74173dA83fF2f6979495',
    network: Network.ARBITRUM,
    pool: {
      id: '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d',
      address: '0x0510cCF9eB3AB03C1508d3b9769E8Ee2CFd6FDcF',
      poolType: PoolType.Stable,
      symbol: 'MAI-BSP',
      tokens: [
        {
          address: '0x3F56e0c36d275367b8C502090EDF38289b3dEa0d',
          weight: 'null',
          symbol: 'MAI'
        },
        {
          address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
          weight: 'null',
          symbol: 'USDT'
        },
        {
          address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
          weight: 'null',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x3F56e0c36d275367b8C502090EDF38289b3dEa0d': '',
      '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png',
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png'
    }
  },
  {
    address: '0x6cb1A77AB2e54d4560fda893E9c738ad770da0B0',
    network: Network.ARBITRUM,
    pool: {
      id: '0xc61ff48f94d801c1ceface0289085197b5ec44f000020000000000000000004d',
      address: '0xC61ff48f94D801c1ceFaCE0289085197B5ec44F0',
      poolType: PoolType.Weighted,
      symbol: '50VSTA-50WETH',
      tokens: [
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.5',
          symbol: 'WETH'
        },
        {
          address: '0xa684cd057951541187f288294a1e1C2646aA2d24',
          weight: '0.5',
          symbol: 'VSTA'
        }
      ]
    },
    tokenLogoURIs: {
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png',
      '0xa684cd057951541187f288294a1e1C2646aA2d24': ''
    }
  },
  {
    address: '0x05e7732bF9ae5592E6AA05aFE8Cd80f7Ab0a7bEA',
    network: Network.ARBITRUM,
    pool: {
      id: '0xb28670b3e7ad27bd41fb5938136bf9e9cba90d6500020000000000000000001e',
      address: '0xb28670b3E7Ad27bd41Fb5938136BF9E9cBa90d65',
      poolType: PoolType.Weighted,
      symbol: 'B-80TCR-20WETH',
      tokens: [
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.2',
          symbol: 'WETH'
        },
        {
          address: '0xA72159FC390f0E3C6D415e658264c7c4051E9b87',
          weight: '0.8',
          symbol: 'TCR'
        }
      ]
    },
    tokenLogoURIs: {
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png',
      '0xA72159FC390f0E3C6D415e658264c7c4051E9b87': ''
    }
  },
  {
    address: '0xE0b50B0635b90F7021d2618f76AB9a31B92D0094',
    network: Network.ARBITRUM,
    pool: {
      id: '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016',
      address: '0x1533A3278f3F9141d5F820A184EA4B017fce2382',
      poolType: PoolType.Stable,
      symbol: 'B-staBAL-3',
      tokens: [
        {
          address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
          weight: 'null',
          symbol: 'DAI'
        },
        {
          address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
          weight: 'null',
          symbol: 'USDT'
        },
        {
          address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
          weight: 'null',
          symbol: 'USDC'
        }
      ]
    },
    tokenLogoURIs: {
      '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1/logo.png',
      '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png',
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png'
    }
  },
  {
    address: '0x981Fb05B738e981aC532a99e77170ECb4Bc27AEF',
    network: Network.ARBITRUM,
    pool: {
      id: '0x4a3a22a3e7fee0ffbb66f1c28bfac50f75546fc7000200000000000000000008',
      address: '0x4a3a22A3e7fee0FfBB66f1C28BfAC50f75546Fc7',
      poolType: PoolType.Weighted,
      symbol: 'B-80GNO-20WETH',
      tokens: [
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.2',
          symbol: 'WETH'
        },
        {
          address: '0xa0b862F60edEf4452F25B4160F177db44DeB6Cf1',
          weight: '0.8',
          symbol: 'GNO'
        }
      ]
    },
    tokenLogoURIs: {
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png',
      '0xa0b862F60edEf4452F25B4160F177db44DeB6Cf1': ''
    }
  },
  {
    address: '0xf30dB0Ca4605e5115Df91B56BD299564dcA02666',
    network: Network.ARBITRUM,
    pool: {
      id: '0xb5b77f1ad2b520df01612399258e7787af63025d000200000000000000000010',
      address: '0xB5B77F1AD2B520df01612399258E7787aF63025D',
      poolType: PoolType.Weighted,
      symbol: 'MWP',
      tokens: [
        {
          address: '0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42',
          weight: '0.6',
          symbol: 'MCB'
        },
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.4',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42': '',
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png'
    }
  },
  {
    address: '0x6823DcA6D70061F2AE2AAA21661795A2294812bF',
    network: Network.ARBITRUM,
    pool: {
      id: '0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001',
      address: '0xcC65A812ce382aB909a11E434dbf75B34f1cc59D',
      poolType: PoolType.Weighted,
      symbol: 'B-60BAL-40WETH',
      tokens: [
        {
          address: '0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8',
          weight: '0.6',
          symbol: 'BAL'
        },
        {
          address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          weight: '0.4',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8': '',
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/logo.png'
    }
  },
  {
    address: '0xA5A0B6598B90d214eAf4d7a6b72d5a89C3b9A72c',
    network: Network.POLYGON,
    pool: {
      id: '0x0297e37f1873d2dab4487aa67cd56b58e2f27875000100000000000000000002',
      address: '0x0297e37f1873D2DAb4487Aa67cD56B58E2F27875',
      poolType: PoolType.Weighted,
      symbol: 'B-POLYBASE',
      tokens: [
        {
          address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
          weight: '0.25',
          symbol: 'WMATIC'
        },
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          weight: '0.25',
          symbol: 'USDC'
        },
        {
          address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          weight: '0.25',
          symbol: 'WETH'
        },
        {
          address: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
          weight: '0.25',
          symbol: 'BAL'
        }
      ]
    },
    tokenLogoURIs: {
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png',
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png',
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png',
      '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3': ''
    }
  },
  {
    address: '0x88D07558470484c03d3bb44c3ECc36CAfCF43253',
    network: Network.POLYGON,
    pool: {
      id: '0x03cd191f589d12b0582a99808cf19851e468e6b500010000000000000000000a',
      address: '0x03cD191F589d12b0582a99808cf19851E468E6B5',
      poolType: PoolType.Weighted,
      symbol: 'BPTC',
      tokens: [
        {
          address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
          weight: '0.333333333333333333',
          symbol: 'WBTC'
        },
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          weight: '0.333333333333333333',
          symbol: 'USDC'
        },
        {
          address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          weight: '0.333333333333333334',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6': '',
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png',
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png'
    }
  },
  {
    address: '0xC6FB8C72d3BD24fC4891C51c2cb3a13F49c11335',
    network: Network.POLYGON,
    pool: {
      id: '0x186084ff790c65088ba694df11758fae4943ee9e000200000000000000000032',
      address: '0x186084fF790C65088BA694Df11758faE4943EE9E',
      poolType: PoolType.Weighted,
      symbol: 'TELX-50TEL-50BAL',
      tokens: [
        {
          address: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
          weight: '0.5',
          symbol: 'BAL'
        },
        {
          address: '0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32',
          weight: '0.5',
          symbol: 'TEL'
        }
      ]
    },
    tokenLogoURIs: {
      '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3': '',
      '0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32/logo.png'
    }
  },
  {
    address: '0xE32080A12723e5b8f1b0cEd1F308FE2f9cF7e3c9',
    network: Network.POLYGON,
    pool: {
      id: '0x614b5038611729ed49e0ded154d8a5d3af9d1d9e00010000000000000000001d',
      address: '0x614b5038611729ed49e0dED154d8A5d3AF9D1D9E',
      poolType: PoolType.Weighted,
      symbol: 'BP-MTA',
      tokens: [
        {
          address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
          weight: '0.4',
          symbol: 'WMATIC'
        },
        {
          address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          weight: '0.2',
          symbol: 'WETH'
        },
        {
          address: '0xF501dd45a1198C2E1b5aEF5314A68B9006D842E0',
          weight: '0.4',
          symbol: 'MTA'
        }
      ]
    },
    tokenLogoURIs: {
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png',
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png',
      '0xF501dd45a1198C2E1b5aEF5314A68B9006D842E0': ''
    }
  },
  {
    address: '0xCBbd866835433C620059129aaf12EE9c59dbC0d7',
    network: Network.POLYGON,
    pool: {
      id: '0x7c9cf12d783821d5c63d8e9427af5c44bad92445000100000000000000000051',
      address: '0x7C9cF12d783821d5C63d8E9427aF5C44bAd92445',
      poolType: PoolType.Weighted,
      symbol: 'B-33AVAX-33WETH-33SOL',
      tokens: [
        {
          address: '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b',
          weight: '0.333333333333333333',
          symbol: 'AVAX'
        },
        {
          address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          weight: '0.333333333333333333',
          symbol: 'WETH'
        },
        {
          address: '0x7DfF46370e9eA5f0Bad3C4E29711aD50062EA7A4',
          weight: '0.333333333333333334',
          symbol: 'SOL'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b': '',
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png',
      '0x7DfF46370e9eA5f0Bad3C4E29711aD50062EA7A4': ''
    }
  },
  {
    address: '0xA6359EB485d23412EB40f1F0Dbd80e1A4Fe87e6b',
    network: Network.POLYGON,
    pool: {
      id: '0xc31a37105b94ab4efca1954a14f059af11fcd9bb000000000000000000000455',
      address: '0xc31A37105B94aB4eFCA1954A14f059Af11FCD9BB',
      poolType: PoolType.Stable,
      symbol: 'FRAX-UST-USDC-USDT-BSP',
      tokens: [
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          weight: 'null',
          symbol: 'USDC'
        },
        {
          address: '0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89',
          weight: 'null',
          symbol: 'FRAX'
        },
        {
          address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
          weight: 'null',
          symbol: 'USDT'
        },
        {
          address: '0xE6469Ba6D2fD6130788E0eA9C0a0515900563b59',
          weight: 'null',
          symbol: 'UST'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png',
      '0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89': '',
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/logo.png',
      '0xE6469Ba6D2fD6130788E0eA9C0a0515900563b59':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xE6469Ba6D2fD6130788E0eA9C0a0515900563b59/logo.png'
    }
  },
  {
    address: '0xb5ad7d6d6F92a77F47f98C28C84893FBccc94809',
    network: Network.POLYGON,
    pool: {
      id: '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068',
      address: '0x0d34e5dD4D8f043557145598E4e2dC286B35FD4f',
      poolType: PoolType.Stable,
      symbol: 'BPSP-TUSD',
      tokens: [
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          weight: 'null',
          symbol: 'USDC'
        },
        {
          address: '0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756',
          weight: 'null',
          symbol: 'TUSD'
        },
        {
          address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
          weight: 'null',
          symbol: 'DAI'
        },
        {
          address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
          weight: 'null',
          symbol: 'USDT'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png',
      '0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756': '',
      '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063/logo.png',
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/logo.png'
    }
  },
  {
    address: '0xFBf87D2C22d1d298298ab5b0Ec957583a2731d15',
    network: Network.POLYGON,
    pool: {
      id: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012',
      address: '0x06Df3b2bbB68adc8B0e302443692037ED9f91b42',
      poolType: PoolType.Stable,
      symbol: 'BPSP',
      tokens: [
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          weight: 'null',
          symbol: 'USDC'
        },
        {
          address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
          weight: 'null',
          symbol: 'DAI'
        },
        {
          address: '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
          weight: 'null',
          symbol: 'miMATIC'
        },
        {
          address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
          weight: 'null',
          symbol: 'USDT'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png',
      '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063/logo.png',
      '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xa3Fa99A148fA48D14Ed51d610c367C61876997F1/logo.png',
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/logo.png'
    }
  },
  {
    address: '0xc3bB46B8196C3F188c6A373a6C4Fde792CA78653',
    network: Network.POLYGON,
    pool: {
      id: '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366',
      address: '0xaF5E0B5425dE1F5a630A8cB5AA9D97B8141C908D',
      poolType: PoolType.MetaStable,
      symbol: 'B-stMATIC-STABLE',
      tokens: [
        {
          address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
          weight: 'null',
          symbol: 'WMATIC'
        },
        {
          address: '0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4',
          weight: 'null',
          symbol: 'stMATIC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png',
      '0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4': ''
    }
  },
  {
    address: '0xd27cb689083e97847Dc91C64Efc91C4445d46D47',
    network: Network.POLYGON,
    pool: {
      id: '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e',
      address: '0xFeadd389a5c427952D8fdb8057D6C8ba1156cC56',
      poolType: PoolType.Stable,
      symbol: 'BP-BTC-SP',
      tokens: [
        {
          address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
          weight: 'null',
          symbol: 'WBTC'
        },
        {
          address: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
          weight: 'null',
          symbol: 'renBTC'
        }
      ]
    },
    tokenLogoURIs: {
      '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6': '',
      '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501': ''
    }
  },
  {
    address: '0x211C27a32E686659566C3CEe6035c2343D823aab',
    network: Network.POLYGON,
    pool: {
      id: '0xcf354603a9aebd2ff9f33e1b04246d8ea204ae9500020000000000000000005a',
      address: '0xCF354603A9AEbD2Ff9f33E1B04246d8Ea204ae95',
      poolType: PoolType.Weighted,
      symbol: 'B-50WBTC-50WETH',
      tokens: [
        {
          address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
          weight: '0.5',
          symbol: 'WBTC'
        },
        {
          address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6': '',
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png'
    }
  },
  {
    address: '0x022A843fFeE5A6FE1646C980b94286ef0D05F759',
    network: Network.POLYGON,
    pool: {
      id: '0x5a6ae1fd70d04ba4a279fc219dfabc53825cb01d00020000000000000000020e',
      address: '0x5A6aE1fd70d04bA4a279FC219dfAbC53825cb01D',
      poolType: PoolType.Weighted,
      symbol: '20WETH-80BANK',
      tokens: [
        {
          address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          weight: '0.2',
          symbol: 'WETH'
        },
        {
          address: '0xDB7Cb471dd0b49b29CAB4a1C14d070f27216a0Ab',
          weight: '0.8',
          symbol: 'BANK'
        }
      ]
    },
    tokenLogoURIs: {
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png',
      '0xDB7Cb471dd0b49b29CAB4a1C14d070f27216a0Ab': ''
    }
  },
  {
    address: '0xDaE03Cd2ec908710E98ffc5f4Ff540Fe2c5C1e17',
    network: Network.POLYGON,
    pool: {
      id: '0xea4e073c8ac859f2994c07e627178719c8002dc00002000000000000000003dc',
      address: '0xEa4e073c8AC859f2994C07E627178719c8002dc0',
      poolType: PoolType.Weighted,
      symbol: '20WMATIC-80SAND',
      tokens: [
        {
          address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
          weight: '0.2',
          symbol: 'WMATIC'
        },
        {
          address: '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683',
          weight: '0.8',
          symbol: 'SAND'
        }
      ]
    },
    tokenLogoURIs: {
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png',
      '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683': ''
    }
  },
  {
    address: '0x45012035a728b0a9B344036e6bff6c775EE09769',
    network: Network.POLYGON,
    pool: {
      id: '0x10f21c9bd8128a29aa785ab2de0d044dcdd79436000200000000000000000059',
      address: '0x10f21C9bD8128a29Aa785Ab2dE0d044DCdd79436',
      poolType: PoolType.Weighted,
      symbol: 'B-50WETH-50USDC',
      tokens: [
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          weight: '0.5',
          symbol: 'USDC'
        },
        {
          address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          weight: '0.5',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png',
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png'
    }
  },
  {
    address: '0x5A3970E3145Bbba4838D1a3A31C79bcD35A16A9E',
    network: Network.POLYGON,
    pool: {
      id: '0x36128d5436d2d70cab39c9af9cce146c38554ff0000100000000000000000008',
      address: '0x36128D5436d2d70cab39C9AF9CcE146C38554ff0',
      poolType: PoolType.Weighted,
      symbol: 'B-POLYDEFI',
      tokens: [
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          weight: '0.2',
          symbol: 'USDC'
        },
        {
          address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
          weight: '0.2',
          symbol: 'LINK'
        },
        {
          address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          weight: '0.2',
          symbol: 'WETH'
        },
        {
          address: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
          weight: '0.2',
          symbol: 'BAL'
        },
        {
          address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
          weight: '0.2',
          symbol: 'AAVE'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png',
      '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39/logo.png',
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png',
      '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3': '',
      '0xD6DF932A45C0f255f85145f286eA0b292B21C90B':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xD6DF932A45C0f255f85145f286eA0b292B21C90B/logo.png'
    }
  },
  {
    address: '0xAb6efd2882BB25c732Bf0A5f8d98BE752f0DdAAF',
    network: Network.POLYGON,
    pool: {
      id: '0x805ca3ccc61cc231851dee2da6aabff0a7714aa7000200000000000000000361',
      address: '0x805cA3cCC61cc231851DEE2Da6aABFF0a7714aa7',
      poolType: PoolType.Weighted,
      symbol: 'BAL-VISION-LP',
      tokens: [
        {
          address: '0x034b2090b579228482520c589dbD397c53Fc51cC',
          weight: '0.8',
          symbol: 'VISION'
        },
        {
          address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          weight: '0.2',
          symbol: 'WETH'
        }
      ]
    },
    tokenLogoURIs: {
      '0x034b2090b579228482520c589dbD397c53Fc51cC': '',
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png'
    }
  },
  {
    address: '0x6D73Df7aFC4e0144DeC3BE083dFA3882E53c5BA5',
    network: Network.POLYGON,
    pool: {
      id: '0xb204bf10bc3a5435017d3db247f56da601dfe08a0002000000000000000000fe',
      address: '0xb204BF10bc3a5435017D3db247f56dA601dFe08A',
      poolType: PoolType.Weighted,
      symbol: '20USDC-80THX',
      tokens: [
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          weight: '0.2',
          symbol: 'USDC'
        },
        {
          address: '0x2934b36ca9A4B31E633C5BE670C8C8b28b6aA015',
          weight: '0.8',
          symbol: 'THX'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png',
      '0x2934b36ca9A4B31E633C5BE670C8C8b28b6aA015': ''
    }
  },
  {
    address: '0x397649FF00de6d90578144103768aaA929EF683d',
    network: Network.POLYGON,
    pool: {
      id: '0xdb1db6e248d7bb4175f6e5a382d0a03fe3dcc813000100000000000000000035',
      address: '0xdB1db6E248d7Bb4175f6E5A382d0A03fe3DCc813',
      poolType: PoolType.Weighted,
      symbol: 'TELX-60TEL-20BAL-20USDC',
      tokens: [
        {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          weight: '0.2',
          symbol: 'USDC'
        },
        {
          address: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
          weight: '0.2',
          symbol: 'BAL'
        },
        {
          address: '0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32',
          weight: '0.6',
          symbol: 'TEL'
        }
      ]
    },
    tokenLogoURIs: {
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png',
      '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3': '',
      '0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32/logo.png'
    }
  },
  {
    address: '0xA80D514734e57691f45aF76bb44d1202858FD1F0',
    network: Network.POLYGON,
    pool: {
      id: '0xce66904b68f1f070332cbc631de7ee98b650b499000100000000000000000009',
      address: '0xce66904B68f1f070332Cbc631DE7ee98B650b499',
      poolType: PoolType.Weighted,
      symbol: 'B-POLYDEFI',
      tokens: [
        {
          address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
          weight: '0.25',
          symbol: 'LINK'
        },
        {
          address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          weight: '0.25',
          symbol: 'WETH'
        },
        {
          address: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
          weight: '0.25',
          symbol: 'BAL'
        },
        {
          address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
          weight: '0.25',
          symbol: 'AAVE'
        }
      ]
    },
    tokenLogoURIs: {
      '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39/logo.png',
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png',
      '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3': '',
      '0xD6DF932A45C0f255f85145f286eA0b292B21C90B':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xD6DF932A45C0f255f85145f286eA0b292B21C90B/logo.png'
    }
  }
];
