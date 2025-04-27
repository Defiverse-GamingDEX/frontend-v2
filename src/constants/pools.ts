import { Network } from '@defiverse/balancer-sdk';

import { isMainnet, networkId } from '@/composables/useNetwork';

//export const MIN_FIAT_VALUE_POOL_MIGRATION = isMainnet.value ? 100_000 : 1; // 100K USD or $1 for other networks

export const MIN_FIAT_VALUE_POOL_MIGRATION = isMainnet.value ? 100_000 : 1; // 100K USD or $1 for other networks

// Do not display APR values greater than this amount; they are likely to be nonsensical
// These can arise from pools with extremely low balances (e.g., completed LBPs)
export const APR_THRESHOLD = 1_000_000_000;

/**
 * For proportional exits from ComposableStable pools the ExactBPTInForTokensOut
 * exit type was removed. Therefore we have to use BPTInForExactTokensOut which
 * makes proportional exits using a user's total BPT balance impossible. In
 * order to 'fix' this we need to subtract a little bit from the bptIn value
 * when calculating the ExactTokensOut. The variable below is that "little bit".
 */
export const SHALLOW_COMPOSABLE_STABLE_BUFFER = 1e9; // EVM scale, so this is 1 Gwei

export type FactoryType =
  | 'oracleWeightedPool'
  | 'weightedPool'
  | 'stablePool'
  | 'managedPool'
  | 'liquidityBootstrappingPool'
  | 'boostedPool'
  | 'composableStablePool'
  | 'fx';

type PoolMetadata = {
  name: string;
  hasIcon: boolean;
};

export type NamedPools = {
  staBAL: string;
  bbAaveUSD: {
    v1: string;
    v2: string;
  };
  xMatic: {
    v1: string;
    v2: string;
  };
  stMatic: {
    v1: string;
    v2: string;
  };
  mai4: {
    mai4: string;
    maiBbaUsd: string;
  };
  veBAL: string;
};

export type Pools = {
  IdsMap: Partial<NamedPools>;
  Pagination: {
    PerPage: number;
    PerPool: number;
    PerPoolInitial: number;
  };
  DelegateOwner: string;
  ZeroAddress: string;
  DynamicFees: {
    Gauntlet: string[];
  };
  BlockList: string[];
  ExcludedPoolTypes: string[];
  Stable: {
    AllowList: string[];
  };
  Investment: {
    AllowList: string[];
  };
  Factories: Record<string, FactoryType>;
  Stakable: {
    AllowList: string[];
  };
  Metadata: Record<string, PoolMetadata>;
  DisabledJoins: string[];
  BrandedRedirect?: Record<string, string>;
  VerifiedPools?: string[];
};

const POOLS_GOERLI: Pools = {
  IdsMap: {
    staBAL:
      '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
    bbAaveUSD: {
      v1: '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
      v2: '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7',
    },
    veBAL: '0xf8a0623ab66f985effc1c69d05f1af4badb01b00000200000000000000000060',
  },
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [
    '0x22d398c68030ef6b1c55321cca6e0cecc5c93b2f000200000000000000000678',
  ],
  ExcludedPoolTypes: [
    'Element',
    'AaveLinear',
    'Linear',
    'ERC4626Linear',
    'FX',
    'Gyro2',
    'Gyro3',
    'GyroE',
    'HighAmpComposableStable',
  ],
  Stable: {
    AllowList: [
      '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
      '0xb60e46d90f2de35f7062a27d3a98749414036d5d000200000000000000000061',
      '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
      '0xc957b1acceb21707b782eb8eee2ed8e20088463d000200000000000000000076',
      '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7',
      '0x14f93df8a4e37bfdb49d2cec4789df7a010603d700000000000000000000011d',
      '0x00a62d31b6c776b6813543bc99ff265f7222dbe100000000000000000000011e',
      '0x0c925fce89a22e36ebd9b3c6e0262234e853d2f600000000000000000000019c',
      '0x1542b8783e5e884b6fe7422dd2f71a42c5edb86d0000000000000000000002f3',
    ],
  },
  Investment: {
    AllowList: [],
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0x44afeb87c871d8fea9398a026dea2bd3a13f5769': 'stablePool',
    '0xa55f73e2281c60206ba43a3590db07b8955832be': 'stablePool', // Metastable
    '0xb48cc42c45d262534e46d5965a9ac496f1b7a830': 'liquidityBootstrappingPool',
    '0xb0c726778c3ae4b3454d85557a48e8fa502bdd6a': 'liquidityBootstrappingPool', // LBP (zero protocol fee)
    '0x41e9036ae350baedcc7107760a020dca3c0731ec': 'boostedPool',
    '0xb848f50141f3d4255b37ac288c25c109104f2158': 'composableStablePool',
    '0x94f68b54191f62f781fe8298a8a5fa3ed772d227': 'weightedPool', // weighted pool v2
  },
  Stakable: {
    AllowList: [
      '0x16faf9f73748013155b7bc116a3008b57332d1e600020000000000000000005b',
      '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
      '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
      '0x67f8fcb9d3c463da05de1392efdbb2a87f8599ea000200000000000000000059',
    ],
  },
  Metadata: {
    '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f': {
      name: 'Balancer Boosted Aave USD',
      hasIcon: false,
    },
  },
  DisabledJoins: [],
};

