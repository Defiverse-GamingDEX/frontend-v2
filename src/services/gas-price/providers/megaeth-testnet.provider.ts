import axios from 'axios';
import { GasPrice } from './types';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Network } from '@defiverse/balancer-sdk-megaeth';

interface MegaETHTestnetChainGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class MegaETHTestnetChainProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchMegaETHTestnetChainProvider('eth_gasPrice'),
        this.fetchMegaETHTestnetChainProvider('eth_maxPriorityFeePerGas'),
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

  private async fetchMegaETHTestnetChainProvider(method: string) {
    const { data } = await axios.post<MegaETHTestnetChainGasStationResponse>(
      configService.getNetworkRpc(Network.MEGAETH_TESTNET),
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
