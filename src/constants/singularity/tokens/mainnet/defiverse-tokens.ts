import bccpIcon from '@/assets/images/bridge/tokens/bCCP.png';
import oasIcon from '@/assets/images/bridge/tokens/oas.png';
import usdcIcon from '@/assets/images/bridge/tokens/usdc.png';
import btcIcon from '@/assets/images/bridge/tokens/wbtc.png';
import ethIcon from '@/assets/images/bridge/tokens/weth.png';
const rpc = 'https://rpc.defi-verse.org';
export const DEFIVERSE_TOKENS = [
  {
    name: 'WOAS',
    address: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
    logoURI: oasIcon,
    symbol: 'WOAS',
    decimals: 18,
    is_native: false,
    rpc: rpc,
    singularity_value: 161160,
    isComingSoon: false,
  },
  {
    name: 'USDC',
    address: '0x7c6b91d9be155a6db01f749217d76ff02a7227f2',
    logoURI: usdcIcon,
    symbol: 'USDC',
    decimals: 18,
    is_native: false,
    rpc: rpc,
    singularity_value: 161161,
    isComingSoon: false,
  },
  {
    name: 'WBTC',
    address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
    logoURI: btcIcon,
    symbol: 'WBTC',
    decimals: 18,
    is_native: false,
    rpc: rpc,
    singularity_value: 1611626, // TODO
    isComingSoon: false,
  },
  {
    name: 'WETH',
    address: '0xe7798f023fc62146e8aa1b36da45fb70855a77ea',
    logoURI: ethIcon,
    symbol: 'WETH',
    decimals: 18,
    is_native: false,
    rpc: rpc,
    singularity_value: 1611627, // TODO
    isComingSoon: false,
  },
  {
    name: 'bCCP',
    address: '0x4362Be024eFbb8C6fBcF19675224b58dFd2493Ef',
    logoURI: bccpIcon,
    symbol: 'bCCP',
    decimals: 18,
    is_native: false,
    rpc: rpc,
    singularity_value: 1611625, // TODO
    isComingSoon: false,
  },
];
