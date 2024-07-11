import { EthereumProvider } from '@walletconnect/ethereum-provider';

import useDarkMode from '@/composables/useDarkMode';
import { Network } from '@/lib/config/types.ts';
import ConfigService from '@/services/config/config.service';
import { WalletError } from '@/types';
import { Connector, ConnectorId } from '../connector';
const {
  ETHEREUM,
  POLYGON,
  OASYS,
  DEFIVERSE,
  DEFIVERSE_TESTNET,
  TCGVERSE,
  MCHVERSE,
  HOMEVERSE,
  CHAINVERSE,
  SAAKURU,
} = Network;

export class WalletConnectConnector extends Connector {
  id = ConnectorId.WalletConnect;
  async connect() {
    const configService = new ConfigService();
    const metadata = {
      name: 'gaming-dex',
      description: 'Build DeFi liquidity applications',
      url: 'https://www.gaming-dex.com/', // origin must match your domain & subdomain
      icons: ['https://www.gaming-dex.com/images/gamingdex_icon.png'],
    };
    const provider = await EthereumProvider.init({
      projectId: 'ca78539a9b756312f579aed453d6d36f',
      chains: [DEFIVERSE],
      optionalChains: [
        ETHEREUM,
        POLYGON,
        OASYS,
        DEFIVERSE,
        DEFIVERSE_TESTNET,
        TCGVERSE,
        MCHVERSE,
        HOMEVERSE,
        CHAINVERSE,
        SAAKURU,
      ],
      rpcMap: {
        [DEFIVERSE]: configService.getNetworkRpc(DEFIVERSE),
        [ETHEREUM]: configService.getNetworkRpc(ETHEREUM),
        [POLYGON]: configService.getNetworkRpc(POLYGON),
        [OASYS]: configService.getNetworkRpc(OASYS),
        [TCGVERSE]: configService.getNetworkRpc(TCGVERSE),
        [MCHVERSE]: configService.getNetworkRpc(MCHVERSE),
        [HOMEVERSE]: configService.getNetworkRpc(HOMEVERSE),
        [CHAINVERSE]: configService.getNetworkRpc(CHAINVERSE),
        [SAAKURU]: configService.getNetworkRpc(SAAKURU),
        [DEFIVERSE_TESTNET]: configService.getNetworkRpc(DEFIVERSE_TESTNET),
      },
      metadata,
      showQrModal: true,
      qrModalOptions: { themeMode: useDarkMode().darkMode ? 'dark' : 'light' },
    });
    this.provider = provider;

    try {
      const accounts = await provider.enable();

      const chainId = await provider.request({ method: 'eth_chainId' });
      this.handleChainChanged(chainId);
      this.handleAccountsChanged(accounts);
    } catch (err) {
      if ((err as WalletError).code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to WalletConnect.');
      } else {
        console.error(err);
      }
    }
    return {
      // TODO type this
      provider,
      account: this.account,
      chainId: this.chainId,
    };
  }
}
