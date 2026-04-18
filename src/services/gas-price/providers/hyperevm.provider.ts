import axios from 'axios';
import { GasPrice } from './types';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Network } from '@defiverse/balancer-sdk-hyperevm';

interface HyperEVMMainnetChainGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class HyperEVMMainnetChainProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchHyperEVMMainnetChainProvider('eth_gasPrice'),
        this.fetchHyperEVMMainnetChainProvider('eth_maxPriorityFeePerGas'),
      ]);
      const price = bnum(gasPrice.result).toNumber();
      const maxPriorityFeePerGas = bnum(maxPriorityFee.result).toNumber();

      return {
        price,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      console.log('[HyperEVM-chain] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchHyperEVMMainnetChainProvider(method: string) {
    const { data } = await axios.post<HyperEVMMainnetChainGasStationResponse>(
      configService.getNetworkRpc(Network.HYPEREVM_MAINNET),
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
