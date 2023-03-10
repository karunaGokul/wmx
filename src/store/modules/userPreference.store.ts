import { GetterTree, MutationTree, ActionTree } from 'vuex';
import axios from "axios";

import { UserPreferenceState } from '@/model';
import { UserService } from '@/service';
const state: UserPreferenceState = {
    userPreferences: []

}
const getters: GetterTree<UserPreferenceState, any> = {
    userPreferences: state => {
        return state.userPreferences;
    }
}
const mutations: MutationTree<UserPreferenceState> = {
    onLoadUserPreferences(state, data) {
        state.userPreferences = data;
    },
    onUpdateUserPreferences(state, data) {
        state.userPreferences = data;
    }

}
const actions: ActionTree<UserPreferenceState, any> = {
    loadUserPreferences(context) {
        if (!context.state.userPreferences || !context.state.userPreferences.length) {
            let service = new UserService();
            return service.getUserPreference().then(response => {
                context.commit("onLoadUserPreferences", response);
            });
        }
        else {
            return new Promise((resolve, reject) => {
                context.commit("onLoadUserPreferences", context.state.userPreferences);
                resolve(context.state.userPreferences);
            });
        }
    },

    updateUserPreferences(context) {
        context.state.userPreferences = [];
        let service = new UserService();
        return service.getUserPreference().then(response => {
            context.commit("onUpdateUserPreferences", response);
        });               
    }

}
export const UserPreferenceModule = {
    state,
    getters,
    mutations,
    actions
}