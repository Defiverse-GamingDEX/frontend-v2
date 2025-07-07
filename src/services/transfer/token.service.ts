import { TokenInfo, TokenInfoMap, ExtendedTokenInfo } from '@/types/TokenList';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { MaxUint256 } from '@ethersproject/constants';
import { includesAddress, isSameAddress, bnum } from '@/lib/utils';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider, TransactionResponse } from '@ethersproject/providers';
import TokenServiceCustom from '@/services/token/token.service.custom';
import ConfigServiceCustom from '@/services/config/config.service.custom';
import { default as ERC20ABI } from '@/lib/abi//ERC20.json';
import { default as DisperseABI } from '@/lib/abi//Disperse.json';
import { default as ERC721ABI } from '@/lib/abi//ERC721.json';
import { default as ERC1155ABI } from '@/lib/abi//ERC1155.json';
import { default as NftTransferABI } from '@/lib/abi//NftTransfer.json';
import { Transaction } from './transaction';

export default class TokenService {
  constructor(private readonly provider: Web3Provider) {}

  /**
   *
   * ERC20
   *
   */

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

  public async fetchNativeBalance(
    account: string,
    decimals: number
  ): Promise<string> {
    const balance = await this.provider.getBalance(account);
    return formatUnits(balance.toString(), decimals);
  }

  public async fetchErc20Balance(
    account: string,
    tokenAddress: string,
    decimals: number
  ): Promise<string> {
    const tokenContract = new Contract(tokenAddress, ERC20ABI, this.provider);
    const balance = await tokenContract.balanceOf(account);
    return formatUnits(balance.toString(), decimals);
  }

  public async fetchErc20Allowance(
    account: string,
    spender: string,
    tokenAddress: string,
    decimals: number
  ): Promise<string> {
    const tokenContract = new Contract(tokenAddress, ERC20ABI, this.provider);
    const allowance = await tokenContract.allowance(account, spender);
    return formatUnits(allowance.toString(), decimals);
  }

  private overrides = {
    137: {
      maxFeePerGas: '300000000000',
      maxPriorityFeePerGas: '300000000000',
    },
    80001: {
      maxFeePerGas: '300000000000',
      maxPriorityFeePerGas: '300000000000',
    },
  };

  public async approveTokenErc20(
    spender: string,
    token: string
  ): Promise<TransactionResponse> {
    const transaction = new Transaction(this.provider.getSigner());
    return await transaction.sendTransaction({
      contractAddress: token,
      abi: ERC20ABI,
      action: 'approve',
      params: [spender, MaxUint256.toString()],
    });
  }

  public async disperseToken(
    contractAddress: string,
    token: string,
    recipients: string[],
    amounts: string[]
  ) {
    const transaction = new Transaction(this.provider.getSigner());
    const network = await this.provider.getNetwork();
    const chainId = network?.chainId;
    return await transaction.sendTransaction({
      contractAddress: contractAddress,
      abi: DisperseABI,
      action: 'disperseTokenSimple',
      params: [token, recipients, amounts],
      options: this.overrides[chainId] || {},
    });
  }

  public async disperseNative(
    contractAddress: string,
    recipients: string[],
    amounts: string[]
  ) {
    const transaction = new Transaction(this.provider.getSigner());
    const network = await this.provider.getNetwork();
    const chainId = network?.chainId;
    const amountTotal = amounts
      .reduce((totalValue, amount) => totalValue.plus(amount ?? 0), bnum(0))
      .toString();
    return await transaction.sendTransaction({
      contractAddress: contractAddress,
      abi: DisperseABI,
      action: 'disperseEther',
      params: [recipients, amounts],
      options: {
        value: amountTotal,
        ...(this.overrides[chainId] || {}),
      },
    });
  }

  /**
   *
   * ERC721
   *
   */

  public async getInfoTokenErc721(
    tokenAddress: string
  ): Promise<ExtendedTokenInfo | null> {
    try {
      const network = await this.provider.getNetwork();
      const chainId = network?.chainId;
      const tokenContract = new Contract(
        tokenAddress,
        ERC721ABI,
        this.provider
      );
      const name = await tokenContract.name();
      return {
        address: getAddress(tokenAddress),
        chainId,
        name,
        symbol: '',
        decimals: 0,
        type: 'erc721',
      };
    } catch (error) {
      console.log('getInfoTokenErc721 error', error);
      return null;
    }
  }

