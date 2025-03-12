import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { Contract } from '@ethersproject/contracts';
const getLockedZAmount = async ({
  provider,
  abi,
  contractAddress,
  walletAddress,
}) => {
  console.log('🚀 ~ walletAddress:', walletAddress);
  console.log('🚀 ~ contractAddress:', contractAddress);
  console.log('🚀 ~ abi:', abi);
  console.log('🚀 ~ provider:', provider);
  const myContract = new Contract(contractAddress, abi, provider);
  const lockedZAmount = await myContract.lockedAmount(walletAddress);
  console.log('🚀 ~ lockedZAmount:', lockedZAmount);
  return lockedZAmount;
};
const _sendRawTx = async (
  contractAddress,
  contractProvider,
  action,
  params,
  overwrite,
  signer,
  abi,
  gasPrice = null,
  isEstimate = false
) => {
  try {
    const myContract = await new ethers.Contract(
      contractAddress,
      abi,
      contractProvider
    );
    const gas = await _estimateGas(
      myContract,
      action,
      params,
      overwrite,
      signer
    );

    if (isEstimate) {
      return gas;
    }
    // overwrite.gasLimit = gas;
    overwrite.maxPriorityFeePerGas = null;
    overwrite.maxFeePerGas = null;

    const tx = await myContract.connect(signer)[action](...params, {
      gasLimit: gas,
      gasPrice: gasPrice,
      value: overwrite.value,
    });

    //let rs = await tx.wait();
    //console.log('--->rs: ', rs); // eslint-disable-line no-console
    return tx;
  } catch (error) {
    let _error = error;
    try {
      let tmp = error.toString().replace('Error: Internal JSON-RPC error.', '');
      tmp = tmp.replace('Error: Transaction has been reverted by the EVM:', '');
      _error = JSON.parse(tmp);
      if (!_error.message && _error.error) {
        _error.message = _error.error;
      }
    } catch (e) {
      // console.log("-------------------->_error--------");
      _error = error;
    }
    throw _error;
  }
};

const _estimateGas = async (myContract, action, params, overwrite, signer) => {
  let estimateGas = await myContract
    .connect(signer)
    .estimateGas[action](...params);
  estimateGas = estimateGas?.toNumber() || 0;
  return new BigNumber(estimateGas).times(2).toFixed(0);
};

const stakeZ = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    account,
    srcTokenSymbol,
    desChainId,
    srcTokenDecimal,
    value, // amount
    vBridgeAddress,
    srcTokenAddress, // account address
    signer,
    slippage,
    abi,
    gasPrice,
    isEstimate,
    nonce,
  } = params;

  let decimals_value = BigNumber(value)
    .times(10 ** srcTokenDecimal)
    .toFixed(0);
  let overwrite = { from: account };

  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'send',
    [
      vBridgeAddress,
      srcTokenAddress,
      decimals_value,
      desChainId,
      nonce,
      slippage,
    ],
    overwrite,
    signer,
    abi,
    gasPrice,
    isEstimate
  );

  return { tx: rs, nonce };
};

export default {
  getLockedZAmount,
  stakeZ,
};
