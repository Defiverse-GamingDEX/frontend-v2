/**
 * List of pool IDs that should be excluded from display and access
 * These pools will be filtered out from the pools list and redirect users
 * back to the pools page if accessed directly
 */
export const EXCLUDED_POOL_IDS = [
  '0x393ab83367334e9ec1311b95d58c9ab84b2837c4000200000000000000000142',
  // Add more pool IDs here as needed
];

/**
 * Check if a pool ID is in the excluded list
 * @param poolId - The pool ID to check
 * @returns true if the pool is excluded, false otherwise
 */
export const isExcludedPool = (poolId: string): boolean => {
  return EXCLUDED_POOL_IDS.includes(poolId);
};
