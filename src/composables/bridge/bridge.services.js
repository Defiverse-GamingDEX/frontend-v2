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

    // overwrite.gasLimit = gas;
    overwrite.maxPriorityFeePerGas = null;
    overwrite.maxFeePerGas = null;

    const tx = await myContract.connect(signer)[action](...params, {
      gasLimit: gas,
      gasPrice: gasPrice,
      value: value,
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
    account,
    srcTokenSymbol,
    srcTokenDecimal,
    value, // amount
    vBridgeAddress,
    srcTokenAddress, // account address
    signer,
    slippage,
    abi,
    gasPrice,
    isEstimate,
  } = params;

  const nonce = await contractProvider.getTransactionCount(account, 'latest');
  const desChainId = 248;
  let decimals_value = BigNumber(value)
    .times(10 ** srcTokenDecimal)
    .toFixed(0);
  let overwrite = { from: account };
  // if (srcTokenSymbol === 'OAS') {
  //   overwrite.value = decimals_value;
  // }
  console.log(
    '🚀 ~ bridgeSend ~ vBridgeAddress, srcTokenAddress, decimals_value, desChainId, nonce, slippage',
    vBridgeAddress,
    srcTokenAddress,
    decimals_value,
    desChainId,
    nonce,
    slippage
  );
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

  console.log(rs, 'bridgeSend'); // eslint-disable-line no-console
  return { tx: rs, nonce };
};

// const bridgeSendNative = async params => {
//   const {
//     contractAddress, // contract token
//     contractProvider, // contract provider
//     account,
//     srcTokenSymbol,
//     srcTokenDecimal,
//     value, // amount
//     vBridgeAddress,
//     srcTokenAddress, // account address
//     signer,
//     slippage,
//     abi,
//     gasPrice,
//     isEstimate,
//   } = params;

//   const nonce = await contractProvider.getTransactionCount(account, 'latest');
//   const desChainId = 248;
//   let decimals_value = BigNumber(value)
//     .times(10 ** srcTokenDecimal)
//     .toFixed(0);
//   let overwrite = { from: account, value: decimals_value };
//   // if (srcTokenSymbol === 'OAS') {
//   //   overwrite.value = decimals_value;
//   // }
//   console.log(
//     '🚀 ~ bridgeSendNative ~ vBridgeAddress, srcTokenAddress, decimals_value, desChainId, nonce, slippage',
//     vBridgeAddress,
//     srcTokenAddress,
//     decimals_value,
//     desChainId,
//     nonce,
//     slippage
//   );
//   const rs = await _sendRawTx(
//     contractAddress,
//     contractProvider,
//     'sendNative',
//     [vBridgeAddress, decimals_value, desChainId, nonce, slippage],
//     overwrite,
//     signer,
//     abi,
//     gasPrice,
//     isEstimate
//   );

//   console.log(rs, 'bridgeSendNative'); // eslint-disable-line no-console
//   return { tx: rs, nonce };
// };

const bridgeWithdrawTo = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    account,
    srcTokenDecimal,
    srcTokenSymbol,
    value, // amount
    vBridgeAddress,
    srcTokenAddress, // account address
    signer,
    abi,
    gasPrice,
    isEstimate,
  } = params;

  const gasLimit = 2000000;

  let decimals_value = BigNumber(value)
    .times(10 ** srcTokenDecimal)
    .toFixed(0);
  let overwrite = { from: account };

  // if (srcTokenSymbol === 'OAS') {
  //   overwrite.value = decimals_value;
  // }

  const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32))?.toString();
  console.log(
    '🚀 ~ bridgeWithdrawTo ~ srcTokenAddress, vBridgeAddress, decimals_value, gasLimit, nonce:',
    srcTokenAddress,
    vBridgeAddress,
    decimals_value,
    gasLimit,
    nonce
  );
  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'withdrawTo',
    [srcTokenAddress, vBridgeAddress, decimals_value, gasLimit, nonce],
    overwrite,
    signer,
    abi,
    gasPrice,
    isEstimate
  );

  console.log(rs, 'bridgeSend'); // eslint-disable-line no-console
  return { tx: rs, nonce };
};
const bridgeDepositERC20To = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    account,
    srcTokenDecimal,
    value, // amount
    srcTokenAddress,
    desTokenAddress,
    receiveAddress,
    signer,
    abi,
    gasPrice,
    isEstimate,
  } = params;

  const gasLimit = 2000000;

  let decimals_value = BigNumber(value)
    .times(10 ** srcTokenDecimal)
    .toFixed(0);
  let overwrite = { from: account };

  const nonce = '0x';
  console.log(
    '🚀 ~ bridgeDepositERC20To ~ srcTokenAddress, desTokenAddress,receiveAddress, decimals_value, gasLimit, nonce:',
    srcTokenAddress,
    desTokenAddress,
    receiveAddress,
    decimals_value,
    gasLimit,
    nonce
  );
  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'depositERC20To',
    [
      srcTokenAddress,
      desTokenAddress,
      receiveAddress,
      decimals_value,
      gasLimit,
      nonce,
    ],
    overwrite,
    signer,
    abi,
    gasPrice,
    isEstimate
  );

  console.log(rs, 'bridgeSend'); // eslint-disable-line no-console
  return { tx: rs, nonce };
};
const bridgeDepositETHTo = async params => {
  const {
    contractAddress, // contract token
    contractProvider, // contract provider
    account,
    srcTokenDecimal,
    value, // amount
    receiveAddress,
    signer,
    abi,
    gasPrice,
    isEstimate,
  } = params;

  const gasLimit = 2000000;

  let decimals_value = BigNumber(value)
    .times(10 ** srcTokenDecimal)
    .toFixed(0);
  let overwrite = { from: account, value: decimals_value };

  const nonce = '0x';
  console.log(
    '🚀 ~ depositETHTo ~ receiveAddress, decimals_value, gasLimit, nonce:',
    receiveAddress,
    decimals_value,
    gasLimit,
    nonce
  );
  const rs = await _sendRawTx(
    contractAddress,
    contractProvider,
    'depositETHTo',
    [receiveAddress, gasLimit, nonce],
    overwrite,
    signer,
    abi,
    gasPrice,
    isEstimate
  );

  console.log(rs, 'bridgeSend'); // eslint-disable-line no-console
  return { tx: rs, nonce };
};

export default {
  bridgeSend,
  //bridgeSendNative,
  bridgeWithdrawTo,
  bridgeDepositERC20To,
  bridgeDepositETHTo,
};
