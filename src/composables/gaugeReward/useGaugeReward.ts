import { reactive, toRefs } from 'vue';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { default as ERC20ABI } from '@/lib/abi//ERC20.json';
import { default as GaugeRewardABI } from '@/lib/abi/gaugeReward/GaugeRewardDistributor.json';
import gaugeRewardService from './gauge-reward.services.js';

import { bnum } from '@/lib/utils';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import networksSupport from '@/constants/networks';
const GAUGE_REWARD_CONTRACT_ADDRESS =
  '0x028821fb5DB06557a7883De37D4D4fa08eB7eF2E';
import {
  GasPriceService,
  gasPriceService,
} from '@/services/gas-price/gas-price.service';

async function getGasPrice(signer: JsonRpcSigner) {
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
async function checkTokenAllowance(address, provider, walletAddress) {
  try {
    // const { address } = token;
    const tokenContract = new Contract(address, ERC20ABI, provider);
    const tokenAllowance = await tokenContract.allowance(
      walletAddress,
      GAUGE_REWARD_CONTRACT_ADDRESS
    );
    console.log(tokenAllowance, 'checkAllowance=>tokenAllowance');

    const rs = tokenAllowance || 0;

    return rs;
  } catch (error) {
    console.log(error, 'error');
    return error;
  }
}
async function approveToken(address, provider, walletAddress, signer, chainId) {
  // const { address } = token;
  try {
    const contract = new Contract(address, ERC20ABI, provider);
    const gasPrice = await getGasPrice(signer);
    console.log('contract=>approveToken', provider, contract, gasPrice);
    const tx = await contract
      .connect(signer)
      .approve(GAUGE_REWARD_CONTRACT_ADDRESS, ethers.constants.MaxUint256, {
        gasPrice: gasPrice,
      });
    console.log('tx', tx);

    return tx;
  } catch (error) {
    console.log(error, 'error');
    throw error;
  }
}
async function depositTokens(
  gaugeAddress,
  input_list,
  account,
  signer,
  currentProvider,
  chainId
) {
  try {
    const provider = currentProvider;
    console.log(
      input_list,
      account,
      signer,
      provider,
      chainId,
      networksSupport,
      'depositTokens=>params'
    );
    const tokens = input_list?.map(item => item.tokenAddress) || [];
    const periods = input_list?.map(item => item.periods) || [];
    const amounts =
      input_list?.map(item => {
        const amount = item.amount;
        const decimals = new BigNumber(10).pow(item.decimals).toFixed();
        const decimals_value = BigNumber(amount).times(decimals).toFixed(0);
        return decimals_value;
      }) || [];

    const gasPrice = await getGasPrice(signer);

    const params = {
      contractAddress: GAUGE_REWARD_CONTRACT_ADDRESS, // contract token
      contractProvider: provider, // contract provider
      gauge: gaugeAddress, // gauge pool address
      tokens: tokens, // token address array
      periods: periods, // periods arrays
      amounts: amounts,
      account,
      signer,
      abi: GaugeRewardABI,
      gasPrice: gasPrice,
    };
    console.log(params, 'handleTransferButton=>params');

    const tx = await gaugeRewardService.depositTokens(params);

    return tx;
  } catch (error) {
    console.log(error, 'error');
    throw error;
  }
}
async function startDistributions(account, signer, currentProvider, chainId) {
  try {
    const provider = currentProvider;

    const gasPrice = await getGasPrice(signer);

    const params = {
      contractAddress: GAUGE_REWARD_CONTRACT_ADDRESS, // contract token
      contractProvider: provider, // contract provider
      account,
      signer,
      abi: GaugeRewardABI,
      gasPrice: gasPrice,
    };
    console.log(params, 'startDistributions=>params');

    const tx = await gaugeRewardService.startDistributions(params);

    return tx;
  } catch (error) {
    console.log(error, 'error');
    throw error;
  }
}
async function getRewardTokens(gaugeAddress, currentProvider) {
  try {
    const provider = currentProvider;

    const params = {
      contractAddress: GAUGE_REWARD_CONTRACT_ADDRESS, // contract token
      contractProvider: provider, // contract provider
      gaugeAddress: gaugeAddress,
      abi: GaugeRewardABI,
    };
    console.log(params, 'getRewardTokens=>params');

    const tx = await gaugeRewardService.getRewardTokens(params);

    return tx;
  } catch (error) {
    console.log(error, 'error');
    throw error;
  }
}

export function useGaugeReward() {
  return {
    checkTokenAllowance,
    approveToken,
    depositTokens,
    startDistributions,
    getRewardTokens,
  };
}
