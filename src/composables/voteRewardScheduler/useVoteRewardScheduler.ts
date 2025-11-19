import { default as ERC20ABI } from '@/lib/abi/ERC20.json';
import { default as VoteRewardSchedulerABI } from '@/lib/abi/voteRewardScheduler/voteRewardScheduler.json';
import { Contract } from '@ethersproject/contracts';
import useConfig from '@/composables/useConfig';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { VOTE_REWARD_SCHEDULER_NETWORKS } from '@/constants/voteRewardScheduler/vote-reward-networks';
import { gasPriceService } from '@/services/gas-price/gas-price.service';

const { networkConfig } = useConfig();

const voteRewardConfig = VOTE_REWARD_SCHEDULER_NETWORKS.find(
  network => network.chainId === networkConfig.chainId
);

const VOTE_REWARD_SCHEDULER_CONTRACT_ADDRESS = voteRewardConfig?.voteRewardSchedulerContractAddress;

async function getGasPrice(signer: any) {
  let price: number;

  const gasPriceParams = await gasPriceService.getGasPrice();
  if (gasPriceParams) {
    price = gasPriceParams.price;
  } else {
    price = (await signer.getGasPrice()).toNumber();
  }

  if (!price) throw new Error('Failed to fetch gas price.');

  return BigNumber(price)?.toFixed();
}

async function checkTokenAllowance(address: string, provider: any, walletAddress: string) {
  try {
    if (!VOTE_REWARD_SCHEDULER_CONTRACT_ADDRESS) {
      throw new Error('Vote reward scheduler contract address not found for current network');
    }
    
    const tokenContract = new Contract(address, ERC20ABI, provider);
    const tokenAllowance = await tokenContract.allowance(
      walletAddress,
      VOTE_REWARD_SCHEDULER_CONTRACT_ADDRESS
    );

    const rs = tokenAllowance || 0;
    return rs;
  } catch (error) {
    console.log(error, 'error');
    return error;
  }
}

async function approveToken(address: string, provider: any, walletAddress: string, signer: any, chainId: number) {
  try {
    if (!VOTE_REWARD_SCHEDULER_CONTRACT_ADDRESS) {
      throw new Error('Vote reward scheduler contract address not found for current network');
    }
    
    const contract = new Contract(address, ERC20ABI, provider);
    const tx = await contract
      .connect(signer)
      .approve(VOTE_REWARD_SCHEDULER_CONTRACT_ADDRESS, ethers.constants.MaxUint256);

    return tx;
  } catch (error) {
    console.log(error, 'error');
    throw error;
  }
}

async function depositToken(
  tokenAddress: string,
  amount: string,
  period: number,
  decimals: number,
  account: string,
  signer: any,
  currentProvider: any
) {
  try {
    if (!VOTE_REWARD_SCHEDULER_CONTRACT_ADDRESS) {
      throw new Error('Vote reward scheduler contract address not found for current network');
    }
    
    const provider = currentProvider;
    const contract = new Contract(VOTE_REWARD_SCHEDULER_CONTRACT_ADDRESS, VoteRewardSchedulerABI, provider);

    // Convert amount to wei using ethers BigNumber to preserve precision
    // Force convert to string to ensure it's a pure string
    const amountStr = String(amount);
    const decimalsValue = new BigNumber(10).pow(decimals).toFixed();
    const amountInWei = BigNumber(amountStr).times(decimalsValue).toFixed(0);
    
    // Convert to ethers BigNumber for contract call
    const amountBN = ethers.BigNumber.from(amountInWei);
    console.log(tokenAddress, 'tokenAddress');
    console.log(amountBN, 'amountBN');
    console.log(period, 'period');
    console.log(account, 'account');
    console.log(signer, 'signer');
    const tx = await contract
      .connect(signer)
      .depositToken(tokenAddress, period, amountBN);

    return tx;
  } catch (error) {
    console.log(error, 'error');
    throw error;
  }
}

async function getRewardAmounts(currentProvider: any) {
  try {
    if (!VOTE_REWARD_SCHEDULER_CONTRACT_ADDRESS) {
      throw new Error('Vote reward scheduler contract address not found for current network');
    }
    
    const provider = currentProvider;
    const contract = new Contract(VOTE_REWARD_SCHEDULER_CONTRACT_ADDRESS, VoteRewardSchedulerABI, provider);
    
    console.log('🚀 ~ Calling getRewardAmounts on contract:', VOTE_REWARD_SCHEDULER_CONTRACT_ADDRESS);
    
    // Call getRewardAmounts function from ABI
    const result = await contract.getRewardAmounts();
    console.log('🚀 ~ Raw contract result:', result);
    
    // Result is [address[], uint256[]]
    const [tokenAddresses, amounts] = result;
    console.log('🚀 ~ Token addresses:', tokenAddresses);
    console.log('🚀 ~ Amounts:', amounts);
    
    const data: any[] = [];
    
    // Combine addresses and amounts
    for (let i = 0; i < tokenAddresses.length; i++) {
      const tokenAddress = tokenAddresses[i];
      const amount = amounts[i];
      
      if (amount && amount.toString() !== '0') {
        data.push({
          token: tokenAddress,
          amount: amount.toString(),
        });
      }
    }
    
    console.log('🚀 ~ Processed data:', data);
    return data;
  } catch (error) {
    console.log('❌ ~ getRewardAmounts error:', error);
    throw error;
  }
}

async function getTokenBalance(tokenAddress: string, walletAddress: string, provider: any) {
  try {
    const tokenContract = new Contract(tokenAddress, ERC20ABI, provider);
    const balance = await tokenContract.balanceOf(walletAddress);
    return balance;
  } catch (error) {
    console.log('getTokenBalance error:', error);
    throw error;
  }
}

export function useVoteRewardScheduler() {
  return {
    checkTokenAllowance,
    approveToken,
    depositToken,
    getRewardAmounts,
    getTokenBalance,
  };
}
