import { reactive, toRefs } from 'vue';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { default as ERC20ABI } from '@/lib/abi//ERC20.json';
import { default as Bridge } from '@/lib/abi/bridge/Bridge.json';
import { default as IL2ERC20Bridge } from '@/lib/abi/bridge/IL2ERC20Bridge.json';
import { bnum } from '@/lib/utils';
import { ethers } from 'ethers';
async function getTokensBalance(tokens, account) {
  if (tokens.length > 0) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const balance = await getBalance(token, account);
      token.balance = balance;
    }
    return tokens;
  }
}
async function getBalance(token, walletAddress) {
  try {
    const { address, rpc } = token;
    const provider = new JsonRpcProvider(rpc);
    const tokenContract = new Contract(address, ERC20ABI, provider);
    const tokenBalance = await tokenContract.balanceOf(walletAddress);
    console.log(tokenBalance, 'getBalance=>tokenBalanceAAA');
    const weiBalance = tokenBalance?.toString();
    const rs = bnum(weiBalance).div(Math.pow(10, token?.decimals)).toNumber();

    return rs;
  } catch (error) {
    console.log(error, 'error');
    return error;
  }
}
async function checkTokenAllowance(token, walletAddress) {
  try {
    const { address, rpc } = token;
    const provider = new JsonRpcProvider(rpc);
    const tokenContract = new Contract(address, ERC20ABI, provider);
    const tokenAllowance = await tokenContract.allowance(
      walletAddress,
      address
    );
    console.log(tokenAllowance, 'checkAllowance=>tokenAllowance');

    const rs = tokenAllowance || 0;

    return rs;
  } catch (error) {
    console.log(error, 'error');
    return error;
  }
}
async function approveToken(token, walletAddress, signer) {
  try {
    const { address, rpc } = token;
    const provider = new JsonRpcProvider(rpc);
    const tokenContract = new Contract(address, ERC20ABI, provider);
    const tokenAllowance = await tokenContract.allowance(
      walletAddress,
      address
    );
    console.log(tokenAllowance, 'checkAllowance=>tokenAllowance');
    const tx = await tokenContract
      .connect(signer)
      .approve(address, ethers.constants.MaxUint256);
    console.log('tx', tx);
    // const rs = await tx.wait();
    // console.log('rs', rs);

    return tx;
  } catch (error) {
    console.log(error, 'error');
    throw error;
  }
}
export function useBridge() {
  return {
    getTokensBalance,
    getBalance,
    checkTokenAllowance,
    approveToken,
  };
}
