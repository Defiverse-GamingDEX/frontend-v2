import { ref, computed } from 'vue';

// Whitelist addresses
const verifiedAddresses = [
  '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b', // Add your verified addresses here
  '0x...',
];

const yukichiAddresses = [
  '0x...', // Add your yukichi addresses here
  '0x...',
];

export default function usePoolTypeFilters() {
  const isVerifiedEnabled = ref(false);
  const isPermissionlessEnabled = ref(false);
  const isYukichiEnabled = ref(false);

  function isVerifiedPool(poolCreator: string): boolean {
    return verifiedAddresses.includes(poolCreator.toLowerCase());
  }

  function isYukichiPool(poolCreator: string): boolean {
    return yukichiAddresses.includes(poolCreator.toLowerCase());
  }

  function isPermissionlessPool(poolCreator: string): boolean {
    return !isVerifiedPool(poolCreator) && !isYukichiPool(poolCreator);
  }

  function filterPools(pools: any[]) {
    // If no filters are enabled, return all pools
    if (
      !isVerifiedEnabled.value &&
      !isPermissionlessEnabled.value &&
      !isYukichiEnabled.value
    ) {
      return pools.map(pool => ({
        ...pool,
        isVerified: isVerifiedPool(pool.owner || pool.creator),
      }));
    }

    return pools
      .filter(pool => {
        const creator = pool.owner || pool.creator;

        if (isVerifiedEnabled.value && isVerifiedPool(creator)) return true;
        if (isPermissionlessEnabled.value && isPermissionlessPool(creator))
          return true;
        if (isYukichiEnabled.value && isYukichiPool(creator)) return true;

        return false;
      })
      .map(pool => ({
        ...pool,
        isVerified: isVerifiedPool(pool.owner || pool.creator),
      }));
  }

  return {
    isVerifiedEnabled,
    isPermissionlessEnabled,
    isYukichiEnabled,
    filterPools,
    isVerifiedPool,
    isYukichiPool,
    isPermissionlessPool,
  };
}
