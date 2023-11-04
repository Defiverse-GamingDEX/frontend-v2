import { reactive, toRefs } from 'vue';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { default as GaugeRewardABI } from '@/lib/abi/gaugeReward/GaugeRewardDistributor.json';
import gaugeRewardService from './gauge-reward.services.js';

import { bnum } from '@/lib/utils';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import networksSupport from '@/constants/networks';
const GAUGE_REWARD_CONTRACT_ADDRESS =
  '0x17e53678292e675eCb0B73F7a0fB0841f8a294C7';

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

    let gasPrice = null;
    const allNetworks = [
      ...networksSupport.networks,
      ...networksSupport.networksDev,
    ];
    const currentNetwork = allNetworks.find(network => network.key == chainId);
    if (currentNetwork) {
      gasPrice = currentNetwork.price;
    }

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
export function useGaugeReward() {
  return {
    depositTokens,
  };
}
