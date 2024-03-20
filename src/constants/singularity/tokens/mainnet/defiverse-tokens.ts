import bccpIcon from '@/assets/images/bridge/tokens/bCCP.png';
import oasIcon from '@/assets/images/bridge/tokens/oas.png';
import usdcIcon from '@/assets/images/bridge/tokens/usdc.png';
import btcIcon from '@/assets/images/bridge/tokens/wbtc.png';
import ethIcon from '@/assets/images/bridge/tokens/weth.png';
const rpc = 'https://rpc.defi-verse.org';
export const DEFIVERSE_TOKENS = [
  {
    name: 'WOAS',
    address: '0x5a89E11Cb554E00c2f51C4bb7F05bc7Ab0Fa6351',
    logoURI: oasIcon,
    symbol: 'WOAS',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
  {
    name: 'WBTC',
    address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
    logoURI: btcIcon,
    symbol: 'DFC',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
  {
    name: 'WETH',
    address: '0xe7798f023fc62146e8aa1b36da45fb70855a77ea',
    logoURI: ethIcon,
    symbol: 'WETH',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
  {
    name: 'USDC',
    address: '0x7c6b91d9be155a6db01f749217d76ff02a7227f2',
    logoURI: usdcIcon,
    symbol: 'USDC',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
  {
    name: 'bCCP',
    address: '0x4362Be024eFbb8C6fBcF19675224b58dFd2493Ef',
    logoURI: bccpIcon,
    symbol: 'bCCP',
    decimals: 18,
    is_native: false,
    rpc: rpc,
  },
];
