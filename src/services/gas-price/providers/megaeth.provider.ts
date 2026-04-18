import axios from 'axios';
import { GasPrice } from './types';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Network } from '@defiverse/balancer-sdk-hyperevm';

interface MegaETHMainnetChainGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class MegaETHMainnetChainProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchMegaETHMainnetChainProvider('eth_gasPrice'),
        this.fetchMegaETHMainnetChainProvider('eth_maxPriorityFeePerGas'),
      ]);
      const price = bnum(gasPrice.result).toNumber();
      const maxPriorityFeePerGas = bnum(maxPriorityFee.result).toNumber();

      return {
        price,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      console.log('[Megaeth-chain] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchMegaETHMainnetChainProvider(method: string) {
    const { data } = await axios.post<MegaETHMainnetChainGasStationResponse>(
      configService.getNetworkRpc(Network.MEGAETH_MAINNET),
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
