import axios from 'axios';
const MAINNET_API_URL = 'https://price-api.gaming-dex.com/api';
const TESTNET_API_URL = 'https://price-api-testnet.gaming-dex.com/api';

const isTestnet = import.meta.env.VITE_IS_TESTNET == 'true' || 'false';
const domain = isTestnet == 'false' ? MAINNET_API_URL : TESTNET_API_URL;

// INTERNAL API - END
export default {
  /**
   * Search pool list with filters and pagination
   * @param {Object} params - Search parameters
   * @param {string | null} params.filter_type - Filter type: 'verified', 'yukichi', 'permission_less'
   * @param {number} params.chain_id - Chain ID: 248, 9732, 16116, 17117
   * @param {string} params.order_field - Order field: 'total_liquidity', 'total_swap_volume'
   * @param {string} params.order_type - Order type: 'desc', 'asc'
   * @param {number} [params.offset] - Offset for pagination (default: 0)
   * @param {number} [params.limit] - Limit for pagination (default: 30)
   * @param {string[]} [params.token_addresses] - Array of token addresses to filter pools
   * @returns {Promise} API response
   */
  async searchPoolList(params = {}) {
    try {
      const {
        filter_type = null,
        chain_id = 248,
        order_field = 'total_liquidity',
        order_type = 'desc',
        offset = 0,
        limit = 30,
        token_addresses = null,
      } = params;

      const queryParams = new URLSearchParams({
        filter_type,
        chain_id: chain_id.toString(),
        order_field,
        order_type,
        offset: offset.toString(),
        limit: limit.toString(),
      });

      // Add token_addresses if provided
      if (token_addresses && token_addresses.length > 0) {
        token_addresses.forEach(address => {
          queryParams.append('token_addresses', address);
        });
      }

      const response = await axios.get(
        `${domain}/v1/pools/search?${queryParams}`
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error searching pool list:', error);
      throw error;
    }
  },
};
