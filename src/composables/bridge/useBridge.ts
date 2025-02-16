import ccpIcon from '@/assets/images/bridge/tokens/ccp.png';
import defiIcon from '@/assets/images/bridge/tokens/defi.png';
import ethIcon from '@/assets/images/bridge/tokens/eth.png';
import gdtIcon from '@/assets/images/bridge/tokens/gdt.png';
import mchcIcon from '@/assets/images/bridge/tokens/mchc.png';
import oasIcon from '@/assets/images/bridge/tokens/oas.png';
import tcgcIcon from '@/assets/images/bridge/tokens/tcgc.png';
import usdcIcon from '@/assets/images/bridge/tokens/usdc.png';
import usdtIcon from '@/assets/images/bridge/tokens/usdt.png';
import wbtcIcon from '@/assets/images/bridge/tokens/wbtc.png';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';
import stOASIcon from '@/assets/images/bridge/tokens/stOAS.png';
import bridgeService from '@/composables/bridge/bridge.services';
import { BRIDGE_NETWORKS } from '@/constants/bridge/networks';
import { default as ERC20ABI } from '@/lib/abi//ERC20.json';
import { bnum } from '@/lib/utils';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import CBRIDGE_TOKEN_VAULT_ABI from '@/lib/abi/bridge/cBridgeTokenVault.json';
import CBRIDGE_PEG_ABI from '@/lib/abi/bridge/cBridgePeg.json';
console.log('🚀 ~ CBRIDGE_PEG_ABI:', CBRIDGE_PEG_ABI);
console.log('🚀 ~ CBRIDGE_TOKEN_VAULT_ABI:', CBRIDGE_TOKEN_VAULT_ABI);

