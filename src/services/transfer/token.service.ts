import { TokenInfo, TokenInfoMap } from '@/types/TokenList';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { includesAddress, isSameAddress } from '@/lib/utils';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import TokenServiceCustom from '@/services/token/token.service.custom';
import ConfigServiceCustom from '@/services/config/config.service.custom';
import { default as ERC20ABI } from '@/lib/abi//ERC20.json';

export default class TokenService {
  constructor(private readonly provider: Web3Provider) {}

  public async getInfoTokenErc20(
    tokenAddress: string
  ): Promise<TokenInfo | null> {
    try {
      const network = await this.provider.getNetwork();
      const chainId = network?.chainId;
      const tokenService = new TokenServiceCustom(this.provider, chainId);
      const infors = await tokenService.metadata.get([tokenAddress], {});
      if (infors && Object.values(infors)[0]) {
        return Object.values(infors)[0];
      }
      // Multicall not supported
      const tokenContract = new Contract(tokenAddress, ERC20ABI, this.provider);
      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      const decimals = await tokenContract.decimals();
      return {
        address: getAddress(tokenAddress),
        chainId,
        name,
        symbol,
        decimals,
      };
    } catch (error) {
      console.log('getInfoTokenErc20 error', error);
      return null;
    }
  }

  public async getBalanceTokens(
    account: string,
    tokens: TokenInfoMap
  ): Promise<BalanceMap> {
    try {
      const network = await this.provider.getNetwork();
      const chainId = network?.chainId;
      const tokenService = new TokenServiceCustom(this.provider, chainId);
      const balances = await tokenService.balances.get(account, tokens);
      if (balances) {
        return balances;
      }
    } catch (error) {
      // no-op
    }

    try {
      // Multicall not supported
      const balanceMap = {};
      const network = await this.provider.getNetwork();
      const chainId = network?.chainId;
      const configService = new ConfigServiceCustom(chainId);
      const nativeAddress = configService.network.nativeAsset.address;
      let addresses = Object.keys(tokens);

      // If native asset included in addresses, filter out for
      if (includesAddress(addresses, nativeAddress)) {
        addresses = addresses.filter(
          address => !isSameAddress(address, nativeAddress)
        );
        balanceMap[nativeAddress] = await this.fetchNativeBalance(
          account,
          configService.network.nativeAsset.decimals
        );
      }
      const settledResults = await Promise.allSettled(
        addresses.map(async tokenAddress => {
          return this.fetchErc20Balance(
            account,
            tokenAddress,
            tokens[tokenAddress].decimals
          );
        })
      );
      const balances = settledResults.map(
        result => (result as any).value ?? '0'
      );

      return {
        ...balanceMap,
        ...Object.fromEntries(
          addresses.map((address, i) => [getAddress(address), balances[i]])
        ),
      };
    } catch (error) {
      console.log('getBalanceTokens error', error);
      return {};
    }
  }

  private async fetchNativeBalance(
    account: string,
    decimals: number
  ): Promise<string> {
    const balance = await this.provider.getBalance(account);
    return formatUnits(balance.toString(), decimals);
  }

  private async fetchErc20Balance(
    account: string,
    tokenAddress: string,
    decimals: number
  ): Promise<string> {
    const tokenContract = new Contract(tokenAddress, ERC20ABI, this.provider);
    const balance = await tokenContract.balanceOf(account);
    return formatUnits(balance.toString(), decimals);
  }
}