const POOLS_MAINNET: Pools = {
  IdsMap: {
    staBAL:
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
    bbAaveUSD: {
      v1: '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe',
      v2: '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
    },
    veBAL: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
  },
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [''],
  ExcludedPoolTypes: [
    'Element',
    'AaveLinear',
    'Linear',
    'ERC4626Linear',
    'Gyro2',
    'Gyro3',
    'GyroE',
    'FX',
    'HighAmpComposableStable',
  ],
  Stable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063', // staBAL3 (DAI-USD-USDC)
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066', // WBTC-renBTC-sBTC
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c719100000000000000000000006e', // PAR-sEUR-EURS
      '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080', // Lido Metastable
      '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112', // Rocket Pool Metastable
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe', // Mainnet bb-a-USD
      '0x851523a36690bf267bbfec389c823072d82921a90002000000000000000001ed', // wstETH/WETH #2
      '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249', // b-auraBAL-Stable (auraBal / 8020 BALETH)
      '0x2d011adf89f0576c9b722c28269fcb5d50c2d17900020000000000000000024d', // sdBAL Stable Pool (sdBAL / 8020 BALETH)
      '0x178e029173417b1f9c8bc16dcec6f697bc32374600000000000000000000025d', // Fiat DAO Stable Pool
      '0xf93579002dbe8046c43fefe86ec78b1112247bb80000000000000000000002bc', // USDD 3 pool
      '0xf3aeb3abba741f0eece8a1b1d2f11b85899951cb000200000000000000000351', // MAI stable pool
      '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d', // bb-a-USD V2
      '0x5b3240b6be3e7487d61cd1afdfc7fe4fa1d81e6400000000000000000000037b', // DOLA/INV stable pool
      '0x2ba7aa2213fa2c909cd9e46fed5a0059542b36b00000000000000000000003a3', // TUSD/bbausd
      '0x6a9603e481fb8f2c09804ea9adab49a338855b900000000000000000000003a8', // Balancer graviAURA Stable Pool
      '0x8e85e97ed19c0fa13b2549309965291fbbc0048b0000000000000000000003ba', // staked frax/rocket/wsteth
      '0xac976bb42cb0c85635644e8c7c74d0e0286aa61c0000000000000000000003cb', // fiat/bbausd
      '0xc9c5ff67bb2fae526ae2467c359609d6bcb4c5320000000000000000000003cc', // qeth/eth tranchess
      '0x4edcb2b46377530bc18bb4d2c7fe46a992c73e100000000000000000000003ec', // cbETH/wstETH
      '0x53bc3cba3832ebecbfa002c12023f8ab1aa3a3a0000000000000000000000411', // TUSD/bb-a-usd
      '0x4c8d2e60863e8d7e1033eda2b3d84e92a641802000000000000000000000040f', // FRAX/aave-usdc
      '0x9c6d47ff73e0f5e51be5fd53236e3f595c5793f200020000000000000000042c', // cbeth/wsteth stable
      '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6000200000000000000000426', // dola/usdc stable
      '0x384f67aa430376efc4f8987eabf7f3f84eb9ea5d00020000000000000000043d', // dola/cusd stable
      '0x8a34b5ad76f528bfec06c80d85ef3b53da7fc30000020000000000000000043e', // ankrETH/weth stable
      '0x961764651931941f23cea5bab246607dc19ef224000200000000000000000444', // tetubal
      '0xb08885e6026bab4333a80024ec25a1a3e1ff2b8a000200000000000000000445', // rETH (stafi ETH)/weth
      '0x831261f44931b7da8ba0dcc547223c60bb75b47f000200000000000000000460', // wUSDR/USDC stable pool
      '0x5aee1e99fe86960377de9f88689616916d5dcabe000000000000000000000467', // sfrxeth/wsteth/reth (v3)
      '0x50cf90b954958480b8df7958a9e965752f62712400000000000000000000046f', // bbeusd
      '0x133d241f225750d2c92948e464a5a80111920331000000000000000000000476', // dola/bbeusd
      '0x00c2a4be503869fa751c2dbcb7156cc970b5a8da000000000000000000000477', // euler-frax/euler-usdc
      '0x3dbb8d974b82e82ce79c20c0f5995f4f1f533ede000000000000000000000470', // zUSD-bb-e-USD
    ],
  },
  Investment: {
    AllowList: [
      '0xccf5575570fac94cec733a58ff91bb3d073085c70002000000000000000000af', // iROBOT mainnet
      '0xe7b1d394f3b40abeaa0b64a545dbcf89da1ecb3f00010000000000000000009a', // Techemy mainnet
      '0x3b40d7d5ae25df2561944dd68b252016c4c7b2800001000000000000000000c2', // WSB-DEFI mainnet
    ],
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0x67d27634e44793fe63c467035e31ea8635117cd4': 'stablePool', // Metastable
    '0x751a0bc0e3f75b38e01cf25bfce7ff36de1c87de': 'liquidityBootstrappingPool', // Mainnet LBP
    '0x0f3e0c4218b7b0108a3643cfe9d3ec0d4f57c54e': 'liquidityBootstrappingPool', // Mainnet LBP (zero protocol fee)
    '0x48767f9f868a4a7b86a90736632f6e44c2df7fa9': 'managedPool', // Mainnet Managed
    '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'boostedPool', // mainnet stablephantom
    '0x8df6efec5547e31b0eb7d1291b511ff8a2bf987c': 'stablePool', // stable pool v2
    '0xf9ac7b9df2b3454e841110cce5550bd5ac6f875f': 'composableStablePool', // ComposableStable
    '0xcc508a455f5b0073973107db6a878ddbdab957bc': 'weightedPool', // weighted pool v2
    '0xdba127fbc23fb20f5929c546af220a991b5c6e01': 'composableStablePool',
    '0x5dd94da3644ddd055fcf6b3e1aa310bb7801eb8b': 'weightedPool', // weighted pool v3
  },
  Stakable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
      '0x072f14b85add63488ddad88f855fda4a99d6ac9b000200000000000000000027',
      '0x0b09dea16768f0799065c475be02919503cb2a3500020000000000000000001a',
      '0x186084ff790c65088ba694df11758fae4943ee9e000200000000000000000013',
      '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112',
      '0x27c9f71cc31464b906e0006d4fcbc8900f48f15f00020000000000000000010f',
      '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080',
      '0x350196326aeaa9b98f1903fb5e8fc2686f85318c000200000000000000000084',
      '0x3e5fa9518ea95c3e533eb377c001702a9aacaa32000200000000000000000052',
      '0x51735bdfbfe3fc13dea8dc6502e2e958989429610002000000000000000000a0',
      '0x5d66fff62c17d841935b60df5f07f6cf79bd0f4700020000000000000000014c',
      '0x5f7fa48d765053f8dd85e052843e12d23e3d7bc50002000000000000000000c0',
      '0x702605f43471183158938c1a3e5f5a359d7b31ba00020000000000000000009f',
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe',
      '0x7edde0cb05ed19e03a9a47cd5e53fc57fde1c80c0002000000000000000000c8',
      '0x8f4205e1604133d1875a3e771ae7e4f2b086563900020000000000000000010e',
      '0x90291319f1d4ea3ad4db0dd8fe9e12baf749e84500020000000000000000013c',
      '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019',
      '0x96ba9025311e2f47b840a1f68ed57a3df1ea8747000200000000000000000160',
      '0xa02e4b3d18d4e6b8d18ac421fbc3dfff8933c40a00020000000000000000004b',
      '0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e',
      '0xbaeec99c90e3420ec6c1e7a769d2a856d2898e4d00020000000000000000008a',
      '0xbf96189eee9357a95c7719f4f5047f76bde804e5000200000000000000000087',
      '0xe2469f47ab58cf9cf59f9822e3c5de4950a41c49000200000000000000000089',
      '0xe99481dc77691d8e2456e5f3f61c1810adfc1503000200000000000000000018',
      '0xec60a5fef79a92c741cb74fdd6bfc340c0279b01000200000000000000000015',
      '0xedf085f65b4f6c155e13155502ef925c9a756003000200000000000000000123',
      '0xefaa1604e82e1b3af8430b90192c1b9e8197e377000200000000000000000021',
      '0xf4c0dd9b82da36c07605df83c8a416f11724d88b000200000000000000000026',
      '0xf5aaf7ee8c39b651cebf5f1f50c10631e78e0ef9000200000000000000000069',
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      '0x92762b42a06dcdddc5b7362cfb01e631c4d44b40000200000000000000000182',
      '0xde8c195aa41c11a0c4787372defbbddaa31306d2000200000000000000000181',
      '0x17ddd9646a69c9445cd8a9f921d4cd93bf50d108000200000000000000000159',
      '0xc45d42f801105e861e86658648e3678ad7aa70f900010000000000000000011e',
      '0x2d344a84bac123660b021eebe4eb6f12ba25fe8600020000000000000000018a',
      '0xb460daa847c45f1c4a41cb05bfb3b51c92e41b36000200000000000000000194',
      '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7000200000000000000000163',
      '0x851523a36690bf267bbfec389c823072d82921a90002000000000000000001ed',
      '0xe8cc7e765647625b95f59c15848379d10b9ab4af0002000000000000000001de',
      '0x85370d9e3bb111391cc89f6de344e801760461830002000000000000000001ef',
      '0xa7ff759dbef9f3efdd1d59beee44b966acafe214000200000000000000000180',
      '0x3f7c10701b14197e2695dec6428a2ca4cf7fc3b800020000000000000000023c',
      '0x2d011adf89f0576c9b722c28269fcb5d50c2d17900020000000000000000024d',
      '0x178e029173417b1f9c8bc16dcec6f697bc32374600000000000000000000025d',
      '0xcfca23ca9ca720b6e98e3eb9b6aa0ffc4a5c08b9000200000000000000000274',
      '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249',
      '0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269',
      '0x8eb6c82c3081bbbd45dcac5afa631aac53478b7c000100000000000000000270',
      '0x1b65fe4881800b91d4277ba738b567cbb200a60d0002000000000000000002cc',
      '0x99a14324cfd525a34bbc93ac7e348929909d57fd00020000000000000000030e',
      '0x9b532ab955417afd0d012eb9f7389457cd0ea712000000000000000000000338',
      '0x48607651416a943bf5ac71c41be1420538e78f87000200000000000000000327',
      '0x6a5ead5433a50472642cd268e584dafa5a394490000200000000000000000366',
      '0x0fd5663d4893ae0d579d580584806aadd2dd0b8b000200000000000000000367',
      '0x441b8a1980f2f2e43a9397099d15cc2fe6d3625000020000000000000000035f',
      '0xf3aeb3abba741f0eece8a1b1d2f11b85899951cb000200000000000000000351',
      '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d',
      '0x496ff26b76b8d23bbc6cf1df1eee4a48795490f7000200000000000000000377',
      '0x5b3240b6be3e7487d61cd1afdfc7fe4fa1d81e6400000000000000000000037b',
      '0x334c96d792e4b26b841d28f53235281cec1be1f200020000000000000000038a',
      '0x25accb7943fd73dda5e23ba6329085a3c24bfb6a000200000000000000000387',
      '0xae7bfd6fa54259fc477879712eebe34164d3a84f000200000000000000000376',
      '0xe340ebfcaa544da8bb1ee9005f1a346d50ec422e000200000000000000000396',
      '0x4ce0bd7debf13434d3ae127430e9bd4291bfb61f00020000000000000000038b',
      '0x8e85e97ed19c0fa13b2549309965291fbbc0048b0000000000000000000003ba',
      '0x173063a30e095313eee39411f07e95a8a806014e0002000000000000000003ab',
      '0x8167a1117691f39e05e9131cfa88f0e3a620e96700020000000000000000038c',
      '0x798b112420ad6391a4129ac25ef59663a44c88bb0002000000000000000003f4',
      '0x798b112420ad6391a4129ac25ef59663a44c88bb0002000000000000000003f4',
      '0x5512a4bbe7b3051f92324bacf25c02b9000c4a500001000000000000000003d7',
      '0x4edcb2b46377530bc18bb4d2c7fe46a992c73e100000000000000000000003ec',
      '0xd1ec5e215e8148d76f4460e4097fd3d5ae0a35580002000000000000000003d3',
      '0x76fcf0e8c7ff37a47a799fa2cd4c13cde0d981c90002000000000000000003d2',
      '0xc9c5ff67bb2fae526ae2467c359609d6bcb4c5320000000000000000000003cc',
      '0x9c6d47ff73e0f5e51be5fd53236e3f595c5793f200020000000000000000042c',
      '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6000200000000000000000426',
      '0xd590931466cdd6d488a25da1e89dd0539723800c00020000000000000000042b',
      '0x8a34b5ad76f528bfec06c80d85ef3b53da7fc30000020000000000000000043e',
    ],
  },
  Metadata: {
    '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe': {
      name: 'Balancer Boosted Aave USD',
      hasIcon: true,
    },
    '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d': {
      name: 'Balancer Boosted Aave USD',
      hasIcon: true,
    },
    '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063': {
      name: 'Balancer Stable USD',
      hasIcon: true,
    },
    '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249': {
      name: 'AuraBAL Stable Pool',
      hasIcon: false,
    },
  },
  DisabledJoins: [
    '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
    '0xad6a8c18b62eb914604ec1eec7fbcf132799fe090001000000000000000003f6',
    '0x5b3240b6be3e7487d61cd1afdfc7fe4fa1d81e6400000000000000000000037b',
  ],
};

