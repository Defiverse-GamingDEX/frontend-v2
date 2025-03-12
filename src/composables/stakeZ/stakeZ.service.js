import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { Contract } from '@ethersproject/contracts';
const getLockedZAmount = async ({
  provider,
  abi,
  contractAddress,
  walletAddress,
}) => {
  const myContract = new Contract(contractAddress, abi, provider);
  const lockedZAmount = await myContract.lockedAmount(walletAddress);
  console.log('🚀 ~ lockedZAmount:', lockedZAmount);
  return lockedZAmount.toString() || 0;
};
const getMaturityPeriod = async ({ provider, abi, contractAddress }) => {
  const myContract = new Contract(contractAddress, abi, provider);
  const maturityPeriod = await myContract.redemptionMaturityPeriod();
  console.log(
    '🚀 ~ getMaturityPeriod ~ maturityPeriod:',
    maturityPeriod.toString()
  );
  return maturityPeriod.toNumber() || 0;
};
const getEstimateSzAmount = async ({
  provider,
  abi,
  contractAddress,
  amount,
}) => {
  const myContract = new Contract(contractAddress, abi, provider);
  const estimateSzAmount = await myContract.estimateSZ(amount);
  return estimateSzAmount?.toNumber() || 0;
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
  return new BigNumber(estimateGas).times(1.3).toFixed(0);
};

const stakeZ = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    account,
    value, // amount
    signer,
    abi,
  } = params;

  let overwrite = { from: account };

  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'stake',
    [value],
    overwrite,
    signer,
    abi
  );
  console.log('🚀 ~ rs:', rs);
  return rs;
};

export default {
  getLockedZAmount,
  getMaturityPeriod,
  getEstimateSzAmount,
  stakeZ,
};
