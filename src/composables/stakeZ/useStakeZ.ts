import { default as ERC20ABI } from '@/lib/abi//ERC20.json';
import { bnum } from '@/lib/utils';
import { Contract } from '@ethersproject/contracts';
import { ethers } from 'ethers';
import SZ_TOKEN_ABI from '@/lib/abi/stakeZ/sZ.json';
import { STAKE_Z_NETWORKS } from '@/constants/stakeZ';
import stakeZService from './stakeZ.service';
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
    const tx = await contract
      .connect(signer)
      .approve(contractAddress, approveAmount);
    return tx;
  } catch (error) {
    console.log(error, 'approveToken=>error');
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
async function getLockedZAmount(params) {
  try {
    params.abi = SZ_TOKEN_ABI;
    const rs = await stakeZService.getLockedZAmount(params);
    console.log('🚀 ~ getLockedZAmount ~ rs:', rs);
    return rs;
  } catch (error) {
    console.log(error, 'getLockedZAmount=>error');
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
  };
}