const POOLS_POLYGON: Pools = {
  IdsMap: {
    xMatic: {
      v1: '0xc17636e36398602dd37bb5d1b3a9008c7629005f0002000000000000000004c4',
      v2: '0xb20fc01d21a50d2c734c4a1262b4404d41fa7bf000000000000000000000075c',
    },
    stMatic: {
      v1: '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366',
      v2: '0x8159462d255c1d24915cb51ec361f700174cd99400000000000000000000075d',
    },
    mai4: {
      mai4: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012',
      maiBbaUsd:
        '0xb54b2125b711cd183edd3dd09433439d5396165200000000000000000000075e',
    },
  },
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [''],
  ExcludedPoolTypes: [
    'Element',
    'AaveLinear',
    'Linear',
    'ERC4626Linear',
    'Gyro2',
    'Gyro3',
    'GyroE',
    'FX',
    'HighAmpComposableStable',
  ],
  Stable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012', // polygon MAI/DAI/USDC/USDT
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e', // polygon WBTC/renBTC
      '0xf38cf113d2d4f60c36cbd95af2f48a9a0167045a00000000000000000000005b', // polygon,
      '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068', // tusd polygon
      '0x5028497af0c9a54ea8c6d42a054c0341b9fc616800020000000000000000007b', // dusd polygon
      '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366', // polygon staked matic
      '0xc31a37105b94ab4efca1954a14f059af11fcd9bb000000000000000000000455', // 4pool
      '0xc17636e36398602dd37bb5d1b3a9008c7629005f0002000000000000000004c4', // maticx metastable
      '0xb4b22bd6cdad0ab828be6f8a4086dfa54e9b373600020000000000000000058f', // Polygon tetuBAL-80BAL-20WETH
      '0xb797adfb7b268faeaa90cadbfed464c76ee599cd0002000000000000000005ba', // tetuBAL-80BAL-20WETH V2 (with short name)
      '0x0b8319061732b34cab22445fa83b81f950e4b7ed000000000000000000000709',
      '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366',
      '0x8159462d255c1d24915cb51ec361f700174cd99400000000000000000000075d',
      '0xb20fc01d21a50d2c734c4a1262b4404d41fa7bf000000000000000000000075c',
      '0xb54b2125b711cd183edd3dd09433439d5396165200000000000000000000075e', // mai / bb-am-USD
      '0x48e6b98ef6329f8f0a30ebb8c7c960330d64808500000000000000000000075b', // bb-am-USD
      '0xa48d164f6eb0edc68bd03b56fa59e12f24499ad10000000000000000000007c4', // ageur stable
      '0x2d46979fd4c5f7a04f65111399cff3da2dab5bd9000000000000000000000807', // ankr stable
      '0x47401399b2eca91930c99126df20a11531f99465000000000000000000000840', // 3brl pool
      '0x76afd126f46ab4fdf2ece8b1a2c149f7cf95d9fb00000000000000000000085c', // 2cad
      '0x92bc61bd96f275ea5507a3e1e5fbf0bc69cc98dc00000000000000000000085d', // 2sgd
      '0x7d60a4cb5ca92e2da965637025122296ea6854f900000000000000000000085e', // 2eur par
      '0x94970a3f6a6aab442aefad68ff57abec0b9e3c0100000000000000000000085f', // 2eur eurt
      '0x7913e4c8d00044689ff5c7c12d2f1b4a2fde4994000000000000000000000860', // 2eur eure
      '0x7982c1b61abdc36942301ff2377d92b43784f120000000000000000000000861', // 2try
      '0x7f408fbcfc88917bff6a79b0ed0646fa090627de000000000000000000000863', // 2jpy
      '0x9e0a3a9b5a4e0b6dc299a56ef19002f23842be8d000000000000000000000862', // 2mxn
      '0x05f21bacc4fd8590d1eaca9830a64b66a733316c00000000000000000000087e', // tetuQI
      '0x02d2e2d7a89d6c5cb3681cfcb6f7dac02a55eda400000000000000000000088f', // csMatic
      '0xe22483774bd8611be2ad2f4194078dac9159f4ba0000000000000000000008f0', // 2BRL
      '0xbf29ef6e23af0ac5b6bf931c8b3f1080f5bc120600000000000000000000091f', // vQi stable
      '0x34a81e8956bf20b7448b31990a2c06f96830a6e4000200000000000000000a14', // wUSDR
      '0x5dee84ffa2dc27419ba7b3419d7146e53e4f7ded000200000000000000000a4e', // frxETH / WETH
    ],
  },
  Investment: {
    AllowList: [''],
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'stablePool', // Metastable
    '0x751a0bc0e3f75b38e01cf25bfce7ff36de1c87de': 'liquidityBootstrappingPool', // LBP
    '0x41b953164995c11c81da73d212ed8af25741b7ac': 'liquidityBootstrappingPool', // LBP (zero protocol fee)
    '0x0f7bb7ce7b6ed9366f9b6b910adefe72dc538193': 'managedPool', // Polygon Managed
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25': 'boostedPool', // polygon stablephantom
    '0xca96c4f198d343e251b1a01f3eba061ef3da73c1': 'stablePool', // stable pool v2,
    '0x136fd06fa01ecf624c7f2b3cb15742c1339dc2c4': 'composableStablePool', // ComposableStable
    '0x0e39c3d9b2ec765efd9c5c70bb290b1fcd8536e3': 'weightedPool', // weighted pool v2
    '0x7bc6c0e73edaa66ef3f6e2f27b0ee8661834c6c9': 'composableStablePool', // ComposableStable V3
    '0x82e4cFaef85b1B6299935340c964C942280327f4': 'weightedPool', // weighted pool v3
    '0x627d759314d5c4007b461a74ebafa7ebc5dfed71': 'fx', // fx
  },
  Stakable: {
    AllowList: [
      '0x0297e37f1873d2dab4487aa67cd56b58e2f27875000100000000000000000002',
      '0x03cd191f589d12b0582a99808cf19851e468e6b500010000000000000000000a',
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012',
      '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068',
      '0x10f21c9bd8128a29aa785ab2de0d044dcdd79436000200000000000000000059',
      '0x186084ff790c65088ba694df11758fae4943ee9e000200000000000000000032',
      '0x36128d5436d2d70cab39c9af9cce146c38554ff0000100000000000000000008',
      '0x5a6ae1fd70d04ba4a279fc219dfabc53825cb01d00020000000000000000020e',
      '0x614b5038611729ed49e0ded154d8a5d3af9d1d9e00010000000000000000001d',
      '0x7c9cf12d783821d5c63d8e9427af5c44bad92445000100000000000000000051',
      '0x805ca3ccc61cc231851dee2da6aabff0a7714aa7000200000000000000000361',
      '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366',
      '0xb204bf10bc3a5435017d3db247f56da601dfe08a0002000000000000000000fe',
      '0xc31a37105b94ab4efca1954a14f059af11fcd9bb000000000000000000000455',
      '0xce66904b68f1f070332cbc631de7ee98b650b499000100000000000000000009',
      '0xcf354603a9aebd2ff9f33e1b04246d8ea204ae9500020000000000000000005a',
      '0xdb1db6e248d7bb4175f6e5a382d0a03fe3dcc813000100000000000000000035',
      '0xea4e073c8ac859f2994c07e627178719c8002dc00002000000000000000003dc',
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e',
      '0xc17636e36398602dd37bb5d1b3a9008c7629005f0002000000000000000004c4',
      '0x2dbc9ab0160087ae59474fb7bed95b9e808fa6bc0001000000000000000003db',
      '0xb797adfb7b268faeaa90cadbfed464c76ee599cd0002000000000000000005ba',
      '0x8f9dd2064eb38e8e40f2ab67bde27c0e16ea9b080002000000000000000004ca',
      '0x48e6b98ef6329f8f0a30ebb8c7c960330d64808500000000000000000000075b',
      '0xb54b2125b711cd183edd3dd09433439d5396165200000000000000000000075e',
      '0x8159462d255c1d24915cb51ec361f700174cd99400000000000000000000075d',
      '0xb20fc01d21a50d2c734c4a1262b4404d41fa7bf000000000000000000000075c',
      '0x8ac5fafe2e52e52f5352aec64b64ff8b305e1d4a0002000000000000000007ab',
      '0x05f21bacc4fd8590d1eaca9830a64b66a733316c00000000000000000000087e',
      '0x4973f591784d9c94052a6c3ebd553fcd37bb0e5500020000000000000000087f',
      '0xe2f706ef1f7240b803aae877c9c762644bb808d80002000000000000000008c2',
      '0x4a0b73f0d13ff6d43e304a174697e3d5cfd310a400020000000000000000091c',
      '0xe22483774bd8611be2ad2f4194078dac9159f4ba0000000000000000000008f0',
      '0xa48d164f6eb0edc68bd03b56fa59e12f24499ad10000000000000000000007c4',
      '0x7d60a4cb5ca92e2da965637025122296ea6854f900000000000000000000085e',
      '0x34a81e8956bf20b7448b31990a2c06f96830a6e4000200000000000000000a14',
    ],
  },
  Metadata: {
    '0x48e6b98ef6329f8f0a30ebb8c7c960330d64808500000000000000000000075b': {
      name: 'Balancer Boosted Aave USD (Polygon)',
      hasIcon: true,
    },
  },
  DisabledJoins: [
    '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e',
    '0xb54b2125b711cd183edd3dd09433439d5396165200000000000000000000075e',
  ],
  BrandedRedirect: {
    '0x726e324c29a1e49309672b244bdc4ff62a270407000200000000000000000702':
      'xave',
  },
};

