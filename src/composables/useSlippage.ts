import { formatUnits, parseUnits } from '@ethersproject/units';
import BigNumber from 'bignumber.js';
import { computed } from 'vue';

import { bnum } from '@/lib/utils';

import { useUserSettings } from '@/providers/user-settings.provider';

export default function useSlippage() {
  const { slippage } = useUserSettings();

  const slippageBasisPoints = computed((): string => {
    return bnum(slippage.value).times(10000).toString();
  });

  function minusSlippage(_amount: string, decimals: number): string {
    //let amount = parseUnits(_amount, decimals).toString();

    // Use bnum to avoid scientific notation from parseUnits
    let amount = bnum(_amount).times(bnum(10).pow(decimals)).integerValue(BigNumber.ROUND_DOWN).toFixed();
    amount = minusSlippageScaled(amount);
    
    //return formatUnits(amount, decimals);

    // Convert back to decimal format
    return bnum(amount).div(bnum(10).pow(decimals)).toFixed();
  }

  function minusSlippageScaled(amount: string): string {
    const delta = bnum(amount)
      .times(slippageBasisPoints.value)
      .div(10000)
      .dp(0, BigNumber.ROUND_UP);
    //  return bnum(amount).minus(delta).toString();

    // Use integerValue to avoid rounddown issues
    let result = bnum(amount).minus(delta).integerValue(BigNumber.ROUND_DOWN).toFixed();
    return result;
  }

  function addSlippage(_amount: string, decimals: number): string {
    // let amount = parseUnits(_amount, decimals).toString();

    // Use bnum to avoid scientific notation from parseUnits
    let amount = bnum(_amount).times(bnum(10).pow(decimals)).integerValue(BigNumber.ROUND_DOWN).toFixed();
    amount = addSlippageScaled(amount);
    
    //return formatUnits(amount, decimals).toString();

    // Convert back to decimal format
    return bnum(amount).div(bnum(10).pow(decimals)).toFixed();
  }

  function addSlippageScaled(amount: string): string {
    const delta = bnum(amount)
      .times(slippageBasisPoints.value)
      .div(10000)
      .dp(0, BigNumber.ROUND_DOWN);
      
    // return bnum(amount).plus(delta).toString();

    // Use integerValue to avoid rounddown issues
    return bnum(amount).plus(delta).integerValue(BigNumber.ROUND_UP).toFixed();
  }

  return { minusSlippage, minusSlippageScaled, addSlippage, addSlippageScaled };
}
