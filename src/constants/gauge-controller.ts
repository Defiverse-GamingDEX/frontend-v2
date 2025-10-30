import { oneHourInMs, oneDayInMs } from '@/composables/useTime';

// const isTestnet = import.meta.env.VITE_IS_TESTNET === 'true';

// export const WEIGHT_VOTE_DELAY = isTestnet
//   ? 1 * oneHourInMs // testnet
//   : 8 * oneDayInMs; // mainnet
// console.log('WEIGHT_VOTE_DELAY', WEIGHT_VOTE_DELAY);

export const WEIGHT_VOTE_DELAY = 1 * oneHourInMs;