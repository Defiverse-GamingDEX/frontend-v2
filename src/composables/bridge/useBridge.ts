import { reactive, toRefs } from 'vue';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { default as ERC20ABI } from '@/lib/abi//ERC20.json';
import { default as BridgeABI } from '@/lib/abi/bridge/Bridge.json';
import { default as IL2ERC20BridgeABI } from '@/lib/abi/bridge/IL2ERC20Bridge.json';
import { OASYS_TESTNET_NETWORK } from '@/constants/bridge/oasys-testnet-network';
import bridgeService from './bridge.services.js';

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
async function checkTokenAllowance(chain, token, walletAddress) {
  try {
    const { address } = token;
    const { bridgeContract, rpc } = chain;
    const provider = new JsonRpcProvider(rpc);
    const tokenContract = new Contract(address, ERC20ABI, provider);
    const tokenAllowance = await tokenContract.allowance(
      walletAddress,
      bridgeContract
    );
    console.log(tokenAllowance, 'checkAllowance=>tokenAllowance');

    const rs = tokenAllowance || 0;

    return rs;
  } catch (error) {
    console.log(error, 'error');
    return error;
  }
}
async function approveToken(chain, token, walletAddress, signer) {
  try {
    const { address } = token;
    const { bridgeContract, rpc } = chain;
    const provider = new JsonRpcProvider(rpc);
    const contract = new Contract(address, ERC20ABI, provider);
    const tx = await contract
      .connect(signer)
      .approve(bridgeContract, ethers.constants.MaxUint256);
    console.log('tx', tx);
    // const rs = await tx.wait();
    // console.log('rs', rs);

    return tx;
  } catch (error) {
    console.log(error, 'error');
    throw error;
  }
}
function initDesChain(params, type) {
  if (params.desChainId) return null;
}
async function bridgeSend(params, type) {
  try {
    const provider = new JsonRpcProvider(OASYS_TESTNET_NETWORK?.rpc);
    const chainId = OASYS_TESTNET_NETWORK.chain_id_decimals;
    //const proivder = initDesChain(params, type);
    if (type === 'l1ToVerse') {
      params.abi = BridgeABI;
      params.contractProvider = provider;
      params.chainId = chainId;
      const tx = await bridgeService.bridgeSend(params);
      return tx;
    } else {
      params.abi = BridgeABI;
      params.contractProvider = provider;
      params.chainId = chainId;
      console.log(params, 'params=>bridgeSend=>Compoables');
      const tx = await bridgeService.bridgeSend(params);
      return tx;
    }
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
    bridgeSend,
  };
}
