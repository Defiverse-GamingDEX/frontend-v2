import { computed } from 'vue';
import { isOasys } from '@/composables/useNetwork';

/**
 * Feature flags for controlling feature visibility
 */

// TODO: Remove this after the restake period starts
// Fixed start date: 2025/11/06 00:00:00
const RESTAKE_FEATURE_START_DATE = new Date('2025-11-06T00:00:00Z');

export const isRestakeFeatureEnabled = computed(() => {
  // only show after the start date
  return new Date() >= RESTAKE_FEATURE_START_DATE;
});
