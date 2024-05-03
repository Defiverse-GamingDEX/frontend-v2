import defiIcon from '@/assets/images/bridge/networks/defi.png';
import oasIcon from '@/assets/images/bridge/networks/oas.png';
export const NETWORKS_MAINNET_RECEIVE = [
    {
        chain_id: '0xF8',
        chain_id_decimals: 248,
        img_url: oasIcon,
        name: 'Oasys Mainnet',
        gasPrice: null,
        explorer: 'https://explorer.oasys.games/',
        rpc: 'https://rpc.mainnet.oasys.games',
        bridgeContract: '0x4200000000000000000000000000000000000010',
        tokens: [ {
            name: 'stOAS',
            address: '0xef1c93a38ea284cdc7f2a0edca7c4ffde4d55cba',
            logoURI: oasIcon,
            symbol: 'stOAS',
            decimals: 18,
            is_native: false,
            rpc: 'https://rpc.testnet.oasys.games/',
        }],
        nativeCurrency: {
            name: 'OASYS',
            symbol: 'OAS',
            decimals: 18,
        },
        },
    {
        chain_id: '0x3EF4',
        chain_id_decimals: 16116,
        img_url: defiIcon,
        name: 'Defiverse',
        gasPrice: 5000000000000,
        explorer: 'https://scan.defi-verse.org/',
        rpc: 'https://rpc.defi-verse.org',
        bridgeContract: '0x4200000000000000000000000000000000000010', /// I2ERC20Bridge
        isTestnet: false,
        tokens: [ {
        name: 'stOAS',
        address: '0xef1c93a38ea284cdc7f2a0edca7c4ffde4d55cba',
        logoURI: oasIcon,
        symbol: 'stOAS',
        decimals: 18,
        is_native: false,
        rpc: 'https://rpc.testnet.oasys.games/',
    }],
        nativeCurrency: {
        name: 'OASYS',
        symbol: 'OAS',
        decimals: 18,
        address: '0x4200000000000000000000000000000000000010',
        },
    },
];