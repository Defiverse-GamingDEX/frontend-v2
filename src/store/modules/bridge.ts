import { networkId } from '@/composables/useNetwork';
import initialTokens from '@/constants/initialTokens.json';
import { lsGet, lsSet } from '@/lib/utils';

export interface BridgeState {
  inputAsset: string;
  outputAsset: string;
}

const state: BridgeState = {
  inputAsset: '',
  outputAsset: '',
};

const actions = {
  init({ commit }) {
    commit(
      'setInputAsset',
      lsGet(
        `bridge.inputAsset.${networkId.value}`,
        initialTokens[networkId.value]?.input
      )
    );
    commit(
      'setOutputAsset',
      lsGet(
        `bridge.outputAsset.${networkId.value}`,
        initialTokens[networkId.value]?.output
      )
    );
  },
};

const mutations = {
  setInputAsset(state: BridgeState, asset: string): void {
    state.inputAsset = asset;
    lsSet(`bridge.inputAsset.${networkId.value}`, asset);
  },

  setOutputAsset(state: BridgeState, asset: string): void {
    console.log('setOutputAsset=>asset', asset);
    state.outputAsset = asset;
    lsSet(`bridge.outputAsset.${networkId.value}`, asset);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
