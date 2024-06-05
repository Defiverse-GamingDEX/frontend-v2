import defiIcon from '@/assets/images/bridge/tokens/defi.png';
import ethIcon from '@/assets/images/bridge/tokens/eth.png';
import oasIcon from '@/assets/images/bridge/tokens/oas.png';
import tcgcIcon from '@/assets/images/bridge/tokens/tcgc.png';
import usdcIcon from '@/assets/images/bridge/tokens/usdc.png';
import usdtIcon from '@/assets/images/bridge/tokens/usdt.png';
import wbtcIcon from '@/assets/images/bridge/tokens/wbtc.png';
import bridgeService from '@/composables/bridge/bridge.services';
import { BRIDGE_NETWORKS } from '@/constants/bridge/networks';
import { default as ERC20ABI } from '@/lib/abi//ERC20.json';
import { bnum } from '@/lib/utils';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
const VBRIDGE_CONTRACT_ADDRESS = '0xa5c4db36bd26426c186d170bf46165a937d9cad1';
// real function - START - TODO
function truncateDecimal(number, precision) {
  const [integerPart, fractionalPart] = number.toString().split('.');
  const truncatedFractionalPart = fractionalPart
    ? fractionalPart.slice(0, precision)
    : '';
  return (
    integerPart + (truncatedFractionalPart ? '.' + truncatedFractionalPart : '')
  );
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
function getTokenURL(tokenSymbol) {
  switch (tokenSymbol) {
    case 'ETH':
      return ethIcon;
    case 'WBTC':
      return wbtcIcon;
    case 'USDT':
      return usdtIcon;
    case 'USDC':
      return usdcIcon;
    case 'OAS':
      return oasIcon;
    case 'DFV':
      return defiIcon;
    case 'TCGC':
      return tcgcIcon;
    default:
      return ethIcon;
  }
}
const getTxUrl = (txId, chainInfo) => {
  if (!txId) {
    return '';
  }
  if (chainInfo?.chain_id_decimals === 1) {
    // ethereum
    return `${chainInfo?.explorer}/tx/${txId}`;
  }
  if (chainInfo?.chain_id_decimals === 137) {
    // polygon mainnet
    return `${chainInfo?.explorer}/tx/${txId}`;
  } else {
    // Verse explorer
    return `${chainInfo?.explorer}/tx/${txId}`;
  }
};
const mapTxHistory = data => {
  console.log('🚀 ~ mapTxHistory ~ data:', data);
  let rs: any = null;
  if (data) {
    console.log('🚀 ~ mapTxHistory ~ data:', data);
    rs = {
      status: data.status,
      date: data.src_timestamp,
      tokenIn: {
        address: data.src_token?.address,
        symbol: data.src_token?.symbol,
        chainId: data.src_token?.chain_id,
        amount: BigNumber(data.amount_in)
          .div(10 ** data?.src_token?.decimals)
          .toFixed(),
      },
      router_1: {
        status: 'success', // 'failed' : 'pending',  // TODO
        router_contract_name: 'cBridge', // TODO
        txId: data.src_tx_id,
        inboundTx: null, // TODO
        outboundTx: null, // TODO
        isRetry: false, // TODO
      },
      tokenReplay: {
        address: data.relay_token?.address,
        symbol: data.relay_token?.symbol,
        chainId: data.relay_token?.chain_id,
        amount: BigNumber(data?.amount_in)
          .div(10 ** data?.src_token?.decimals)
          .toFixed(), //TODO
      },
      router_2: {
        status: 'pending',
        router_contract_name: 'Oasysverse Bridge', // TODO
        txId: null, // TODO
        inboundTx:
          '0x648d20c4fbdac3007abd76b30497b159951c235428d4627d21ca645250bf6b8b', // TODO
        outboundTx:
          '0x648d20c4fbdac3007abd76b30497b159951c235428d4627d21ca645250bf6b8b', // TODO
        isRetry: false, // true : false, // TODO
      },
      tokenOut: {
        address: data.dst_token?.address,
        symbol: data.dst_token?.symbol,
        chainId: data.dst_token?.chain_id,
        amount: BigNumber(data?.amount_out)
          .div(10 ** data?.dst_token?.decimals)
          .toFixed(),
      },
    };
    // map data to show

    //tokenIn
    const tokenIn_chain = getChain(rs.tokenIn.chainId);
    console.log(tokenIn_chain, 'tokenIn_chain');
    rs.tokenIn.chainName = tokenIn_chain?.name;
    rs.tokenIn.chainUrl = tokenIn_chain?.img_url;
    rs.tokenIn.logoURI = getTokenURL(rs.tokenIn.symbol);

    //router_1
    rs.router_1.txId_url = getTxUrl(rs.router_1.txId, tokenIn_chain);
    rs.router_1.inboundTx_url = getTxUrl(rs.router_1.inboundTx, tokenIn_chain);
    rs.router_1.outboundTx_url = getTxUrl(
      rs.router_1.outboundTx,
      tokenIn_chain
    );

    //tokenReply
    const tokenReply_chain = getChain(rs.tokenReplay.chainId);
    console.log(tokenReply_chain, 'tokenReply_chain');
    rs.tokenReplay.chainName = tokenReply_chain?.name;
    rs.tokenReplay.chainUrl = tokenReply_chain?.img_url;
    rs.tokenReplay.logoURI = getTokenURL(rs.tokenReplay.symbol);

    //router_2
    rs.router_2.txId_url = getTxUrl(rs.router_2.txId, tokenReply_chain);
    rs.router_2.inboundTx_url = getTxUrl(
      rs.router_2.inboundTx,
      tokenReply_chain
    );
    rs.router_2.outboundTx_url = getTxUrl(
      rs.router_2.outboundTx,
      tokenReply_chain
    );

    //tokenOut
    const tokenOut_chain = getChain(rs.tokenOut.chainId);
    rs.tokenOut.chainName = tokenOut_chain?.name;
    rs.tokenOut.chainUrl = tokenOut_chain?.img_url;
    rs.tokenOut.logoURI = getTokenURL(rs.tokenOut.symbol);
  }
  return rs;
};
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
    const { address, rpc, provider } = token;
    let currentProvider = provider;
    if (!provider) {
      currentProvider = new JsonRpcProvider(rpc);
    }
    const tokenContract = new Contract(address, ERC20ABI, currentProvider);
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

async function bridgeSend(
  inputFromSelect,
  inputToSelect,
  account,
  signer,
  provider
) {
  console.log('🚀 ~ bridgeSend ~ inputToSelect:', inputToSelect);
  console.log('🚀 ~ bridgeSend ~ inputFromSelect:', inputFromSelect);
  try {
    const chainFrom = getChain(inputFromSelect.chainId);
    console.log('🚀 ~ chainFrom:', chainFrom);
    const tokenInputFrom = getToken(
      inputFromSelect.tokenAddress,
      inputFromSelect.tokensList
    );
    console.log('🚀 ~ tokenInputFrom:', tokenInputFrom);
    const chainTo = getChain(inputToSelect.chainId);
    console.log('🚀 ~ chainTo:', chainTo);
    const tokenInputTo = getToken(
      inputToSelect.tokenAddress,
      inputToSelect.tokensList
    );

    console.log('🚀 ~ tokenInputTo:', tokenInputTo);
    let rs = null;
    if (chainFrom.type === 'external-chain') {
      if (chainTo.type === 'external-chain') {
        throw new Error('Not support');
      } else {
        // chainTo.type === 'verse-chain'
        // external-chain => verse-chain
        const params = {
          contractAddress: chainFrom?.bridgeContract, // contract token
          contractProvider: provider, // contract provider
          account,
          srcTokenDecimal: tokenInputFrom?.decimals,
          value: inputFromSelect?.amount, // amount
          vBridgeAddress: VBRIDGE_CONTRACT_ADDRESS,
          srcTokenAddress: tokenInputFrom?.address,
          desChainId: chainTo?.chainId,
          signer,
          slippage: 10000,
          abi: chainFrom?.bridgeABI,
          gasPrice: chainFrom?.gasPrice,
        };
        rs = await bridgeService.bridgeSend(params);
      }
    } else {
      // chainFrom.type === 'verse-chain'
      if (chainTo.type === 'external-chain') {
        // verse-chain => external-chain
        const params = {
          contractAddress: chainFrom?.bridgeContract,
          contractProvider: provider,
          account,
          srcTokenDecimal: tokenInputFrom?.decimals,
          srcTokenSymbol: tokenInputFrom?.symbol,
          value: inputFromSelect?.amount, // amount
          vBridgeAddress: VBRIDGE_CONTRACT_ADDRESS,
          srcTokenAddress: tokenInputFrom?.address, // account address
          signer,
          abi: chainFrom?.bridgeABI,
          gasPrice: chainFrom?.gasPrice,
        };
        rs = await bridgeService.withdrawTo(params);
      } else {
        // verse-chain => verse-chain
        const params = {
          contractAddress: chainFrom?.bridgeContract,
          contractProvider: provider,
          account,
          srcTokenDecimal: tokenInputFrom?.decimals,
          srcTokenSymbol: tokenInputFrom?.symbol,
          value: inputFromSelect?.amount, // amount
          vBridgeAddress: VBRIDGE_CONTRACT_ADDRESS,
          srcTokenAddress: tokenInputFrom?.address, // account address
          signer,
          abi: chainFrom?.bridgeABI,
          gasPrice: chainFrom?.gasPrice,
        };
        console.log('🚀 ~ params:', params);
        rs = await bridgeService.bridgeWithdrawTo(params);
      }
    }

    return rs;
  } catch (error) {
    console.log(error, 'error');
    throw error;
  }
}
export function useBridge() {
  return {
    truncateDecimal,
    getTokenURL,
    checkIsNative,
    mapTxHistory,

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
