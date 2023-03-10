import { GetterTree, MutationTree, ActionTree } from 'vuex';
import axios from "axios";

import { DataEntitlementState } from '@/model';
import { UserService } from '@/service';

const ADVISOR_KEY = 'advisor_code';
const FIRM_KEY = 'firm_code';

const state: DataEntitlementState = {
    advisor: localStorage.getItem(ADVISOR_KEY),
    firm: localStorage.getItem(FIRM_KEY),
    dataEntitlements: []
}
const getters: GetterTree<DataEntitlementState, any> = {
    dataEntitlements: state => {
        return state.dataEntitlements
    },
    selectedFirm: state => {
        return state.firm
    },
    selectedAdvisor: state => {
        return state.advisor;
    },
    firms: state => {
        return state.dataEntitlements ? state.dataEntitlements.map(e => e.firmCode) : [];
    },
    advisors: state => {
        var firm = state.dataEntitlements.find(e => e.firmCode == state.firm);

        return firm ? firm.advisors : [];
    }
}
const mutations: MutationTree<DataEntitlementState> = {
    onLoadEntitlements(state, dataEntitlements) {
        state.dataEntitlements = dataEntitlements;

        let advisors = state.advisor;
        if (dataEntitlements && dataEntitlements.length) {
            if (!state.firm)
                state.firm = dataEntitlements[0].firmCode;

            let selectedFirm = state.dataEntitlements.find(e => e.firmCode == state.firm);
            if (selectedFirm && !advisors)
                advisors = selectedFirm.advisors.join(",");
        }

        axios.defaults.headers.common["firm"] = state.firm;
        axios.defaults.headers.common["advisors"] = advisors;
    },
    onFirmCodeChanged: (state, firmCode) => {
        localStorage.setItem(FIRM_KEY, firmCode);

        state.firm = firmCode;

        localStorage.removeItem(ADVISOR_KEY);
        state.advisor = "";
    },
    onAdvisorCodeChanged: (state, advisorCode) => {
        localStorage.setItem(ADVISOR_KEY, advisorCode);

        state.advisor = advisorCode;
    }
}
const actions: ActionTree<DataEntitlementState, any> = {
    clearEntitlements(context) {
        localStorage.removeItem(ADVISOR_KEY);
        localStorage.removeItem(FIRM_KEY);

        context.state.advisor = "";
        context.state.firm = "";
        context.state.dataEntitlements = [];
    },

    loadEntitlements(context) {
        if (!context.state.dataEntitlements || !context.state.dataEntitlements.length) {
            let service = new UserService();

            return service.getDataEntitlements().then(response => {
                context.commit("onLoadEntitlements", response);
            });
        }
        else {
            return new Promise((resolve, reject) => {
                context.commit("onLoadEntitlements", context.state.dataEntitlements);

                resolve(context.state.dataEntitlements);
            });
        }
    },

    firmCodeChanged(context, firmCode) {
        context.commit('onFirmCodeChanged', firmCode)
    },

    advisorCodeChanged(context, advisorCode) {
        context.commit('onAdvisorCodeChanged', advisorCode)
    }
}

export const DataEntitlementModule = {
    state,
    getters,
    mutations,
    actions
}