const POOLS_ARBITRUM: Pools = {
  IdsMap: {},
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [''],
  ExcludedPoolTypes: [
    'Element',
    'AaveLinear',
    'Linear',
    'ERC4626Linear',
    'FX',
    'Gyro2',
    'Gyro3',
    'GyroE',
    'HighAmpComposableStable',
  ],
  Stable: {
    AllowList: [
      '0x9be7de742865d021c0e8fb9d64311b2c040c1ec1000200000000000000000012', // arbitrum
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016', // arbitrum
      '0x386b5d43ba8b97c43d4afb4cdae7877a1b295e8a000000000000000000000020', // tusd arbitrum
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d', // mai
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f', // VST
      '0xd89746affa5483627a87e55713ec1905114394950002000000000000000000bf', // fluid stable
      '0x7bceaa9c5e7f4836fec3bce2d5346637c9b13970000000000000000000000102', // vesta new stable
      '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c000000000000000000000159', // stETH
      '0x36bf227d6bac96e2ab1ebb5492ecec69c691943f000200000000000000000316', // wsteth/weth stable
      '0x077794c30afeccdf5ad2abc0588e8cee7197b71a000000000000000000000352', // bbrfusd
    ],
  },
  Investment: {
    AllowList: [''],
  },
  Factories: {
    '0x7dfdef5f355096603419239ce743bfaf1120312b': 'weightedPool', // Arbitrum Weighted
    '0xcf0a32bbef8f064969f21f7e02328fb577382018': 'weightedPool', // Arbitrum WeightedOracle
    '0x2433477a10fc5d31b9513c638f19ee85caed53fd': 'stablePool', // Arbitrum Stable
    '0xebfd5681977e38af65a7487dc70b8221d089ccad': 'stablePool', // Arbitrum MetaStable
    '0x142b9666a0a3a30477b052962dda81547e7029ab': 'liquidityBootstrappingPool', // Arbitrum LBP (old)
    '0x1802953277fd955f9a254b80aa0582f193cf1d77': 'liquidityBootstrappingPool', // Arbitrum LBP (new)
    '0xacd615b3705b9c880e4e7293f1030b34e57b4c1c': 'managedPool', // arbitrum managed
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'boostedPool', // arbitrum stablephantom
    '0xef44d6786b2b4d544b7850fe67ce6381626bf2d6': 'stablePool', // stable pool v2
    '0xaeb406b0e430bf5ea2dc0b9fe62e4e53f74b3a33': 'composableStablePool', // ComposableStable
    '0x8df6efec5547e31b0eb7d1291b511ff8a2bf987c': 'weightedPool', // weighted pool v2
    '0x1c99324edc771c82a0dccb780cc7dda0045e50e7': 'composableStablePool', // ComposableStable V3
    '0xf1665e19bc105be4edd3739f88315cc699cc5b65': 'weightedPool', // Weighted Pool V3
  },
  Stakable: {
    AllowList: [
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d',
      '0x0adeb25cb5920d4f7447af4a0428072edc2cee2200020000000000000000004a',
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016',
      '0x1779900c7707885720d39aa741f4086886307e9e00020000000000000000004b',
      '0x4a3a22a3e7fee0ffbb66f1c28bfac50f75546fc7000200000000000000000008',
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f',
      '0x64541216bafffeec8ea535bb71fbc927831d0595000100000000000000000002',
      '0x651e00ffd5ecfa7f3d4f33d62ede0a97cf62ede2000200000000000000000006',
      '0xb28670b3e7ad27bd41fb5938136bf9e9cba90d6500020000000000000000001e',
      '0xb340b6b1a34019853cb05b2de6ee8ffd0b89a008000100000000000000000036',
      '0xb5b77f1ad2b520df01612399258e7787af63025d000200000000000000000010',
      '0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac000200000000000000000017',
      '0xc61ff48f94d801c1ceface0289085197b5ec44f000020000000000000000004d',
      '0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001',
      '0xe1b40094f1446722c424c598ac412d590e0b3ffb000200000000000000000076',
      '0xb3028ca124b80cfe6e9ca57b70ef2f0ccc41ebd40002000000000000000000ba',
      '0x7bceaa9c5e7f4836fec3bce2d5346637c9b13970000000000000000000000102',
      '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c000000000000000000000159',
      '0x178e029173417b1f9c8bc16dcec6f697bc323746000200000000000000000158',
      '0x13f2f70a951fb99d48ede6e25b0bdf06914db33f00020000000000000000016b',
      '0xf93579002dbe8046c43fefe86ec78b1112247bb800020000000000000000021d',
      '0x36bf227d6bac96e2ab1ebb5492ecec69c691943f000200000000000000000316',
      '0x36bf227d6bac96e2ab1ebb5492ecec69c691943f000200000000000000000316',
    ],
  },
  Metadata: {},
  DisabledJoins: [],
};

