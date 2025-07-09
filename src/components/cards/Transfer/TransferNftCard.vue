<template>
  <BalCard class="relative card-container bg-blue" shadow="none" noBorder>
    <BalAlert
      v-if="!isWalletReady"
      class="p-3 mb-4"
      type="error"
      size="md"
      :title="$t('connectYourWallet')"
      block
    />
    <BalAlert
      v-else-if="!isChainSupprtSendNft"
      class="p-3 mb-4"
      type="error"
      size="md"
      :title="$t('unsupportedNetwork')"
      block
    />

    <BalStack spacing="xs" vertical>
      <h6 class="mb-1">
        {{ $t('transfer.tokenType') }}
      </h6>
      <BalBtnGroup v-model="tokenType" :options="optionsTokenType" />
    </BalStack>
    <TransferNftCard721 v-show="tokenType == 'erc721'" />
    <TransferNftCard1155 v-show="tokenType == 'erc1155'" />
  </BalCard>
</template>

<script setup lang="ts">
import TransferNftCard721 from './TransferNftCard721.vue';
import TransferNftCard1155 from './TransferNftCard1155.vue';

import useTransferTokens from '@/composables/transfer/useTransferTokens';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * STATE
 */
const tokenType = ref('erc721');

const optionsTokenType = [
  { label: 'NFT - ERC721', value: 'erc721' },
  { label: 'NFT - ERC1155', value: 'erc1155' },
];

/**
 * COMPOSABLES
 */
const { isChainSupprtSendNft } = useTransferTokens();
const { isWalletReady } = useWeb3();
</script>

