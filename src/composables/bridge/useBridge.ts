import { reactive, toRefs } from 'vue';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { default as ERC20ABI } from '@/lib/abi//ERC20.json';
import { default as BridgeABI } from '@/lib/abi/bridge/Bridge.json';
import { default as IL2ERC20BridgeABI } from '@/lib/abi/bridge/IL2ERC20Bridge.json';
import { OASYS_TESTNET_NETWORK } from '@/constants/bridge/oasys-testnet-network';
import { BRIDGE_NETWORKS } from '@/constants/bridge/networks';
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
function getChainName(chainId) {
  return BRIDGE_NETWORKS.find(item => item.chain_id_decimals === chainId)?.name;
}
function getChain(chainId) {
  return BRIDGE_NETWORKS.find(item => item.chain_id_decimals === chainId);
}

function getToken(tokenAddress, list) {
  return list?.find(item => item.address === tokenAddress) || null;
}
function getChainTransfer(chainFrom, tokenInputFrom, chainTo, tokenInputTo) {
  const rs = {};
  if (chainFrom.type === 'L1') {
    if (chainTo.type === 'L1') {
      // L1 to L1 example Goerli to AVAX testnet : sendNative
      rs.abi = BridgeABI;
      rs.provider = new JsonRpcProvider(chainFrom?.rpc); // TODO
      rs.chainId = chainTo.chain_id_decimals;
      rs.type = 'L1toL1';
    } else {
      // L1 to L2
      rs.abi = BridgeABI;
      rs.provider = new JsonRpcProvider(chainFrom?.rpc); // TODO
      rs.chainId = OASYS_TESTNET_NETWORK.chain_id_decimals;
      rs.type = 'L1toL2';
    }
  } else {
    if (chainTo.type === 'L1') {
      // L2 to L1
      rs.type = 'L2toL1';
    } else {
      // L2 to L2
      rs.type = 'L2toL2';
    }
  }
  return rs;
}
async function bridgeSend(
  inputFromSelect,
  inputToSelect,
  slippage,
  account,
  signer
) {
  try {
    const chainFrom = getChain(inputFromSelect.chainId);
    const tokenInputFrom = getToken(
      inputFromSelect.tokenAddress,
      inputFromSelect.tokensList
    );
    const chainTo = getChain(inputToSelect.chainId);
    const tokenInputTo = getToken(
      inputToSelect.tokenAddress,
      inputToSelect.tokensList
    );
    const chainTransfer = getChainTransfer(
      chainFrom,
      tokenInputFrom,
      chainTo,
      tokenInputTo
    );

    const params = {
      contractAddress: chainFrom?.bridgeContract,
      tokenAddress: inputFromSelect.tokenAddress,
      tokenDecimal: tokenInputFrom?.decimals,
      value: inputFromSelect.amount,
      account: account,
      signer: signer,
      slippage: parseFloat(slippage || '0'),
      gasPrice: chainFrom?.gasPrice,
      abi: chainTransfer?.abi,
      contractProvider: chainTransfer?.provider,
      chainId: chainTransfer?.chainId,
    };
    console.log(params, 'handleTransferButton=>params');
    // const provider = new JsonRpcProvider(OASYS_TESTNET_NETWORK?.rpc);
    // const chainId = OASYS_TESTNET_NETWORK.chain_id_decimals;
    let tx = null;
    if (chainTransfer.type === 'L1toL1') {
      //tx = await bridgeService.bridgeSendNative(params);
      tx = await bridgeService.bridgeSend(params);
    } else if (chainTransfer.type === 'L1toL2') {
      tx = await bridgeService.bridgeSend(params);
    }

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
    bridgeSend,
    getChainName,
    getChain,
    getToken,
  };
}
