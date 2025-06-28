import configs from '@/lib/config';
import ConfigService from './config.service';

export default class ConfigServiceCustom extends ConfigService {
  constructor(private readonly networkId: number) {
    super();
  }

  public override get env() {
    const networkId = this.networkId;
    return {
      APP_ENV: import.meta.env.VITE_ENV || 'development',
      NETWORK: networkId,
      APP_DOMAIN: import.meta.env.VITE_DOMAIN || 'gaming-dex.com',
      APP_HOST: import.meta.env.VITE_HOST || 'balancer.fi',
      IPFS_NODE: import.meta.env.VITE_IPFS_NODE || 'cloudflare-ipfs.com',
      BLOCKNATIVE_DAPP_ID:
        import.meta.env.VITE_BLOCKNATIVE_DAPP_ID || 'MISSING_KEY',
      ALCHEMY_KEY:
        import.meta.env.VITE_ALCHEMY_KEY ||
        this.getNetworkConfig(networkId).keys.alchemy ||
        'MISSING_KEY',
      GRAPH_KEY:
        import.meta.env.VITE_ENV === 'development'
          ? import.meta.env.VITE_GRAPH_KEY_DEV || 'MISSING_KEY'
          : import.meta.env.VITE_GRAPH_KEY ||
            this.getNetworkConfig(networkId).keys.graph ||
            'MISSING_KEY',
      INFURA_PROJECT_ID:
        import.meta.env.VITE_INFURA_PROJECT_ID ||
        this.getNetworkConfig(networkId).keys.infura ||
        'MISSING_KEY',
      ENABLE_STABLE_POOLS: import.meta.env.VITE_ENABLE_STABLE_POOLS === 'true',
      WALLET_SCREENING: import.meta.env.VITE_WALLET_SCREENING === 'true',
    };
  }

  public override get network() {
    return configs[this.networkId];
  }
}
