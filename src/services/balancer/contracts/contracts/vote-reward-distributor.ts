import { Contract } from '@ethersproject/contracts';
import { TransactionResponse } from '@ethersproject/providers';

import VoteRewardDistributorAbi from '@/lib/abi/VoteRewardDistributor.json';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { web3Service } from '@/services/web3/web3.service';

export class VoteRewardDistributor {
  instance: Contract;

  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = VoteRewardDistributorAbi,
    private readonly web3 = web3Service
  ) {
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  async claimRewardsForGauge(
    gaugeAddress: string,
    userAddress: string
  ): Promise<TransactionResponse> {
    return await this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'claimRewardsForGauge',
      params: [gaugeAddress, userAddress],
    });
  }
}