const POOLS_GENERIC: Pools = {
  IdsMap: {},
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [''],
  ExcludedPoolTypes: [
    'Element',
    'AaveLinear',
    'Linear',
    'ERC4626Linear',
    'FX',
    'Gyro2',
    'Gyro3',
    'GyroE',
    'HighAmpComposableStable',
  ],
  Stable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c719100000000000000000000006e',
      '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080', // Lido Metastable
      '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112', // Rocket Pool Metastable
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012', // polygon
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e', // polygon
      '0x9be7de742865d021c0e8fb9d64311b2c040c1ec1000200000000000000000012', // arbitrum
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c7191000200000000000000000022', // polygon PAR/PAR,
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016', // arbitrum
      '0xf38cf113d2d4f60c36cbd95af2f48a9a0167045a00000000000000000000005b', // polygon,
      '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068', // tusd polygon
      '0x386b5d43ba8b97c43d4afb4cdae7877a1b295e8a000000000000000000000020', // tusd arbitrum
      '0x5028497af0c9a54ea8c6d42a054c0341b9fc616800020000000000000000007b', // dusd polygon
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe', // Mainnet bb-a-USD
      '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366', // staked matic
    ],
  },
  Investment: {
    AllowList: [
      '0xccf5575570fac94cec733a58ff91bb3d073085c70002000000000000000000af', // iROBOT mainnet
      '0xe7b1d394f3b40abeaa0b64a545dbcf89da1ecb3f00010000000000000000009a', // Techemy mainnet
      '0x3b40d7d5ae25df2561944dd68b252016c4c7b2800001000000000000000000c2', // WSB-DEFI mainnet
    ],
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0x67d27634e44793fe63c467035e31ea8635117cd4': 'stablePool', // Metastable
    '0x7dfdef5f355096603419239ce743bfaf1120312b': 'weightedPool', // Arbitrum Weighted
    '0xcf0a32bbef8f064969f21f7e02328fb577382018': 'weightedPool', // Arbitrum WeightedOracle
    '0x2433477a10fc5d31b9513c638f19ee85caed53fd': 'stablePool', // Arbitrum Stable
    '0xebfd5681977e38af65a7487dc70b8221d089ccad': 'stablePool', // Arbitrum MetaStable
    '0x751a0bc0e3f75b38e01cf25bfce7ff36de1c87de': 'liquidityBootstrappingPool', // Mainnet LBP
    '0x0f3e0c4218b7b0108a3643cfe9d3ec0d4f57c54e': 'liquidityBootstrappingPool', // Mainnet LBP (zero protocol fee)
    '0x142b9666a0a3a30477b052962dda81547e7029ab': 'liquidityBootstrappingPool', // Arbitrum LBP (old)
    '0x1802953277fd955f9a254b80aa0582f193cf1d77': 'liquidityBootstrappingPool', // Arbitrum LBP (new)
    '0x48767f9f868a4a7b86a90736632f6e44c2df7fa9': 'managedPool', // Mainnet Managed
    '0x0f7bb7ce7b6ed9366f9b6b910adefe72dc538193': 'managedPool', // Polygon Managed
    '0xacd615b3705b9c880e4e7293f1030b34e57b4c1c': 'managedPool', // arbitrum managed
    '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'boostedPool', // mainnet stablephantom
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'boostedPool', // arbitrum stablephantom
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25': 'boostedPool', // polygon stablephantom
  },
  Stakable: {
    AllowList: [],
  },
  Metadata: {
    '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe': {
      name: 'Balancer Boosted Aave USD',
      hasIcon: true,
    },
    '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8': {
      name: 'Balancer Boosted Aave USD',
      hasIcon: true,
    },
    '0xd387dfd3a786e7caa06e6cf0c675352c7ffff30400000000000000000000063e': {
      name: 'Balancer Stable USD',
      hasIcon: true,
    },
  },
  DisabledJoins: [],
};

