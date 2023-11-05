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

const _estimateGas = async (myContract, action, params, overwrite, signer) => {
  // try {
  let estimateGas = await myContract
    .connect(signer)
    .estimateGas[action](...params);
  estimateGas = estimateGas?.toNumber() || 0;
  console.log('--->gas: ', estimateGas, overwrite); // eslint-disable-line no-console
  return new BigNumber(estimateGas).times(1.5).toFixed(0);
  // } catch (error) {
  //   return 21000;
  // }
};

const depositTokens = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    gauge, // gauge pool address
    tokens, // token address array
    periods, // amounts arrays
    amounts,
    account,
    signer,
    abi,
    gasPrice,
  } = params;

  let overwrite = { from: account };
  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'depositTokens',
    [gauge, tokens, periods, amounts],
    overwrite,
    signer,
    abi,
    gasPrice
  );

  console.log(rs, 'depositTokens'); // eslint-disable-line no-console
  return rs;
};
const startDistributions = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    account,
    signer,
    abi,
    gasPrice,
  } = params;

  let overwrite = { from: account };
  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'startDistributions',
    [],
    overwrite,
    signer,
    abi,
    gasPrice
  );

  console.log(rs, 'startDistributions'); // eslint-disable-line no-console
  return rs;
};

const getRewardTokens = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    gaugeAddress,
    abi,
  } = params;

  const contract = await new ethers.Contract(
    contractAddress,
    abi,
    contractProvider
  );

  const rs = await contract.getRewardTokens(gaugeAddress);
  console.log('getRewardTokens', rs);
  return rs;
};

export default {
  depositTokens,
  startDistributions,
  getRewardTokens,
};
