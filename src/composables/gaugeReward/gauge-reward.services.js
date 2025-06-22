import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

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
    // overwrite.gasLimit = gas;
    overwrite.maxPriorityFeePerGas = null;
    overwrite.maxFeePerGas = null;

    const tx = await myContract
      .connect(signer)
      [action](...params, { gasLimit: gas, gasPrice: gasPrice });
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
  console.log('🚀 ~ const_estimateGas= ~ params:', params);
  try {
    let estimateGas = await myContract
      .connect(signer)
      .estimateGas[action](...params);
    estimateGas = estimateGas?.toNumber() || 0;
    return new BigNumber(estimateGas).times(1.5).toFixed(0);
  } catch (error) {
    return 12000000;
  }
};

const depositTokens = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    gauge, // gauge pool address
    streamer,
    tokens, // token address array
    periods, // amounts arrays
    amounts,
    account,
    signer,
    abi,
    gasPrice,
  } = params;
  let finalStreamer = streamer;
  if (!finalStreamer) {
    finalStreamer = '0x0000000000000000000000000000000000000000';
  }
  let overwrite = { from: account };

  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'depositTokens',
    [gauge, finalStreamer, tokens, periods, amounts],
    overwrite,
    signer,
    abi,
    gasPrice
  );

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
  return rs;
};

const getRewardAmounts = async params => {
  console.log('getRewardAmounts:', params);
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

  const rs = await contract.getRewardAmounts(gaugeAddress);
  return rs;
};

export default {
  depositTokens,
  startDistributions,
  getRewardTokens,
  getRewardAmounts,
};
