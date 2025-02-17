import { fromUnixTime, getUnixTime, startOfHour } from 'date-fns';
import { groupBy, invert, last } from 'lodash';
import axios from 'axios';
import { twentyFourHoursInSecs } from '@/composables/useTime';
import { TOKENS } from '@/constants/tokens';
import { getAddressFromPoolId, includesAddress } from '@/lib/utils';
import { retryPromiseWithDelay } from '@/lib/utils/promise';
import { configService as _configService } from '@/services/config/config.service';

import { CoingeckoClient } from '../coingecko.client';
import {
  CoingeckoService,
  getNativeAssetId,
  getPlatformId,
} from '../coingecko.service';
import { getAddress } from '@ethersproject/address';

/**
 * TYPES
 */
export type Price = { [fiat: string]: number };
export type PriceResponse = { [id: string]: Price };
export type TokenPrices = { [address: string]: Price };
export interface HistoricalPriceResponse {
  market_caps: number[][];
  prices: number[][];
  total_volumes: number[][];
}
export type HistoricalPrices = { [timestamp: string]: number[] };

export class PriceService {
  client: CoingeckoClient;
  fiatParam: string;
  appNetwork: string;
  platformId: string;
  nativeAssetId: string;
  nativeAssetAddress: string;
  appAddresses: { [key: string]: string };

  constructor(
    service: CoingeckoService,
    private readonly configService = _configService
  ) {
    this.client = service.client;
    this.fiatParam = service.supportedFiat;
    this.appNetwork = this.configService.network.key;
    this.platformId = getPlatformId(this.appNetwork);
    this.nativeAssetId = getNativeAssetId(this.appNetwork);
    this.nativeAssetAddress = this.configService.network.nativeAsset.address;
    this.appAddresses = this.configService.network.addresses;
  }

  async getNativeAssetPrice(): Promise<Price> {
    try {
      const response = await this.client.get<PriceResponse>(
        `/simple/price?ids=${this.nativeAssetId}&vs_currencies=${this.fiatParam}`
      );
      return response[this.nativeAssetId];
    } catch (error) {
      console.error('Unable to fetch Ether price', error);
      throw error;
    }
  }

  async fetchPrice(addressString): Promise<Price> {
    const priceUrl = this.configService.network.priceUrl;
    const endpoint = `${priceUrl}/price?contract_addresses=${addressString}&vs_currencies=${this.fiatParam}`;
    return axios.get<Price>(endpoint).then(({ data }) => {
      return data;
    });
  }

  /**
   *  Rate limit for the CoinGecko API is 10 calls each second per IP address.
   */
  async getTokens(
    addresses: string[],
    addressesPerRequest = 100
  ): Promise<TokenPrices> {
    try {
      if (addresses.length / addressesPerRequest > 10)
        throw new Error('To many requests for rate limit.');

      addresses = addresses
        .map(getAddressFromPoolId)
        .map(address => this.addressMapIn(address));
      const pageCount = Math.ceil(addresses.length / addressesPerRequest);
      const pages = Array.from(Array(pageCount).keys());
      const requests: Promise<PriceResponse>[] = [];

      pages.forEach(page => {
        const addressString = addresses.slice(
          addressesPerRequest * page,
          addressesPerRequest * (page + 1)
        );
        // const endpoint = `/simple/token_price/ethereum?contract_addresses=${addressString}&vs_currencies=${this.fiatParam}`;
        // const request = retryPromiseWithDelay(
        //   this.client.get<PriceResponse>(endpoint),
        //   3,
        //   2000
        // );
        // requests.push(request);

        const request: any = retryPromiseWithDelay(
          this.fetchPrice(addressString),
          3,
          2000
        );
        requests.push(request);
      });

      const paginatedResults = await Promise.all(requests);
      const results = this.parsePaginatedTokens(paginatedResults);

      // Inject native asset price if included in requested addresses
      // Hung disable
      // if (includesAddress(addresses, this.nativeAssetAddress)) {
      //   results[this.nativeAssetAddress] = await this.getNativeAssetPrice();
      // }

      return results;
    } catch (error) {
      console.error('Unable to fetch token prices', addresses, error);
      throw error;

      // const data: any = {};
      // (addresses || []).forEach(addr => {
      //   data[addr] = {
      //     usd: 1,
      //     eth: 1,
      //   };
      // });
      // return data;
    }
  }