const POOLS_DEFIVERSE: Pools = {
  IdsMap: {
    // staBAL:
    //   '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
    // bbAaveUSD: {
    //   v1: '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
    //   v2: '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7',
    // },
    // veBAL: '0x8ea93dfbe0c02aafdc8a9e6bfdd7efacdac8cca6000200000000000000000000',
  },
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [''],
  ExcludedPoolTypes: [
    'Element',
    'AaveLinear',
    'EulerLinear',
    'Linear',
    'ERC4626Linear',
    'FX',
    'Gyro2',
    'Gyro3',
    'GyroE',
    'HighAmpComposableStable',
  ],
  Stable: {
    AllowList: [
      // '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010', // bb-ag-usd
    ],
  },
  Investment: {
    AllowList: [],
  },
  Factories: {
    '0xd01ad3085fb3e1fbb2541b5b3326b1f47b189747': 'composableStablePool', // ComposableStable V3
    '0xd1920dd25e4998b0d7cc8de7f12beaf9796c7475': 'weightedPool', // WeightedPool V3
    '0xe952b0409e6768e270a671ebbc5b8605a7c5a0b8': 'weightedPool', // WeightedPool V3
    '0xc04ce4fe0f4013814ea1a4b0577d3678d5a7c91c': 'weightedPool', // WeightedPool V3
  },
  Stakable: {
    AllowList: [],
  },
  Metadata: {},
  DisabledJoins: [
    // '0x2c2832dc1e613c4fe8cd58de3b89de1759fdf589000200000000000000000003',
  ],
  VerifiedPools: [
    '0x4724b6bfe09a27ea04ada9c341997aa44cbddd8100020000000000000000000b',
    '0xb7411b0d472a0d44957e531dbdd691d5de5ae541000200000000000000000009',
    '0x1f712f57a0ad1dbde1accb4d60e3d62e2f51ff60000200000000000000000000',
    '0xaa497b8ddd92f3a8a82bca33f8adfc7d022d90ba000200000000000000000004',
    '0x202034abf8ce428ae8effb1214a65de398f2dd4b000200000000000000000006',
    '0x6e338b9dc0056cf26240f1d21273650bebee7a3a000200000000000000000008',
    '0x2c2832dc1e613c4fe8cd58de3b89de1759fdf589000200000000000000000003',
    '0x09397a516da489ce0c425130e66abc525d38ab9f000200000000000000000002',
    '0x1f79dbce2252bcfb75251f9cfeb11afddee40eb9000200000000000000000005',
    '0x11fc30b4f9ba7be402dfa3e04dc01f0bb4594af1000200000000000000000001',
  ],
};

