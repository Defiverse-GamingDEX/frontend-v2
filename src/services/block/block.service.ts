import { BlockNumberResponse } from './types';
import { blockSubgraphService } from './subgraph/block-subgraph.service';
import { getSecondsSince, oneHourInSecs } from '@/composables/useTime';
import { bnum } from '@/lib/utils';
import { isOasys } from '@/composables/useNetwork';
import { rpcProviderService } from '../rpc-provider/rpc-provider.service';
import { configService } from '../config/config.service';
export default class BlockService {
  constructor(
    private readonly subgraphService = blockSubgraphService,
    private readonly rpc = rpcProviderService,
    private readonly config = configService
  ) {}
  public async fetchBlockByTime(
    timestamp: string,
    useRange = true
  ): Promise<number> {
    if (isOasys.value) return this.fetchBlockByApprox(timestamp);
    return this.fetchBlockByTimeWithGraph(timestamp, useRange);
  }

  public async fetchBlockByApprox(timestamp: string): Promise<number> {
    const secsSinceTimestamp = getSecondsSince(Number(timestamp));
    const currentBlock = await this.rpc.getBlockNumber();
    const blocksSinceTimestamp = Math.floor(
      secsSinceTimestamp / this.config.network.blockTime
    );

    // TODO: Check me
    return currentBlock > blocksSinceTimestamp
      ? currentBlock - blocksSinceTimestamp
      : currentBlock;
  }

  public async fetchBlockByTimeWithGraph(
    timestamp: string,
    useRange = true
  ): Promise<number> {
    try {
      let query = {};
      if (useRange) {
        const oneHourLater = bnum(timestamp).plus(oneHourInSecs);
        query = {
          where: {
            timestamp_gt: timestamp,
            timestamp_lt: oneHourLater.toString(),
          },
        };
      } else {
        query = {
          where: {
            timestamp_gt: timestamp,
          },
        };
      }

      const response: BlockNumberResponse =
        await this.subgraphService.blockNumber.get(query);

      return parseInt(response.blocks[0].number);
    } catch (error) {
      if (useRange) return this.fetchBlockByTime(timestamp, false);
      throw error;
    }
  }
}

export const blockService = new BlockService();