  async getTokensHistorical(
    addresses: string[],
    days: number,
    addressesPerRequest = 1,
    aggregateBy: 'hour' | 'day' = 'day'
  ): Promise<HistoricalPrices> {
    // return Promise.resolve([]);

    try {
      if (addresses.length / addressesPerRequest > 10)
        throw new Error('To many requests for rate limit.');

      const now = Math.floor(Date.now() / 1000);
      const end =
        aggregateBy === 'hour' ? now : now - (now % twentyFourHoursInSecs);
      const start = end - days * twentyFourHoursInSecs;

      addresses = addresses
        .map(getAddressFromPoolId)
        .map(address => this.addressMapIn(address));
      const requests: Promise<HistoricalPriceResponse>[] = [];

      addresses.forEach(address => {
        const endpoint = `/coins/${
          this.platformId
        }/contract/${address?.toLowerCase()}/market_chart/range?vs_currency=${
          this.fiatParam
        }&from=${start}&to=${end}`;
        const request = retryPromiseWithDelay(
          this.client.get<HistoricalPriceResponse>(endpoint),
          2, // retryCount
          2000 // delayTime
        );
        requests.push(request);
      });

      const paginatedResults = await Promise.all(requests);
      const results = this.parseHistoricalPrices(
        paginatedResults,
        addresses,
        start,
        aggregateBy
      );
      return results;
    } catch (error) {
      console.error('Unable to fetch token prices', addresses, error);
      // throw error;
      return [];
    }
  }

  private parsePaginatedTokens(paginatedResults: TokenPrices[]): TokenPrices {
    const results = paginatedResults.reduce(
      (result, page) => ({ ...result, ...page }),
      {}
    );
    const entries = Object.entries(results);
    const parsedEntries = entries
      .filter(result => Object.keys(result[1]).length > 0)
      .map(result => [this.addressMapOut(result[0]), result[1]]);
    return Object.fromEntries(parsedEntries);
  }

  private parseHistoricalPrices(
    results: HistoricalPriceResponse[],
    addresses: string[],
    start: number,
    aggregateBy: 'day' | 'hour' = 'day'
  ): HistoricalPrices {
    const assetPrices = Object.fromEntries(
      addresses.map((address, index) => {
        address = this.addressMapOut(address);
        const result = results[index].prices;
        const prices = {};

        if (aggregateBy === 'hour') {
          const pricesByHour = groupBy(result, r =>
            getUnixTime(startOfHour(fromUnixTime(r[0] / 1000)))
          );
          for (const key of Object.keys(pricesByHour)) {
            const price = (last(pricesByHour[key]) || [])[1] || 0;
            prices[Number(key) * 1000] = price;
          }
        } else if (aggregateBy === 'day') {
          for (const key in result) {
            const [timestamp, price] = result[key];
            prices[timestamp] = price;
          }
        }

        return [address, prices];
      })
    );

    const prices = {};
    for (const asset in assetPrices) {
      const assetPrice = assetPrices[asset];
      for (const timestamp in assetPrice) {
        const price = assetPrice[timestamp];
        if (!(timestamp in prices)) {
          prices[timestamp] = [];
        }
        prices[timestamp].push(price);
      }
    }
    return prices;
  }

  /**
   * Map address to mainnet address if app network is a testnet
   */
  public addressMapIn(address: string): string {
    try {
      const addressMap = TOKENS?.PriceChainMap;
      if (!addressMap) return address;
      const rs = getAddress(addressMap[address?.toLowerCase()] || address);
      return rs;
    } catch (error) {
      console.error('Unable to map address', address, error);
      return address;
    }
  }

  /**
   * Map mainnet address back to testnet address
   */
  public addressMapOut(address: string): string {
    const addressMap = TOKENS?.PriceChainMap;
    if (!addressMap) return address;
    return getAddress(invert(addressMap)[address.toLowerCase()] || address);
  }
}