// const VBRIDGE_CONTRACT_ADDRESS = '0x323D29986BCA00AEF8C2cb0f93e6F55F18eb3E67'; // Bridge version 1.2
const VBRIDGE_CONTRACT_ADDRESS = '0x57946c046CFb51cE30586b54Dd150ca32fB7c012'; // Bridge version 1.3

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
    case 'USDC.e':
      return usdcIcon;
    case 'OAS':
      return oasIcon;
    case 'DFV':
      return defiIcon;
    case 'TCGC':
      return tcgcIcon;
    case 'MCHC':
      return mchcIcon;
    case 'GDT':
      return gdtIcon;
    case 'CCP':
      return ccpIcon;
    case 'stOAS':
      return stOASIcon;
    case 'Z':
      return ZIcon;
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
      convert_gas_amount: BigNumber(data?.convert_gas_amount)
        .div(10 ** data?.src_token?.decimals)
        .toFixed(),
      gas_amount_receive: BigNumber(data?.gas_amount_receive)
        .div(10 ** 18)
        .toFixed(), // hard decimals 18
      gas_option_enabled: data.gas_option_enabled,
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
      let balance: any = 0;
      if (token.is_native === true) {
        // OAS native
        balance = await getNativeBalance(token, account);
      } else {
        balance = await getBalance(token, account);
      }
      token.balance = balance;
    }
    return tokens;
  }
}
async function getNativeBalance(token, account) {
  const { address, rpc, provider } = token;
  let currentProvider = provider;
  if (!provider) {
    currentProvider = new JsonRpcProvider(rpc);
    const nativeBalance = await currentProvider.getBalance(account);
    const rs = bnum(nativeBalance).div(Math.pow(10, token?.decimals)).toFixed();
    return rs;
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
    const weiBalance = tokenBalance?.toString();
    const rs = bnum(weiBalance).div(Math.pow(10, token?.decimals)).toFixed();

    return rs;
  } catch (error) {
    console.log(error, 'error');
    return error;
  }
}
async function checkTokenAllowance(
  chain,
  token,
  walletAddress,
  l1_bridge_address
) {
  try {
    const { address } = token;
    const { bridgeContract, rpc } = chain;
    let contractAddress = bridgeContract;
    if (l1_bridge_address) {
      contractAddress = l1_bridge_address;
    }
    const provider = new JsonRpcProvider(rpc);
    const tokenContract = new Contract(address, ERC20ABI, provider);
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
async function approveToken(
  chain,
  token,
  walletAddress,
  signer,
  approveAmount,
  l1_bridge_address
) {
  try {
    const { address } = token;
    const { bridgeContract, rpc } = chain;
    let contractAddress = bridgeContract;
    if (l1_bridge_address) {
      contractAddress = l1_bridge_address;
    }
    console.log('🚀 approveToken ~ contractAddress:', contractAddress);
    const provider = new JsonRpcProvider(rpc);
    const contract = new Contract(address, ERC20ABI, provider);
    if (!approveAmount) {
      approveAmount = ethers.constants.MaxUint256;
    }
    const tx = await contract
      .connect(signer)
      .approve(contractAddress, approveAmount);
    // const rs = await tx.wait();
    // console.log('rs', rs);

    return tx;
  } catch (error) {
    console.log(error, 'approveToken=>error');
    throw error;
  }
}
function getChainName(chainId) {
  return BRIDGE_NETWORKS.find(item => item.chain_id_decimals === chainId)?.name;
}
function getChain(chainId) {
  return BRIDGE_NETWORKS.find(item => item.chain_id_decimals === chainId);
}
function getChainByChainName(chain_name) {
  return BRIDGE_NETWORKS.find(item => item.chain_name === chain_name);
}
function getToken(tokenAddress, list) {
  return list?.find(item => item.address === tokenAddress) || null;
}
async function bridgeSend({
  inputFromSelect,
  inputToSelect,
  account,
  anotherWalletAddress,
  signer,
  provider,
  isEstimate = false,
  oasys_bridge_type,
  l1_bridge_address,
  nonce,
  is_pegged,
  cbridge_token_vault,
  cbridge_peg,
  route_org_token,
  route_pegged_token,
}) {
  try {
    const chainFrom: any = getChain(inputFromSelect.chainId);
    const tokenInputFrom = getToken(
      inputFromSelect.tokenAddress,
      inputFromSelect.tokensList
    );
    const chainTo: any = getChain(inputToSelect.chainId);
    const tokenInputTo = getToken(
      inputToSelect.tokenAddress,
      inputToSelect.tokensList
    );
    console.log('Submit Button-> is_pegged', is_pegged);
    console.log('Submit Button-> cbridge_token_vault', cbridge_token_vault);
    console.log('Submit Button-> cbridge_peg', cbridge_peg);
    console.log('Submit Button-> route_org_token', route_org_token);
    let rs: any = null;
    if (oasys_bridge_type === 'external_to_oasys') {
      // native case => oasys -> NOT NOW
      // token case only
      // TODO 2024/09/11
      console.log(`external ${inputFromSelect.chainId} to oasys`);
      if (is_pegged && cbridge_token_vault) {
        // call new contract deposit
        console.log(
          `is_pegged=${is_pegged})=> call deposit function from ${cbridge_token_vault}`
        );
        console.log('🚀 ~ route_org_token:', route_org_token);
        console.log('🚀 ~ tokenInputFrom?.address:', tokenInputFrom?.address);
        let srcTokenAddress = l1_bridge_address; // from initMinAmountRoute
        if (route_org_token) {
          srcTokenAddress = route_org_token;
        } else {
          srcTokenAddress = tokenInputFrom?.address;
        }
        console.log('🚀 ~ srcTokenAddress:', srcTokenAddress);
        const params = {
          contractAddress: cbridge_token_vault, // contract token
          contractProvider: provider, // contract provider
          account,
          srcTokenDecimal: tokenInputFrom?.decimals,
          value: inputFromSelect?.amount, // amount
          vBridgeAddress: anotherWalletAddress ? anotherWalletAddress : account, // receiver address
          srcTokenAddress: srcTokenAddress,
          desChainId: 248, // to OASYS
          signer,
          slippage: 50000,
          abi: CBRIDGE_TOKEN_VAULT_ABI,
          gasPrice: chainFrom?.gasPrice,
          isEstimate,
          nonce,
        };
        rs = await bridgeService.tokenVaultDeposit(params);
      }
      {
        console.log(`is_pegged=${is_pegged})=> call old function`);
        const params = {
          contractAddress: chainFrom?.bridgeContract, // contract token
          contractProvider: provider, // contract provider
          account,
          srcTokenDecimal: tokenInputFrom?.decimals,
          value: inputFromSelect?.amount, // amount
          vBridgeAddress: anotherWalletAddress ? anotherWalletAddress : account, // receiver address
          srcTokenAddress: tokenInputFrom?.address,
          desChainId: 248, // to OASYS
          signer,
          slippage: 50000,
          abi: chainFrom?.bridgeABI,
          gasPrice: chainFrom?.gasPrice,
          isEstimate,
          nonce,
        };
        rs = await bridgeService.bridgeSend(params);
      }
    } else if (oasys_bridge_type === 'oasys_to_external') {
      if (tokenInputFrom.symbol === 'OAS') {
        // native case OAS
        // NOT support now
      } else {
        // token case
        // TODO 2024/09/11
        console.log(
          `oasys ${inputFromSelect.chainId} to external ${inputToSelect.chainId}`
        );
        if (is_pegged) {
          console.log(
            `is_pegged=${is_pegged})=> call burn function from ${cbridge_peg}`
          );
          console.log('🚀 ~ route_pegged_token:', route_pegged_token);
          console.log('🚀 ~ tokenInputFrom?.address:', tokenInputFrom?.address);
          let srcTokenAddress = l1_bridge_address; // from initMinAmountRoute
          if (route_pegged_token) {
            srcTokenAddress = route_pegged_token;
          } else {
            srcTokenAddress = tokenInputFrom?.address;
          }
          console.log('🚀 ~ srcTokenAddress:', srcTokenAddress);
          const params = {
            contractAddress: cbridge_peg, // contract token
            contractProvider: provider, // contract provider
            account,
            srcTokenDecimal: tokenInputFrom?.decimals,
            value: inputFromSelect?.amount, // amount
            vBridgeAddress: anotherWalletAddress
              ? anotherWalletAddress
              : account, // receiver address
            srcTokenAddress: srcTokenAddress,
            desChainId: chainTo?.chain_id_decimals,
            signer,
            slippage: 50000, // not use
            abi: CBRIDGE_PEG_ABI,
            gasPrice: chainFrom?.gasPrice,
            isEstimate,
            nonce,
          };
          rs = await bridgeService.burn(params);
        } else {
          console.log(`is_pegged=${is_pegged})=> call old function `);
          const params = {
            contractAddress: l1_bridge_address, // contract token
            contractProvider: provider, // contract provider
            account,
            srcTokenDecimal: tokenInputFrom?.decimals,
            value: inputFromSelect?.amount, // amount
            vBridgeAddress: anotherWalletAddress
              ? anotherWalletAddress
              : account, // receiver address
            srcTokenAddress: tokenInputFrom?.address,
            desChainId: chainTo?.chain_id_decimals,
            signer,
            slippage: 50000,
            abi: chainFrom?.bridgeABIExternal, // For AOS bridge external chain use  bridgeABIExternal
            gasPrice: chainFrom?.gasPrice,
            isEstimate,
            nonce,
          };
          rs = await bridgeService.bridgeSend(params);
        }
      }
    } else if (oasys_bridge_type === 'verse_to_oasys') {
      // verse => oasys
      const params = {
        contractAddress: chainFrom?.bridgeContract,
        contractProvider: provider,
        account,
        srcTokenDecimal: tokenInputFrom?.decimals,
        srcTokenSymbol: tokenInputFrom?.symbol,
        value: inputFromSelect?.amount, // amount
        vBridgeAddress: anotherWalletAddress ? anotherWalletAddress : account, // address user
        srcTokenAddress: tokenInputFrom?.address, // account address
        signer,
        abi: chainFrom?.bridgeABI,
        gasPrice: chainFrom?.gasPrice,
        isEstimate,
        nonce,
      };

      rs = await bridgeService.bridgeWithdrawTo(params);
    } else if (oasys_bridge_type === 'oasys_to_verse') {
      //oasys_to_verse
      if (tokenInputFrom.symbol === 'OAS') {
        // transfer OAS
        const params = {
          contractAddress: l1_bridge_address,
          contractProvider: provider,
          account,
          srcTokenDecimal: tokenInputFrom?.decimals,
          value: inputFromSelect?.amount, // amount
          receiveAddress: anotherWalletAddress ? anotherWalletAddress : account, // address user
          signer,
          abi: chainFrom?.bridgeABI,
          gasPrice: chainFrom?.gasPrice,
          isEstimate,
          nonce,
        };
        rs = await bridgeService.bridgeDepositETHTo(params);
      } else {
        // transfer ERC20
        const params = {
          contractAddress: l1_bridge_address,
          contractProvider: provider,
          account,
          srcTokenDecimal: tokenInputFrom?.decimals,
          value: inputFromSelect?.amount, // amount
          srcTokenAddress: tokenInputFrom?.address, // account address
          desTokenAddress: tokenInputTo?.address,
          receiveAddress: anotherWalletAddress ? anotherWalletAddress : account, // address user
          signer,
          abi: chainFrom?.bridgeABI,
          gasPrice: chainFrom?.gasPrice,
          isEstimate,
          nonce,
        };
        rs = await bridgeService.bridgeDepositERC20To(params);
      }
    } else {
      // old logic
      if (chainFrom.type === 'external-chain') {
        if (chainTo.type === 'external-chain') {
          throw new Error('Not support');
        } else {
          // chainTo.type === 'verse-chain'
          // external-chain => verse-chain
          // TODO 2024/09/11
          console.log(
            `external ${inputFromSelect.chainId} to verse ${inputToSelect.chainId}`
          );
          if (is_pegged && cbridge_token_vault) {
            // call new contract deposit
            console.log('🚀 ~ route_org_token:', route_org_token);
            console.log(
              '🚀 ~ tokenInputFrom?.address:',
              tokenInputFrom?.address
            );
            let srcTokenAddress = l1_bridge_address; // from initMinAmountRoute
            if (route_org_token) {
              srcTokenAddress = route_org_token;
            } else {
              srcTokenAddress = tokenInputFrom?.address;
            }
            console.log('🚀 ~ srcTokenAddress:', srcTokenAddress);

            const params = {
              contractAddress: cbridge_token_vault, // contract token
              contractProvider: provider, // contract provider
              account,
              srcTokenDecimal: tokenInputFrom?.decimals,
              value: inputFromSelect?.amount, // amount
              vBridgeAddress: VBRIDGE_CONTRACT_ADDRESS, // receiver address
              srcTokenAddress: srcTokenAddress,
              desChainId: 248, // to OASYS
              signer,
              slippage: 50000,
              abi: CBRIDGE_TOKEN_VAULT_ABI,
              gasPrice: chainFrom?.gasPrice,
              isEstimate,
              nonce,
            };
            rs = await bridgeService.tokenVaultDeposit(params);
          } else {
            const params = {
              contractAddress: chainFrom?.bridgeContract, // contract token
              contractProvider: provider, // contract provider
              account,
              srcTokenDecimal: tokenInputFrom?.decimals,
              value: inputFromSelect?.amount, // amount
              vBridgeAddress: VBRIDGE_CONTRACT_ADDRESS,
              srcTokenAddress: tokenInputFrom?.address,
              desChainId: 248,
              signer,
              slippage: 50000,
              abi: chainFrom?.bridgeABI,
              gasPrice: chainFrom?.gasPrice,
              isEstimate,
              nonce,
            };
            rs = await bridgeService.bridgeSend(params);
          }
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
            isEstimate,
            nonce,
          };
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
            isEstimate,
            nonce,
          };
          rs = await bridgeService.bridgeWithdrawTo(params);
        }
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
    getNativeBalance,
    checkTokenAllowance,
    approveToken,
    bridgeSend,
    getChainName,
    getChain,
    getChainByChainName,
    getToken,
  };
}
