import { Logger } from '@ethersproject/logger';
import { logger, providers, utils } from 'ethers';

class StaticJsonRpcBatchProvider extends providers.JsonRpcBatchProvider {
  async detectNetwork(): Promise<providers.Network> {
    let network = this.network;
    if (network == null) {
      network = await super.detectNetwork();

      if (!network) {
        logger.throwError(
          'no network detected',
          Logger.errors.UNKNOWN_ERROR as any,
          {}
        );
      }

      // If still not set, set it
      if (this._network == null) {
        // A static network does not support "any"
        utils.defineReadOnly(this, '_network', network);

        this.emit('network', network, null);
      }
    }
    return network;
  }
}

export { StaticJsonRpcBatchProvider };
