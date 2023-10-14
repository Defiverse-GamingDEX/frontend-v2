import { reactive, toRefs } from 'vue';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { default as ERC20ABI } from '@/lib/abi/ERC20.json';
import { bnum } from '@/lib/utils';
async function getTokensBalance(tokens, account) {
  if (tokens.length > 0) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const balance = await getBalance(token, account);
      token.balance = balance;
    }
    return tokens;
  }
}
async function getBalance(token, walletAddress) {
  const { address, rpc } = token;
  const provider = new JsonRpcProvider(rpc);
  const tokenContract = new Contract(address, ERC20ABI, provider);
  const tokenBalance = await tokenContract.balanceOf(walletAddress);
  const weiBalance = tokenBalance?.toString();
  const rs = bnum(weiBalance).div(Math.pow(10, token?.decimals)).toNumber();

  return rs;
}
export function useBridge() {
  return {
    getTokensBalance,
    getBalance,
  };
}
