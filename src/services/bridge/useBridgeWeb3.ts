import { Web3Plugin, Web3ProviderSymbol } from '../web3/web3.plugin';
import { switchToAppNetwork } from './helpers';
export default function useBridgeWeb3() {
  const { provider } = inject(Web3ProviderSymbol) as Web3Plugin;

  const connectToAppNetwork = networkBridge =>
    switchToAppNetwork(provider.value as any, networkBridge);

  return {
    // refs

    provider,

    // methods

    connectToAppNetwork,
  };
}
