import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

const _sendRawTx = async ({
  abi,
  contractAddress,
  contractProvider,
  action,
  params,
  overwrite,
  signer,
  gasPrice = null,
}) => {
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
    let rs = await tx.wait();
    console.log('--->rs: ', rs); // eslint-disable-line no-console
    return rs;
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
const _sendRawTxNative = async ({
  abi,
  contractAddress,
  contractProvider,
  action,
  params,
  overwrite,
  signer,
  value,
  gasPrice = null,
}) => {
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
    let rs = await tx.wait();
    console.log('--->rs: ', rs); // eslint-disable-line no-console
    return rs;
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

export default {};
