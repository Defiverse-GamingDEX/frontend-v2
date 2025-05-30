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
  return maturityPeriod.toString() || 0;
};
const getEstimateSzAmount = async ({
  provider,
  abi,
  contractAddress,
  amount,
}) => {
  console.log('🚀 ~ getEstimateSzAmount=>amount:', amount);
  const myContract = new Contract(contractAddress, abi, provider);
  const estimateSzAmount = await myContract.estimateSZ(amount);
  console.log('🚀 ~ estimateSzAmount:', estimateSzAmount);
  return estimateSzAmount?.toString() || 0;
};
const getEstimateZAmount = async ({
  provider,
  abi,
  contractAddress,
  amount,
}) => {
  const myContract = new Contract(contractAddress, abi, provider);
  const estimateZAmount = await myContract.estimateZ(amount);
  return estimateZAmount?.toString() || 0;
};
const getAllRedeemableAmount_SZ = async ({
  provider,
  abi,
  contractAddress,
  walletAddress,
}) => {
  const myContract = new Contract(contractAddress, abi, provider);
  const allRedeemableAmount_SZ = await myContract.getAllRedeemableAmount_SZ(
    walletAddress
  );
  console.log(
    '🚀 ~ getAllRedeemableAmount_SZ ~ allRedeemableAmount_SZ:',
    allRedeemableAmount_SZ
  );
  return allRedeemableAmount_SZ?.toString() || 0;
};
const getRedeemableAmount_SZ = async ({
  provider,
  abi,
  contractAddress,
  walletAddress,
  stakeId,
}) => {
  const myContract = new Contract(contractAddress, abi, provider);
  const redeemableAmount_SZ = await myContract.getRedeemableAmount_SZ(
    walletAddress,
    stakeId
  );
  console.log(
    '🚀 ~ getRedeemableAmount_SZ ~ redeemableAmount_SZ:',
    redeemableAmount_SZ
  );
  return redeemableAmount_SZ?.toString() || 0;
};
const getEarlyRedeemPenalty = async ({ provider, abi, contractAddress }) => {
  const myContract = new Contract(contractAddress, abi, provider);
  const earlyRedeemPenalty = await myContract.baseRedemptionRate();
  console.log(
    '🚀 ~ getEarlyRedeemPenalty ~ earlyRedeemPenalty:',
    earlyRedeemPenalty
  );
  return earlyRedeemPenalty?.toString() || 0;
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
    // overwrite.maxPriorityFeePerGas = null;
    // overwrite.maxFeePerGas = null;

    const tx = await myContract.connect(signer)[action](...params, {
      gasLimit: gas,
      gasPrice: gasPrice,
      value: overwrite.value,
      type: 0,
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
const stakeZForTest = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    account,
    value, // amount
    signer,
    abi,
  } = params;

  let overwrite = { from: account };
  const twoDaysAgo = 86400 * 2;
  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'stakeForTest',
    [value, twoDaysAgo],
    overwrite,
    signer,
    abi
  );
  console.log('🚀 ~ rs:', rs);
  return rs;
};
const redeemAllSZ = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    account,
    signer,
    abi,
  } = params;

  let overwrite = { from: account };

  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'redeemAll',
    [],
    overwrite,
    signer,
    abi
  );
  console.log('🚀 ~ rs=>redeemAllSZ:', rs);
  return rs;
};
const redeemSZ = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    account,
    value, // amount
    stakeId,
    signer,
    abi,
  } = params;

  let overwrite = { from: account };

  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'redeem',
    [value, stakeId],
    overwrite,
    signer,
    abi
  );
  console.log('🚀 ~ rs=>redeemSZ:', rs);
  return rs;
};
export default {
  getLockedZAmount,
  getMaturityPeriod,
  getEstimateSzAmount,
  getEstimateZAmount,
  getAllRedeemableAmount_SZ,
  getRedeemableAmount_SZ,
  getEarlyRedeemPenalty,
  stakeZ,
  redeemAllSZ,
  redeemSZ,
  stakeZForTest,
};
