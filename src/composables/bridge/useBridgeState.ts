import { reactive, toRefs } from 'vue';

// globals
const bridgeState = reactive({
  initialized: false,
  tokenInAddress: '',
  tokenOutAddress: '',
  tokenInAmount: '',
  tokenOutAmount: '',
});

function setInitialized(val: boolean) {
  bridgeState.initialized = val;
}

function setTokenInAddress(address: string) {
  bridgeState.tokenInAddress = address;
}
function setTokenOutAddress(address: string) {
  bridgeState.tokenOutAddress = address;
}

function setTokenInAmount(amount: string) {
  bridgeState.tokenInAmount = amount;
}
function setTokenOutAmount(amount: string) {
  bridgeState.tokenOutAmount = amount;
}

export function useBridgeState() {
  return {
    // can't set to read only refs as these vars are used as
    // model values
    ...toRefs(bridgeState),
    setTokenInAddress,
    setTokenOutAddress,
    setTokenInAmount,
    setTokenOutAmount,
    setInitialized,
  };
}
