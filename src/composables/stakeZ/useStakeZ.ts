import { default as ERC20ABI } from '@/lib/abi//ERC20.json';
import { bnum } from '@/lib/utils';
import { Contract } from '@ethersproject/contracts';
import { ethers } from 'ethers';
import SZ_TOKEN_ABI from '@/lib/abi/stakeZ/sZ.json';
import { STAKE_Z_NETWORKS } from '@/constants/stakeZ';
import stakeZService from './stakeZ.service';
import stakeZPriceAPI from './stakeZ.price.api';
// real function - START - TODO
function truncateDecimal(number, precision) {
  const [integerPart, fractionalPart] = number.toString().split('.');

  if (!fractionalPart) {
    return integerPart;
  }

  const truncatedFractionalPart = fractionalPart.slice(0, precision);

  // Combine the integer part and the truncated fractional part
  const result =
    integerPart +
    (truncatedFractionalPart ? '.' + truncatedFractionalPart : '');

  // Convert to a number and back to string to remove trailing zeros
  return parseFloat(result).toString();
}
function checkIsNative(tokenAddress, chainId) {
  if (chainId === 248) {
    // OASYS
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return true;
    } else {
      return false;
    }
  } else {
    if (tokenAddress === '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000') {
      return true;
    } else {
      return false;
    }
  }
}

async function getTokenBalance({
  provider,
  tokenAddress,
  walletAddress,
  tokenDecimals,
}) {
  try {
    const currentProvider = provider;
    const tokenContract = new Contract(tokenAddress, ERC20ABI, currentProvider);
    const tokenBalance = await tokenContract.balanceOf(walletAddress);
    const weiBalance = tokenBalance?.toString();
    const rs = bnum(weiBalance).div(Math.pow(10, tokenDecimals)).toFixed();

    return rs;
  } catch (error) {
    console.log(error, 'error');
    return error;
  }
}
async function checkTokenAllowance({
  provider,
  tokenAddress,
  walletAddress,
  contractAddress,
}) {
  try {
    const tokenContract = new Contract(tokenAddress, ERC20ABI, provider);
    const tokenAllowance = await tokenContract.allowance(
      walletAddress,
      contractAddress
    );

    const rs = tokenAllowance || 0;

    return rs;
  } catch (error) {
    console.log(error, 'error');
    return error;
  }
}
async function approveToken({
  provider,
  tokenAddress,
  signer,
  approveAmount,
  contractAddress,
}) {
  try {
    const contract = new Contract(tokenAddress, ERC20ABI, provider);
    if (!approveAmount) {
      approveAmount = ethers.constants.MaxUint256;
    }
    
    // Handle both ethers.BigNumber and string/number inputs
    let amountBN;
    if (ethers.BigNumber.isBigNumber(approveAmount)) {
      // Already a BigNumber, use it directly
      amountBN = approveAmount;
    } else {
      // Convert string/number to BigNumber
      const amountStr = String(approveAmount);
      amountBN = ethers.BigNumber.from(amountStr);
    }
    
    const tx = await contract
      .connect(signer)
      .approve(contractAddress, amountBN);
    return tx;
  } catch (error) {
    console.log(error, 'approveToken=>error');
    throw error;
  }
}

async function getLockedZAmount(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.getLockedZAmount(params);
    return rs;
  } catch (error) {
    console.log(error, 'getLockedZAmount=>error');
    throw error;
  }
}
async function getMaturityPeriod(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.getMaturityPeriod(params);
    return rs;
  } catch (error) {
    console.log(error, 'getMaturityPeriod=>error');
    throw error;
  }
}
async function getEstimateSzAmount(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.getEstimateSzAmount(params);
    return rs;
  } catch (error) {
    console.log(error, 'getEstimateSzAmount=>error');
    throw error;
  }
}
async function getEstimateZAmount(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.getEstimateZAmount(params);
    return rs;
  } catch (error) {
    console.log(error, 'getEstimateZAmount=>error');
    throw error;
  }
}
async function canRedeemAll(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.canRedeemAll(params);
    return rs;
  } catch (error) {
    console.log(error, 'canRedeemAll=>error');
    throw error;
  }
}
async function getAllRedeemableAmount_SZ(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.getAllRedeemableAmount_SZ(params);
    return rs;
  } catch (error) {
    console.log(error, 'getAllRedeemableAmount_SZ=>error');
    throw error;
  }
}
async function getRedeemableAmount_SZ(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.getRedeemableAmount_SZ(params);
    return rs;
  } catch (error) {
    console.log(error, 'getRedeemableAmount_SZ=>error');
    throw error;
  }
}
async function getRedeemableAmount_Z(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.getRedeemableAmount_Z(params);
    return rs;
  } catch (error) {
    console.log(error, 'getRedeemableAmount_Z=>error');
    throw error;
  }
}
async function getEarlyRedeemPenalty(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.getEarlyRedeemPenalty(params);
    return rs;
  } catch (error) {
    console.log(error, 'getEarlyRedeemPenalty=>error');
    throw error;
  }
}
async function getRedeemAllInfo(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.getRedeemAllInfo(params);
    return rs;
  } catch (error) {
    console.log(error, 'getRedeemAllInfo=>error');
    throw error;
  }
}
async function stakeZ(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.stakeZ(params);
    return rs;
  } catch (error) {
    console.log(error, 'stakeZ=>error');
    throw error;
  }
}
async function stakeZForTest(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.stakeZForTest(params);
    return rs;
  } catch (error) {
    console.log(error, 'stakeZ=>error');
    throw error;
  }
}
async function getStakedList(params) {
  try {
    const rs = await stakeZPriceAPI.getStakedList(params);
    return rs;
  } catch (error) {
    console.log(error, 'getStakedList=>error');
    throw error;
  }
}
async function redeemAllSZ(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.redeemAllSZ(params);
    return rs;
  } catch (error) {
    console.log(error, 'redeemAllSZ=>error');
    throw error;
  }
}
async function redeemSZ(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.redeemSZ(params);
    return rs;
  } catch (error) {
    console.log(error, 'redeemSZ=>error');
    throw error;
  }
}
export function useStakeZ() {
  return {
    truncateDecimal,
    checkIsNative,
    getTokenBalance,
    checkTokenAllowance,
    approveToken,
    stakeZ,
    getLockedZAmount,
    getMaturityPeriod,
    getEstimateSzAmount,
    getEstimateZAmount,
    getAllRedeemableAmount_SZ,
    getRedeemableAmount_SZ,
    getRedeemableAmount_Z,
    getEarlyRedeemPenalty,
    getStakedList,
    redeemAllSZ,
    redeemSZ,
    stakeZForTest,
    canRedeemAll,
    getRedeemAllInfo,
  };
}
