import axios from 'axios';
import { GasPrice } from './types';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Network } from '@defiverse/balancer-sdk';

interface DefiverseTestnetChainGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class DefiverseTestnetChainProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchDefiverseTestnetChainProvider('eth_gasPrice'),
        this.fetchDefiverseTestnetChainProvider('eth_maxPriorityFeePerGas'),
      ]);
      const price = bnum(gasPrice.result).toNumber();
      const maxPriorityFeePerGas = bnum(maxPriorityFee.result).toNumber();

      return {
        price,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      console.log('[Defiverse-testnet-chain] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchDefiverseTestnetChainProvider(method: string) {
    const { data } = await axios.post<DefiverseTestnetChainGasStationResponse>(
      configService.getNetworkRpc(Network.DEFIVERSE_TESTNET),
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