const POOLS_DEFIVERSE_TESTNET: Pools = {
  IdsMap: {
    // staBAL:
    //   '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
    // bbAaveUSD: {
    //   v1: '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
    //   v2: '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7',
    // },
    // veBAL: '0xaa01a32965a072082dac7169b4c9457ce1508be5000200000000000000000001',
  },
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [
    '0xb3a6b8f5d07bae6dd664dbdf45432f78c819ab99000200000000000000000006',
    '0x6660752d8d3be08bf42fd0a9b14d7ff0244f37da00020000000000000000000b',
    '0x5e71ae56c64dee14fe78e31efcf2ee95f89fac45000200000000000000000007',
  ],
  ExcludedPoolTypes: [
    'Element',
    'AaveLinear',
    'EulerLinear',
    'Linear',
    'ERC4626Linear',
    'FX',
    'Gyro2',
    'Gyro3',
    'GyroE',
    'HighAmpComposableStable',
  ],
  Stable: {
    AllowList: [
      // '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010', // bb-ag-usd
      // '0xfd330fc06987835dff2d1d0787e81d717ae1acb000000000000000000000000b',
    ],
  },
  Investment: {
    AllowList: [
      // '0xd92e2e3c13c3712af12e4389ee37b67021318812000200000000000000000002',
    ],
  },
  Factories: {
    '0x58e6f99bb65378f47a520fc9630bd711f2cf3dc7': 'composableStablePool', // ComposableStable V3
    '0x48494fa9ead46ee8e3fcb66487a6dbbd34dcafe3': 'weightedPool', // WeightedPool V3
  },
  Stakable: {
    AllowList: [
      '0x20ecc9d85ac5e49af7f88ab4f6605d42a15d8ec6000000000000000000000000',
      '0xaa01a32965a072082dac7169b4c9457ce1508be5000200000000000000000001',
      '0xe815154dc2bb9cceee8054b01e99850b2a8c0d1e000200000000000000000002',
      '0x6797e1bc05285c51127bb9760d0a2df57bf6f0f0000200000000000000000003',
      '0xa646c5ce02ce3e91c882d7f7180d1519a76fe588000200000000000000000004',
      '0xbaf0f0499bc5530e2b6181e22567415f793a3d0b000200000000000000000005',
      '0xb3a6b8f5d07bae6dd664dbdf45432f78c819ab99000200000000000000000006',
      '0x5e71ae56c64dee14fe78e31efcf2ee95f89fac45000200000000000000000007',
      '0x3f197d7d1ff1de36c69cea2a2ab326a01612f848000200000000000000000008',
      '0xa85ae7f245e690ec70867248d246f60a41bace0e000200000000000000000009',
      '0x26cdeaf40cf9a83bb7436b560d150c1d5d98b87900020000000000000000000a',
      '0x6660752d8d3be08bf42fd0a9b14d7ff0244f37da00020000000000000000000b',
      '0xb63d6bb8ff68ffd3bf9cbf89cc1be46a6c4831cb00010000000000000000000c',
      '0xeb5fcc3127dbb58919bdabf8664ed0d885c7765f00010000000000000000000d',
      '0xcb4530fe70937f225496731c250eec946c000cc200020000000000000000000e',
      '0xf7bf7a20d46695950be93498f5e246af0e2f585c00020000000000000000000f',
      '0x8bd03871dfee603d23093bb497a522b4b79251ae000200000000000000000010',
      '0xc4a63e1155d5ad0aff2943db310973d4c48d8dd1000200000000000000000011',
      '0x7e7a1be24fc2e5c850aaf76f77ddc4d955016f6c000200000000000000000012',
      '0xbed30cea13f3585743dab5c8616d016d71ba501a000200000000000000000013',
      '0xc8af7a44fbd217f631b579009bbe99bfa6e87982000100000000000000000014',
      '0x229cd3ba52f8c3a8d7012b3f60e7c4b2681c89fc000200000000000000000015',
      '0x7d4f04ac7173479e520fc8aabfaa9a58bb1eeeab000200000000000000000016',
      '0x1790e0239029532a8095e78a2ff57ab118e57bf5000200000000000000000017',
      '0xa7dbc709bb7e86ded763dff68b8c73c283ebd636000200000000000000000018',
      '0x0ba7fd4626bf60dceb29d5abf224e744e5ec16e8000200000000000000000019',
      '0x4ae1038376b444118a7e1ce18fb81b3ddb47e77700020000000000000000001a',
      '0xd5692416b31c0d71f1828c368f85fb0db973907a00020000000000000000001b',
      '0x2a55d125bcb7334f9f53f58f2b866c37d7c93fbb00020000000000000000001c',
      '0xb02cc2f0bbf82c5b77239a63555982f94d0bb98900020000000000000000001d',
      '0x54b0a5e9a25c70d6d63c588654107499f77a188f00020000000000000000001e',
      '0x3d103140dd851dee84924bbfec217ef2c2305e7f00020000000000000000001f',
      '0xfe93ba6e55f5d496c18e299a3c246813702938b4000200000000000000000020',
      '0xb81ecd9c8c371cabb4330a053c47912a0671d257000200000000000000000021',
      '0x2a4f69e1ede822862ba4b6946eae5ee5d8245d91000200000000000000000022',
      '0xff054c3158f97e82ea95de496f6682946793146c000200000000000000000023',
      '0x0d3dfa4d197197df1023af03adb88167ec9ec5d1000200000000000000000024',
      '0x3e98f89d144e4fd3facb45ba858a8c5959684d31000200000000000000000025',
      '0x45218203ede01d451df39acadb58bd5ed27e1ea2000200000000000000000026',
      '0xfdd3bc04f2ff5878c5c2503c7183ed660f8e27d2000200000000000000000027',
      '0x71c70a0305b021985daa0f04cf01f40ff653e831000200000000000000000028',
      '0x2b11cc974c969f3e2a8e7be3531512afaf6a6c93000200000000000000000029',
      '0x7347264597e64f8b1e4ee9196fb3441d881bac1500020000000000000000002a',
      '0xd342a436874b3960466fb71f7b51fb085595e9f900020000000000000000002b',
      '0x720881d29d7c1f7dc2fce77533a3126214a0573000020000000000000000002c',
      '0xe2545e39ff45c18e2e72aaf303899e8f037595de00010000000000000000002d',
      '0xd2f568f7b57a7dd5d0f4cd9f776f09e8f8c40b8e00020000000000000000002e',
      '0xd556ed2e3b0c34b7dbedc1817878ca95f68ad62500020000000000000000002f',
      '0xcc0d83d7204a388be9eb6c2b9ca25cafc37b9db6000200000000000000000030',
      '0xd965a352a4497d170324d5918c9e2ab16c258763000200000000000000000031',
      '0x1e7a809ca674d6fde7433bafb5e239dfcbfcfaa0000200000000000000000032',
      '0xcd0bc4307130e6ca394ae1954fcc278bc8ba2a5a000200000000000000000033',
      '0xa8c565496e10f7c3914b7bc1fe0a99d8c8610176000200000000000000000034',
      '0x4fc3da35c39b743928e304718040f80f8dafcdcf000200000000000000000035',
      '0x951128e4a879bec00b3c26a0637369fd72c437f2000200000000000000000036',
      '0x5f80fd4466af6046f81008d2465eddcacf41236f000200000000000000000037',
      '0x5908225efc10b6fcafbbd9d41e08e613bee31cb9000200000000000000000038',
      '0x9005c6c8ad523180363ee6152f0a9916ca10cded000200000000000000000039',
      '0x6e5a2ebe22bd417b53fe8977596c2ead5f4913e600020000000000000000003a',
      '0xe3c922e186d3f9bac668c891c81399ceaa35f62e00020000000000000000003b',
      '0x4aea872191dddf5352fadc3aa066733a2e829bc700020000000000000000003c',
      '0x408af6228a854c99a7e276448249ba19b1e6464100020000000000000000003d',
      '0x5252d2d742f52d81b433105fe50c6403b334e80900020000000000000000003e',
      '0xdc388339dd663ba0896bec2f2238aca8d33cc63100020000000000000000003f',
      '0x87be51be0a3d871ab23b4c634ec24a1066d35fb9000200000000000000000040',
      '0xea7975b39efaca0bd89a0c3c68d621ebf753f5fa000200000000000000000041',
      '0x89e825ae35e3a2e0f0806b3ac9de604103abd09c000200000000000000000042',
      '0x424577f7b84c9c2577410facc4b50a272a724be5000200000000000000000043',
      '0x058fdd0f5bbd93ebb0716e24b840da79bacc82ed000200000000000000000044',
      '0xed914031249e03936d9f1afe99436fa9d52ae573000200000000000000000045',
      '0x2c0fdfe1cad991d9481f5f9aff7fb2804b98e581000200000000000000000046',
      '0xf4f136f7548a5ad128f6077c9e1f2da7e584dc09000200000000000000000047',
      '0x71c413b84f285f9a5d22b84d71fbe948f43e5bad000200000000000000000048',
      '0x4171579974b7393210dda22863681d2a5d580788000200000000000000000049',
      '0x9b9ace97384bdbcff1f3bfbf7c1c1b1061e114d900020000000000000000004a',
      '0x887577cb7dbe01fd02b8f6ba117b26f0a712471b00020000000000000000004b',
      '0x40410e53651764a67f1d998efe0094c14f6f715300020000000000000000004c',
      '0x677a8382bd12e5d8f86184dfd9eeecfc4175c29000020000000000000000004d',
      '0x02becc05a461b608547bdba68f752d6484cbb28400020000000000000000004e',
      '0xb125c4e75afe65f7c25ed86934235ba473022b1500020000000000000000004f',
      '0xa0e92cfb267fcae4c41d0690f057f228e979e8f0000200000000000000000050',
      '0x15ff466fd77e0a92b440b377c7ae30030afe92e4000200000000000000000051',
      '0xab17fec0e8b6096d59d82099d0afdcc39bd1bed0000200000000000000000052',
      '0x32d5b5052e33bb40f97369c26014b6350a6e9a4a000200000000000000000053',
      '0xf3772d3a25e7797d73280ff9a65e0ca97cdbe1c6000200000000000000000054',
      '0xd052728099c864af19cc8864c148af0a8fe8d7c8000200000000000000000055',
      '0x01af0eb7e5ada2e56eda3c083c17511ea5531fa2000200000000000000000056',
      '0x33a61053a0931810cea765c93f3f06d5657268a7000200000000000000000057',
      '0xe5bb64ed024edb599417aa1b17ad50673a4c4916000200000000000000000058',
      '0x26d285c8db9b9e874d2e10b0f004918b97121644000200000000000000000059',
      '0x949f6c384807f97b9f229b1a5b583a2589b06b0e00020000000000000000005a',
      '0xc41f312adb9f60830de3fff2ab2ec3688fe7cc3d00020000000000000000005b',
      '0x148ac25e6b834dd64d00f63180f17f79105037fc00020000000000000000005c',
      '0x32f62cb09fea44a2782861c3a26ddfaebc12e38c00020000000000000000005d',
      '0x9c328a6e498fe4a5cc59f46273a20a5cef6be99600020000000000000000005e',
      '0xff9d149d32295ca0261b8718fb9ea08fb4c0fff900020000000000000000005f',
      '0xbfeebf39d55bf934191e4bb8d76966396bba010d000200000000000000000060',
      '0xa96bedf05248135fa58e884183b4bef061ae6058000200000000000000000061',
      '0x250e63b3615f8756f5ec55dd682adb45ada77022000200000000000000000062',
      '0x1c6d56ab4e4865ddfc022d428fafb698bf35bcdc000200000000000000000063',
      '0x1c026d8f822b0284dff352a9547089d192211f6a000200000000000000000064',
      '0xed70591ef38699ce35ecc47b3ae1724548591e08000200000000000000000065',
      '0xb7eba1d25875808ee564e429683bfc968030c195000200000000000000000066',
      '0x7dacf13cdd08fbaa2b59e3e58505ba4ba76fe511000200000000000000000067',
      '0x0290b64515d6906e823d46af9dcb7464b09c3f0a000200000000000000000068',
      '0x5b30a66e6df535ff957f0b6436eb25efaba38c38000200000000000000000069',
      '0x4d5d984680258d58a4077033e9478c397b1b86c300020000000000000000006a',
      '0x71588fc35bbf9db9bc5a4f83a3e1fe123b106a4e00020000000000000000006b',
      '0x08dce2174353db23d7799d0edfef12f7e02278c600020000000000000000006c',
      '0x968d038a498e18063d7885f924f11bd38a8d867c00020000000000000000006d',
      '0xd37546d53685bf86a209e9d61789b584b7481aaf00020000000000000000006e',
      '0x573071d3fec157894d66238800cb0c9cd62096aa00020000000000000000006f',
      '0xf72db12e82aaa186768d33b8d3b66f93c78093c3000200000000000000000070',
      '0x318ec6212e9425840442f775ad11cbc51ba4f3e0000200000000000000000071',
      '0x91734744a9bd1fd00168c554aa492092d0924611000200000000000000000072',
      '0xfee2dbc68d1d403e29955c8e811d850b4f36a36c000200000000000000000073',
      '0xe8ff72bd033159ee74496f348753de1aebbe80fe000200000000000000000074',
      '0xecb6834f1352e2ac56e999288aa2a947bc18bed5000200000000000000000075',
      '0x8cfbad6fa71d6c73d6ffcfd9aac33b5af5ab7700000200000000000000000076',
      '0x3316c57ee9cba29296fdbffc2f2e7381ea030617000200000000000000000077',
      '0xb2daa8f26ad645a4bd9670324c9d9ee919ba4a91000200000000000000000078',
      '0x6b4b11f3e43078c817b3b2e5ae642e8a42dc41d5000200000000000000000079',
      '0xf6285f4cd60ee8cc223d1ea102148c572e29407500020000000000000000007a',
      '0xda8d810c56f0d85390e4c85fb73f7cea524724b100020000000000000000007b',
      '0x67290862574825f8bce83d29e0121e7a439f9c4900020000000000000000007c',
      '0x463aa32b7ee808705d133a066c1dcaabbbb4d27d00020000000000000000007d',
      '0x0c1e9d2cd8c0733ea8995762e25999d99b9d6a9800020000000000000000007e',
      '0x1d04721c67dc1cf495f0b4a0528362fda565923700020000000000000000007f',
      '0xaa7a35d46e7cf50cf590a007876c83ca9a570f2f000200000000000000000080',
      '0x632c54c6a9e551ec8b73a25a49bd907c733e80e2000200000000000000000081',
      '0x735f0a9e1f744b87422e58b583b3cb562e6c45e6000200000000000000000082',
      '0x34d4fbfdc8043d97e4bb1296a38d118a4825ae87000200000000000000000083',
      '0xba6328b9e3d4199643e4b0bc7e718f4b52e79ebb000200000000000000000084',
      '0xcf83b83dbca6cc6c3ed3b45d154e648c2c07c028000200000000000000000085',
      '0x8d2146a342b2ad49ab59edf0d1b1944a23ad1fe1000200000000000000000086',
      '0xa6a264c1c1f7ee64becc1a26dfd5231f6134a5fd000200000000000000000087',
    ],
  },
  Metadata: {},
  DisabledJoins: [],
  VerifiedPools: [
    '0x0ba7fd4626bf60dceb29d5abf224e744e5ec16e8000200000000000000000019',
    '0xa7dbc709bb7e86ded763dff68b8c73c283ebd636000200000000000000000018',
    '0x34d4fbfdc8043d97e4bb1296a38d118a4825ae87000200000000000000000083',
  ],
};

