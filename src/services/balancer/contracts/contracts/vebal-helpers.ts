import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { mapValues } from 'lodash';

import VEBalHelpersABI from '@/lib/abi/VEBalHelpers.json';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { web3Service } from '@/services/web3/web3.service';
import { getOldMulticaller } from '@/dependencies/OldMulticaller';

export class VEBalHelpers {
  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = VEBalHelpersABI,
    private readonly config = configService,
    private readonly web3 = web3Service
  ) {}

  async getRelativeWeights(gaugeAddresses: string[]) {
    const multicaller = this.getMulticaller();
    for (const gaugeAddress of gaugeAddresses) {
      multicaller.call(
        getAddress(gaugeAddress),
        this.address,
        'gauge_relative_weight',
        [getAddress(gaugeAddress)]
      );
    }
    const result = await multicaller.execute();
    const weights = mapValues(result, weight => formatUnits(weight, 18));
    return weights;
  }

  private getMulticaller() {
    const Multicaller = getOldMulticaller();
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}
