import { ref, onMounted } from 'vue';
import gaugeApi from './gauge.api.js';

interface VotingInfoResponse {
  next_period: {
    emission: number;
    total_vote_powers: string;
    total_fee: number;
  };
}

export default function useVotingInfo() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const data = ref<VotingInfoResponse | null>(null);

  const fetchVotingInfo = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await gaugeApi.getVotingInfo();
      data.value = response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching voting info:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch data on mount
  onMounted(() => {
    fetchVotingInfo();
  });

  return {
    isLoading,
    error,
    data,
    refetch: fetchVotingInfo,
  };
}
