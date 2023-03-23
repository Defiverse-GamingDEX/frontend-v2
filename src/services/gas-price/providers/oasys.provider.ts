import axios from 'axios';
import { GasPrice } from './types';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Network } from '@balancer-labs/sdk';

interface OasysChainGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class OasysChainProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchOasysChainProvider('eth_gasPrice'),
        this.fetchOasysChainProvider('eth_maxPriorityFeePerGas'),
      ]);
      const price = bnum(gasPrice.result).toNumber();
      const maxPriorityFeePerGas = bnum(maxPriorityFee.result).toNumber();

      return {
        price,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      console.log('[Oasys-chain] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchOasysChainProvider(method: string) {
    const { data } = await axios.post<OasysChainGasStationResponse>(
      configService.getNetworkRpc(Network.OASYS),
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