const POOLS_OASYS_TESTNET: Pools = {
  IdsMap: {
    // staBAL:
    //   '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
    // bbAaveUSD: {
    //   v1: '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
    //   v2: '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7',
    // },
    veBAL: '',
  },
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [''],
  ExcludedPoolTypes: [
    'Element',
    'AaveLinear',
    'EulerLinear',
    'Linear',
    'ERC4626Linear',
    'FX',
    'Gyro2',
    'Gyro3',
    'GyroE',
    'HighAmpComposableStable',
  ],
  Stable: {
    AllowList: [
      // '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010', // bb-ag-usd
      // '0xfd330fc06987835dff2d1d0787e81d717ae1acb000000000000000000000000b',
    ],
  },
  Investment: {
    AllowList: [
      // '0xd92e2e3c13c3712af12e4389ee37b67021318812000200000000000000000002',
    ],
  },
  Factories: {
    '0xfda8fa80dd77a99bf71becfce47077859e689898': 'composableStablePool', // ComposableStable V3
    '0xd2d7f457b9749b6a0a637685a65681f03116125c': 'weightedPool', // WeightedPool V3
  },
  Stakable: {
    AllowList: [],
  },
  Metadata: {},
  DisabledJoins: [],
  VerifiedPools: [
    '0x4a54649fb507ee0bf3ad2e1661516b5700c520ab000100000000000000000005',
    '0x66180966de2a4180183d7e5dffd76e13b364efe2000200000000000000000001',
  ],
};

const POOLS_OASYS: Pools = {
  IdsMap: {
    // staBAL:
    //   '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
    // bbAaveUSD: {
    //   v1: '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
    //   v2: '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7',
    // },
    veBAL: '',
  },
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [
    '0x2622ccccb6561509e60410c16c377aaf10ab952a000200000000000000000005',
    '0x9600393a5a3f3040bf440e1548211acd8b047b9b00020000000000000000000a',
  ],
  ExcludedPoolTypes: [
    'Element',
    'AaveLinear',
    'EulerLinear',
    'Linear',
    'ERC4626Linear',
    'FX',
    'Gyro2',
    'Gyro3',
    'GyroE',
    'HighAmpComposableStable',
  ],
  Stable: {
    AllowList: [
      // '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010', // bb-ag-usd
      // '0xfd330fc06987835dff2d1d0787e81d717ae1acb000000000000000000000000b',
    ],
  },
  Investment: {
    AllowList: [
      // '0xd92e2e3c13c3712af12e4389ee37b67021318812000200000000000000000002',
    ],
  },
  Factories: {
    '0x0a7a98c9553192755f22b282278f0fa26f4de742': 'composableStablePool', // ComposableStable V3
    '0x4ef0b4827ce3d5fecbc2c6ab80ee81dbf9631d37': 'weightedPool', // WeightedPool V3
    '0x5737600b98e7f1cf98daca2a36bca22c974370b0': 'weightedPool', // WeightedPool V3
  },
  Stakable: {
    AllowList: [
      '0x4e66d5f08e81979bd5951c93839bc97265681975000200000000000000000000',
      '0x66180966de2a4180183d7e5dffd76e13b364efe2000200000000000000000001',
      '0xe5b67bf732b7f96127454126069f94f939914d62000200000000000000000002',
      '0x82bfc330a92789c02b3ce2daed3ca889b1a112b7000100000000000000000003',
      '0x0b014863ba970f50b0ea2ad7d57151994b7cac21000100000000000000000004',
      '0x4a54649fb507ee0bf3ad2e1661516b5700c520ab000100000000000000000005',
      '0x981401f589c5768a41d3c4d1a39e84a86f11ad9f000200000000000000000006',
    ],
  },
  Metadata: {},
  DisabledJoins: [],
  VerifiedPools: [
    '0xc55226c660b5d22efb5adf6f9eee196e26ca6480000200000000000000000000',
    '0xf945f2b132766899b0fb229bb4eab8230f4af874000200000000000000000004',
    '0x973c342b2890fa95cc956e7c763bc2e244537390000200000000000000000008',
    '0xc8d059ca103cd2c17d5de9fe5ae3cc0b2560ae27000200000000000000000002',
    '0xa8495230dc93070feedc583b00c9792ac3f2567e000200000000000000000003',
    '0x6eee31c40841f6de2b4fcf3ac9bae58ba449ffd7000200000000000000000006',
    '0x9600393a5a3f3040bf440e1548211acd8b047b9b00020000000000000000000a',
    '0x79be82f12334c54033c6d1d89b6dd5f48370e835000200000000000000000009',
    '0x4eb6713e7c542394b24317398a75aec21775f9a7000200000000000000000007',
    '0x7b550899a0ee8049e07c444bca8d95eb9ff8d5dd000200000000000000000001',
    '0x79f56c1c78843710d0cc037c857426e1cee6104500020000000000000000000e',
  ],
};

const POOLS_MAP = {
  [Network.GOERLI]: POOLS_GOERLI,
  [Network.MAINNET]: POOLS_MAINNET,
  [Network.POLYGON]: POOLS_POLYGON,
  [Network.ARBITRUM]: POOLS_ARBITRUM,
  [Network.DEFIVERSE]: POOLS_DEFIVERSE,
  [Network.DEFIVERSE_TESTNET]: POOLS_DEFIVERSE_TESTNET,
  [Network.OASYS_TESTNET]: POOLS_OASYS_TESTNET,
  [Network.OASYS]: POOLS_OASYS,
};

export const POOLS: Pools = POOLS_MAP[networkId.value]
  ? POOLS_MAP[networkId.value]
  : POOLS_GENERIC;

export const GAMING_DEX_OWNER_ADDRESS = `0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b`;
