<script setup lang="ts">
import { ref } from 'vue';
import ZIcon from '@/assets/images/bridge/tokens/Z.png';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useRouter } from 'vue-router';

const myZ = ref(0);
const myLockedZ = ref(105);
const mySZ = ref(100);
/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
const router = useRouter();
/**
/**
 * FUNCTIONS
 */
const goToSwap = () => {
  router.push({ name: 'swap' });
};
</script>

<template>
  <div class="staking-info">
    <h5 class="staking-info-title">My sZ</h5>

    <div class="flex flex-col gap-5">
      <!-- My Z -->
      <BalCard noBorder :square="upToLargeBreakpoint">
        <div class="card-content">
          <div class="title">My Z</div>
          <div class="flex justify-between items-center">
            <div class="amount">{{ myZ }}</div>
            <div class="flex gap-1 items-center">
              <BalIcon
                name="plus-circle"
                class="mr-2 transition-all cursor-pointer link plus-circle"
                @click="goToSwap()"
              />
            </div>
          </div>
          <div class="separator">-</div>
        </div>
      </BalCard>

      <!-- My locked Z -->
      <BalCard noBorder :square="upToLargeBreakpoint">
        <div class="card-content">
          <div class="title">My locked Z</div>
          <div class="flex justify-between items-center">
            <div class="amount">{{ myLockedZ }}</div>
            <!-- <div class="flex gap-1 items-center">
              <img :src="ZIcon" alt="Z Token" class="w-4 h-4" />
              <span class="token">Z</span>
            </div> -->
          </div>
          <div class="separator">-</div>
        </div>
      </BalCard>

      <!-- My sZ -->
      <BalCard noBorder :square="upToLargeBreakpoint">
        <div class="card-content">
          <div class="title">My sZ</div>
          <div class="flex justify-between items-center">
            <div class="amount">{{ mySZ }}</div>
            <div class="flex gap-1 items-center">
              <router-link
                :to="{
                  name: 'portfolio',
                }"
                class="transition-all cursor-pointer link"
                >Manage</router-link
              >
            </div>
          </div>
          <div class="separator">-</div>
        </div>
      </BalCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.staking-info {
  .staking-info-title {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .card-content {
    .title {
      color: #314472;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .amount {
      color: #314472;
      font-size: 28px;
      font-weight: bold;
    }
    .token {
      @apply text-xl font-bold text-gray-800;
    }

    .separator {
      color: #314472;
    }
    .link {
      color: #2563eb;
    }
  }
}
</style>
