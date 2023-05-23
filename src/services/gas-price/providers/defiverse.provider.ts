import axios from 'axios';
import { GasPrice } from './types';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Network } from '@defiverse/balancer-sdk';

interface DefiverseChainGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class DefiverseChainProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchDefiverseChainProvider('eth_gasPrice'),
        this.fetchDefiverseChainProvider('eth_maxPriorityFeePerGas'),
      ]);
      const price = bnum(gasPrice.result).toNumber();
      const maxPriorityFeePerGas = bnum(maxPriorityFee.result).toNumber();

      return {
        price,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      console.log('[Defiverse-chain] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchDefiverseChainProvider(method: string) {
    const { data } = await axios.post<DefiverseChainGasStationResponse>(
      configService.getNetworkRpc(Network.DEFIVERSE),
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
