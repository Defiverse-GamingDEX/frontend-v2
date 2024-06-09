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
const getRouteContractName = chainId => {
  const chain = BRIDGE_NETWORKS.find(
    network => network.chain_id_decimals === chainId
  );
  if (chain?.type === 'external-chain') {
    return 'cBridge';
  }
  return 'OasysBridge';
};
const getStatusName = status => {
  switch (status) {
    case 'NEW':
      return 'New';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'RELAY_PROCESSING':
      return 'Relay Processing';
    case 'RELAY_ERROR':
      return 'Relay Error';
    case 'RELAY_COMPLETED':
      return 'Relay Completed';
    case 'DST_ERROR':
      return 'DST Error';
    case 'COMPLETED':
      return 'Completed';
    case 'ERROR':
      return 'Error';
    default:
      return 'Unknown';
  }
};
const getRouteStatus = status => {
  switch (status) {
    case 'NEW':
      return {
        status_route_1: 'pending',
        status_route_2: null,
      };
    case 'CONFIRMED':
      return {
        status_route_1: 'pending',
        status_route_2: null,
      };
    case 'RELAY_PROCESSING':
      return {
        status_route_1: 'success',
        status_route_2: 'pending',
      };
    case 'RELAY_ERROR':
      return {
        status_route_1: 'success',
        status_route_2: 'failed',
      };
    case 'RELAY_COMPLETED':
      return {
        status_route_1: 'success',
        status_route_2: 'pending',
      };
    case 'DST_ERROR':
      return {
        status_route_1: 'success',
        status_route_2: 'failed',
      };
    case 'COMPLETED':
      return {
        status_route_1: 'success',
        status_route_2: 'success',
      };
    case 'ERROR':
      return {
        status_route_1: 'failed',
        status_route_2: 'failed',
      };
    default:
      return {
        status_route_1: null,
        status_route_2: null,
      };
  }
};
const mapTxHistory = data => {
  let rs: any = null;
  if (data) {
    const { status_route_1, status_route_2 } = getRouteStatus(data.status);

    rs = {
      status: data.status,
      statusName: getStatusName(data.status),
      date: data.src_timestamp,
      tokenIn: {
        address: data.src_token?.address,
        symbol: data.src_token?.symbol,
        chainId: data.src_token?.chain_id,
        amount: truncateDecimal(
          BigNumber(data.amount_in)
            .div(10 ** data?.src_token?.decimals)
            .toFixed(6),
          6
        ),
      },
      router_1: {
        status: status_route_1, // 'failed' : 'pending',  // TODO
        router_contract_name: getRouteContractName(data.src_token?.chain_id),
        txId: data.src_tx_id, // route_1 only has txId
        inboundTx: null,
        outboundTx: null,
        isRetry: false,
      },
      tokenReplay: {
        address: data.relay_token?.address,
        symbol: data.relay_token?.symbol,
        chainId: data.relay_token?.chain_id,
        amount: truncateDecimal(
          BigNumber(data?.amount_relay || 0)
            .div(10 ** data?.relay_token?.decimals)
            .toFixed(),
          6
        ),
      },
      router_2: {
        status: status_route_2,
        router_contract_name: getRouteContractName(data.dst_token?.chain_id),
        txId: null,
        inboundTx: data.relay_tx_id, // route_2  has inboundTx
        outboundTx: data.dst_tx_id, // route_2  has outboundTx
        isRetry: false, // true : false, // TODO
      },
      tokenOut: {
        address: data.dst_token?.address,
        symbol: data.dst_token?.symbol,
        chainId: data.dst_token?.chain_id,
        amount: truncateDecimal(
          BigNumber(data?.amount_out)
            .div(10 ** data?.dst_token?.decimals)
            .toFixed(),
          6
        ),
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
    // rs.router_1.inboundTx_url = getTxUrl(rs.router_1.inboundTx, {
    //   tokenIn_chain,
    // });
    // rs.router_1.outboundTx_url = getTxUrl(
    //   rs.router_1.outboundTx,
    //   tokenOut
    // );

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

    //tokenOut
    const tokenOut_chain = getChain(rs.tokenOut.chainId);
    rs.tokenOut.chainName = tokenOut_chain?.name;
    rs.tokenOut.chainUrl = tokenOut_chain?.img_url;
    rs.tokenOut.logoURI = getTokenURL(rs.tokenOut.symbol);

    rs.router_2.outboundTx_url = getTxUrl(
      rs.router_2.outboundTx,
      tokenOut_chain
    );
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
async function approveToken(
  chain,
  token,
  walletAddress,
  signer,
  approveAmount
) {
  try {
    const { address } = token;
    console.log('🚀 ~ address:', address);
    const { bridgeContract, rpc } = chain;
    console.log('🚀 ~ bridgeContract:', bridgeContract);
    const provider = new JsonRpcProvider(rpc);
    const contract = new Contract(address, ERC20ABI, provider);
    if (!approveAmount) {
      approveAmount = ethers.constants.MaxUint256;
    }
    const tx = await contract
      .connect(signer)
      .approve(bridgeContract, approveAmount);
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
          //desChainId: chainTo?.chain_id_decimals,
          signer,
          slippage: 100000,
          abi: chainFrom?.bridgeABI,
          gasPrice: chainFrom?.gasPrice,
        };
        console.log('🚀 ~ params:// external-chain => verse-chain', params);
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
        console.log('🚀 ~ params:  // verse-chain => external-chain', params);
        rs = await bridgeService.bridgeWithdrawTo(params);
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
        console.log('🚀 ~ params: // verse-chain => verse-chain', params);
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
