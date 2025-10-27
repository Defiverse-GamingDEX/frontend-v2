import { getTimeTravelBlock } from '@/composables/useSnapshots';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import PoolService from '../pool.service';
import { PoolMulticaller } from './pool.multicaller';

/**
 * @summary Decorates a set of pools with additonal data.
 */
export class PoolDecorator {
  constructor(
    public pools: Pool[],
    private readonly poolServiceClass = PoolService,
    private readonly poolSubgraph = balancerSubgraphService
  ) {}

  public async decorate(
    tokens: TokenInfoMap,
    decorateAll = true,
    skipExpensiveDecorations = false // Skip APR and TotalLiquidity for fast initial load
  ): Promise<Pool[]> {
    const processedPools = this.pools.map(pool => {
      const poolService = new this.poolServiceClass(pool);
      poolService.setUnwrappedTokens(); // NEED CONFIRM
      return poolService.pool;
    });

    const poolMulticaller = new PoolMulticaller(processedPools);

    const [poolSnapshots, rawOnchainDataMap] = await Promise.all([
      decorateAll ? this.getSnapshots() : [],
      poolMulticaller.fetch(),
    ]);

    const promises = processedPools.map(async pool => {
      const poolService = new this.poolServiceClass(pool);

      poolService.setOnchainData(rawOnchainDataMap[pool.id], tokens);

      // All of the following are pre-cached by the Balancer API so we can skip
      // decoration of them if the pool came from the API.
      if (decorateAll) {
        const poolSnapshot = poolSnapshots.find(p => p.id === pool.id);
        poolService.setFeesSnapshot(poolSnapshot);
        poolService.setVolumeSnapshot(poolSnapshot);
        
        // Skip expensive decorations for fast initial load (portfolio page)
        if (!skipExpensiveDecorations) {
                
          // Run both in parallel for better performance
          await Promise.all([
            poolService.setTotalLiquidity(),
            poolService.setAPR()
          ]);
        }
      }

      return poolService.pool;
    });

    return await Promise.all(promises);
  }

  /**
   * Lazily decorate pools with APR and TotalLiquidity data
   * This is called after initial load to avoid blocking the UI
   */
  public async decoratePoolsLazy(pools: Pool[]): Promise<Pool[]> {
    // Temporarily set this.pools for getSnapshots to work
    const originalPools = this.pools;
    this.pools = pools;

    
    // Restore original pools
    this.pools = originalPools;
    
    const promises = pools.map(async pool => {
      
      // Clone pool to avoid Vue readonly proxy issues
      // When pools are already in Vue reactive state, they become readonly
      const poolClone = JSON.parse(JSON.stringify(pool));
      const poolService = new this.poolServiceClass(poolClone);
   
      try {        
        // Run both in parallel for better performance
        await Promise.all([
          poolService.setTotalLiquidity(),
          poolService.setAPR()
        ]);
        
        
      } catch (error) {
        console.error(`Failed to lazy load data for pool ${pool.id}:`, error);
      }
      
      // Return the updated clone, not the original readonly pool
      return poolService.pool;
    });

    return await Promise.all(promises);
  }

  /**
   * Re-sets totalLiquidty on all pools, typically after prices have been updated.
   */
  public async reCalculateTotalLiquidities(): Promise<Pool[]> {
    return Promise.all(
      this.pools.map(async pool => {
        const poolService = new this.poolServiceClass(pool);
        await poolService.setTotalLiquidity();
        return poolService.pool;
      })
    );
  }

  /**
   * @summary Get snapshot data of pools
   * @description Getting the past state of pools allows us to calculate
   * snapshot values like volume and fees, currently fixed at past 24h
   * (see getTimeTravelBlock).
   */
  private async getSnapshots(): Promise<Pool[]> {
    const blockNumber = await getTimeTravelBlock();
    const block = { number: blockNumber };
    const isInPoolIds = { id: { in: this.pools.map(pool => pool.id) } };
    try {
      return await this.poolSubgraph.pools.get({
        where: isInPoolIds,
        block,
      });
    } catch (error) {
      console.error('Failed to fetch pool snapshots', error);
      return [];
    }
  }
}
