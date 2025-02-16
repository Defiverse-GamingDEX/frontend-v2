import TokenListService from '@/services/token-list/token-list.service';
import { initializeTokenListMap } from '@/constants/tokenlists';

const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({
    path: path.resolve(__dirname, '../../../.env.development'),
  });
} else {
  require('dotenv').config();
}

async function generate() {
  const TOKEN_LIST_MAP = await initializeTokenListMap();
  console.log('🚀 ~ generate ~ TOKEN_LIST_MAP:', TOKEN_LIST_MAP);
  Object.keys(TOKEN_LIST_MAP).forEach(async networkId => {
    console.log(`Generating tokenlist for network ${networkId}...`);
    const tokenListService = new TokenListService(networkId);
    const uris = await tokenListService.getUris();
    // check if any uris are avaialble
    if (uris.All.find(uri => !!uri)) {
      const tokenlists = await tokenListService.getAll();
      fs.writeFileSync(
        `./src/assets/data/tokenlists/tokens-${networkId}.json`,
        JSON.stringify(tokenlists)
      );
    }
  });
}

(async () => {
  try {
    console.log('⏳ Generating tokenlists...');
    await generate();
    console.log('✅ Generated tokenlists at /src/assets/data/tokenlists/*');
  } catch (error) {
    console.error('Failed to generate tokenlists:', error);
    process.exit(1);
  }
})();
