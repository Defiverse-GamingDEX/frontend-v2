import axios from 'axios';
import { GasPrice } from './types';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Network } from '@defiverse/balancer-sdk';

interface OasysTestnetChainGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class OasysTestnetChainProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchOasysTestnetChainProvider('eth_gasPrice'),
        this.fetchOasysTestnetChainProvider('eth_maxPriorityFeePerGas'),
      ]);
      const price = bnum(gasPrice.result).toNumber();
      const maxPriorityFeePerGas = bnum(maxPriorityFee.result).toNumber();

      return {
        price,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      console.log('[Oasys-testnet-chain] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchOasysTestnetChainProvider(method: string) {
    const { data } = await axios.post<OasysTestnetChainGasStationResponse>(
      configService.getNetworkRpc(Network.OASYS_TESTNET),
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