  public async erc721OwnerOf(
    tokenAddress: string,
    tokenId: string | number
  ): Promise<string> {
    try {
      const tokenContract = new Contract(
        tokenAddress,
        ERC721ABI,
        this.provider
      );
      const owner = await tokenContract.ownerOf(tokenId);
      return owner;
    } catch (error) {
      console.log('erc721OwnerOf error', error);
      return '';
    }
  }

  public async erc721IsApprovedForAll(
    tokenAddress: string,
    operator: string
  ): Promise<boolean> {
    try {
      const tokenContract = new Contract(
        tokenAddress,
        ERC721ABI,
        this.provider
      );
      const res = await tokenContract.isApprovedForAll(operator);
      return res;
    } catch (error) {
      console.log('erc721IsApprovedForAll error', error);
      return false;
    }
  }

  public async erc721SetApprovalForAll(
    tokenAddress: string,
    operator: string,
    setValue: boolean
  ) {
    const transaction = new Transaction(this.provider.getSigner());
    return await transaction.sendTransaction({
      contractAddress: tokenAddress,
      abi: ERC721ABI,
      action: 'setApprovalForAll',
      params: [operator, setValue],
      options: {},
    });
  }

  public async transferERC721(
    contractAddress: string,
    token: string,
    recipients: string[],
    tokenIs: string[]
  ) {
    const transaction = new Transaction(this.provider.getSigner());
    return await transaction.sendTransaction({
      contractAddress: contractAddress,
      abi: NftTransferABI,
      action: 'transferERC721',
      params: [token, recipients, tokenIs],
      options: {},
    });
  }

  /**
   *
   * ERC1155
   *
   */

  public async transferERC1155(
    contractAddress: string,
    token: string,
    recipients: string[],
    tokenIs: string[],
    amounts: string[]
  ) {
    const transaction = new Transaction(this.provider.getSigner());
    return await transaction.sendTransaction({
      contractAddress: contractAddress,
      abi: NftTransferABI,
      action: 'transferERC1155',
      params: [token, recipients, tokenIs, amounts],
      options: {},
    });
  }

  public async getInfoTokenErc1155(
    tokenAddress: string
  ): Promise<ExtendedTokenInfo | null> {
    try {
      const network = await this.provider.getNetwork();
      const chainId = network?.chainId;
      const tokenContract = new Contract(
        tokenAddress,
        ERC1155ABI,
        this.provider
      );
      return {
        address: getAddress(tokenAddress),
        chainId,
        name: '',
        symbol: '',
        decimals: 0,
        type: 'erc1155',
      };
    } catch (error) {
      console.log('getInfoTokenErc1155 error', error);
      return null;
    }
  }

  public async erc1155IsApprovedForAll(
    tokenAddress: string,
    operator: string
  ): Promise<boolean> {
    try {
      const tokenContract = new Contract(
        tokenAddress,
        ERC1155ABI,
        this.provider
      );
      const res = await tokenContract.isApprovedForAll(operator);
      return res;
    } catch (error) {
      console.log('erc1155IsApprovedForAll error', error);
      return false;
    }
  }

  public async erc1155SetApprovalForAll(
    tokenAddress: string,
    operator: string,
    setValue: boolean
  ) {
    const transaction = new Transaction(this.provider.getSigner());
    return await transaction.sendTransaction({
      contractAddress: tokenAddress,
      abi: ERC1155ABI,
      action: 'setApprovalForAll',
      params: [operator, setValue],
      options: {},
    });
  }

  public async erc721BalanceOf(
    tokenAddress: string,
    acount: string,
    tokenId: string | number
  ): Promise<string> {
    try {
      const tokenContract = new Contract(
        tokenAddress,
        ERC721ABI,
        this.provider
      );
      const res = await tokenContract.balanceOf(acount, tokenId);
      return res;
    } catch (error) {
      console.log('erc721OwnerOf error', error);
      return '';
    }
  }
}
