import { jsonToGraphQLQuery } from 'json-to-graphql-query';

import { subgraphFallbackService } from './subgraph-fallback.service';

export interface SubgraphQueryOptions {
  url?: string;
}

export default class BalancerSubgraphClient {
  public async get(query) {
    try {
      const payload = this.toPayload(query);
      console.log(payload, 'payload');
      const response = await subgraphFallbackService.get(payload);
      console.log(response, 'response');
      if (!response) {
        return;
      }

      return response.data.data;
    } catch (error) {
      console.error(error);
    }
  }

  public toPayload(query) {
    return { query: jsonToGraphQLQuery({ query }) };
  }
}

export const balancerSubgraphClient = new BalancerSubgraphClient();
