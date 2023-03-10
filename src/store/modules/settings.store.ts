import axios from 'axios';
import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { SettingsModel, SettingsState } from '@/model';

const state: SettingsState = {
    settings: null
}

const getters: GetterTree<SettingsState, any> = {
    settings: SettingsModel => {
        return state.settings;
    }
}
const mutations: MutationTree<SettingsState> = {
    onLoadSettings(state, settings) {
        state.settings = settings;
    }
}
const actions: ActionTree<SettingsState, any> = {
    loadSettings(context) {
        if (context.state.settings == null) {
            return axios.get("/theme.json")
                .then(json => {
                    context.commit("onLoadSettings", json.data);
                });
        }
        else {
            return new Promise((resolve, reject) => {
                resolve(null);
            });
        }
    }
}

export const SettingsModule = {
    state,
    getters,
    mutations,
    actions
};