import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

const _sendRawTx = async (
  contractAddress,
  contractProvider,
  action,
  params,
  overwrite,
  signer,
  abi,
  gasPrice = null
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
    console.log('--->gas: ', gas); // eslint-disable-line no-console
    // overwrite.gasLimit = gas;
    overwrite.maxPriorityFeePerGas = null;
    overwrite.maxFeePerGas = null;

    const tx = await myContract
      .connect(signer)
      [action](...params, { gasLimit: gas, gasPrice: gasPrice });
    console.log('--->tx: ', tx); // eslint-disable-line no-console
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
const _sendRawTxNative = async (
  contractAddress,
  contractProvider,
  action,
  params,
  overwrite,
  signer,
  value,
  abi,
  gasPrice = null
) => {
  try {
    const myContract = await new ethers.Contract(
      contractAddress,
      abi,
      contractProvider
    );
    const gas = await _estimateGasNative(
      myContract,
      action,
      params,
      overwrite,
      signer,
      value
    );
    console.log('--->gas: ', gas); // eslint-disable-line no-console
    // overwrite.gasLimit = gas;
    overwrite.maxPriorityFeePerGas = null;
    overwrite.maxFeePerGas = null;

    const tx = await myContract.connect(signer)[action](...params, {
      gasLimit: gas,
      gasPrice: gasPrice,
      value: value,
    });
    console.log('--->tx: ', tx); // eslint-disable-line no-console
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
  console.log('--->gas: ', estimateGas, overwrite); // eslint-disable-line no-console
  return new BigNumber(estimateGas).times(2).toFixed(0);
};

const _estimateGasNative = async (
  myContract,
  action,
  params,
  overwrite,
  signer,
  value
) => {
  let estimateGas = await myContract
    .connect(signer)
    .estimateGas[action](...params, {
      value: value,
    });
  estimateGas = estimateGas?.toNumber() || 0;
  console.log('--->gasBBBB: ', estimateGas, overwrite); // eslint-disable-line no-console
  return new BigNumber(estimateGas).times(2).toFixed(0);
};

const bridgeSend = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    tokenAddress,
    tokenDecimal,
    value, // amount
    account, // account address
    chainId,
    signer,
    slippage,
    abi,
    gasPrice,
  } = params;

  let slippageUse = slippage * 1e6;
  slippageUse = Math.floor(slippageUse);
  const nonce = await contractProvider.getTransactionCount(account, 'latest');
  console.log(nonce, 'nonce');
  let decimals = new BigNumber(10).pow(tokenDecimal).toFixed();
  let decimals_value = BigNumber(value).times(decimals).toFixed(0);
  let overwrite = { from: account };
  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'send',
    [account, tokenAddress, decimals_value, chainId, nonce, slippageUse],
    overwrite,
    signer,
    abi,
    gasPrice
  );

  console.log(rs, 'bridgeSend'); // eslint-disable-line no-console
  return rs;
};

const bridgeSendNative = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    tokenAddress,
    tokenDecimal,
    value, // amount
    account, // account address
    chainId,
    signer,
    slippage,
    abi,
    gasPrice,
  } = params;

  let maxSlippageUse = slippage * 1e6 * 1.5; // TODO for test
  maxSlippageUse = Math.floor(maxSlippageUse);
  const nonce = await contractProvider.getTransactionCount(account, 'latest');
  console.log(nonce, 'nonce');
  let decimals = new BigNumber(10).pow(tokenDecimal).toFixed();
  let decimals_value = BigNumber(value).times(decimals).toFixed(0);
  let overwrite = { from: account };
  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'sendNative',
    [account, decimals_value, chainId, nonce, maxSlippageUse],
    overwrite,
    signer,
    abi,
    gasPrice
  );

  console.log(rs, 'bridgeSendNative'); // eslint-disable-line no-console
  return rs;
};

export default {
  bridgeSend,
  bridgeSendNative,
};
