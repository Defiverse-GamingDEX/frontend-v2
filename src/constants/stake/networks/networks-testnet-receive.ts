import defiIcon from '@/assets/images/bridge/networks/defi.png';
import oasIcon from '@/assets/images/bridge/networks/oas.png';
export const NETWORKS_TESTNET_RECEIVE = [
    {
        chain_id: '0x249C',
        chain_id_decimals: 9372,
        img_url: oasIcon,
        name: 'OASYS Testnet',
        gasPrice: null,
        explorer: 'https://explorer.testnet.oasys.games/',
        rpc: 'https://rpc.testnet.oasys.games/',
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
        chain_id: '0x42DD',
        chain_id_decimals: 17117,
        name: 'Defiverse Testnet',
        img_url: defiIcon,
        gasPrice: 50000000000,
        explorer: 'https://scan-testnet.defi-verse.org',
        rpc: 'https://rpc-testnet.defi-verse.org',
        bridgeContract: '0x4200000000000000000000000000000000000010',
        isTestnet: true,
        tokens:  [ {
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