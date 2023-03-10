import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { ApprovalService, HouseHoldService, UserService } from '@/service';
import { AccountFilterModel, ChangeUserNameRequest, SessionState } from '@/model';

const state: SessionState = {
    filters: null,
    notifications: parseInt(sessionStorage.getItem("wmx-notification-count")) || null,
    dismissNotification: sessionStorage.getItem("wmx-notification-dismiss") == "true" ? true : false,
    user: null,
    logo: sessionStorage.getItem("wmx-logo") || null
}

const getters: GetterTree<SessionState, any> = {
    billingMethod: state => {
        return state.filters ? state.filters.billingMethod : {};
    },
    billingFrequency: state => {
        return state.filters ? state.filters.billingFrequency : {};
    },
    custodian: state => {
        return state.filters ? state.filters.custodian : {};
    },
    manager: state => {
        return state.filters ? state.filters.manager : {};
    },
    product: state => {
        return state.filters ? state.filters.product : {};
    },
    program: state => {
        return state.filters ? state.filters.program : {};
    },
    style: state => {
        return state.filters ? state.filters.style : {};
    },
    valuationMethod: state => {
        return state.filters ? state.filters.valuationMethod : {};
    },
    periods: state => {
        return state.filters? state.filters.periods: [];
    },
    status: state => {
        return state.filters? state.filters.status: {};
    },
    notifications: number => {
        return state.notifications;
    },
    showNotificationBar: boolean => {
        return state.notifications > 0 && !state.dismissNotification;
    },
    userName: string => {
        return state.user?.nickName || state.user?.userName;
    },
    userAvatar: string => {
        return state.user?.avatar;
    },
    logo: string => {
        return state.logo;
    }
}
const mutations: MutationTree<SessionState> = {
    onLoadFilters(state, response) {
        state.filters = response;

        sessionStorage.setItem("wmx-default-filters", JSON.stringify(response));
    },
    onLoadNotification(state, count) {
        state.notifications = count;

        sessionStorage.setItem("wmx-notification-count", count.toString());
    },
    onDismissNotification(state) {
        state.dismissNotification = true;

        sessionStorage.setItem("wmx-notification-dismiss", "true");
    },
    onLoadUser(state, user) {
        state.user = user;

        sessionStorage.setItem("wmx-user", JSON.stringify(user));
    },
    onLoadLogo(state, logo) {
        state.logo = logo;

        sessionStorage.setItem("wmx-logo", logo);
    }
}
const actions: ActionTree<SessionState, any> = {
    checkSession(context) {
        if (!context.state.filters) {
            let cache = sessionStorage.getItem("wmx-default-filters");
            if (cache) {
                context.commit("onLoadFilters", JSON.parse(cache));
            }
            else {
                context.dispatch("loadFilters");
            }
        }

        if (context.state.notifications == null)
            context.dispatch("loadNotification");

        if (!context.state.user) {
            let cache = sessionStorage.getItem("wmx-user");
            if (cache) {
                context.commit("onLoadUser", JSON.parse(cache));
            }
            else {
                context.dispatch("loadUser");
            }
        }

        if (context.state.logo == null)
            context.dispatch("loadLogo", context.getters.selectedFirm);
    },

    loadFilters(context) {
        let service = new HouseHoldService();

        service.getFilters().then(response => {
            context.commit("onLoadFilters", response);
        });
    },
    loadNotification(context) {
        let service = new ApprovalService();

        service.getPendingCount().then((count) => {
            context.commit("onLoadNotification", count);
        });
    },
    loadUser(context) {
        let service = new UserService();

        service.getItem(undefined).then((user) => {
            context.commit("onLoadUser", user);
        });
    },
    loadLogo(context, firmCode) {
        let service = new UserService();

        service.getLogo(firmCode).then((logo) => {
            context.commit("onLoadLogo", logo);
        });
    },
    updateUserName(context, userName) {
        let service = new UserService();
        const request = new ChangeUserNameRequest();
        request.nickName = userName;
        service.changeUserName(request).then((response) => {
            let user = context.state.user;
            user.nickName = response.nickName;

            context.commit("onLoadUser", user);
        });
    },

    updateUserAvatar(context, file) {
        let service = new UserService();
        service.uploadAvatar(file).then((response) => {
            let user = context.state.user;
            user.avatar = response.avatar;

            context.commit("onLoadUser", user);
        });
    },

    dismissNotification(context) {
        context.commit("onDismissNotification");
    },

    clearSession(context) {
        context.state.filters = null;
        context.state.notifications = null;
        context.state.user = null;

        sessionStorage.removeItem("wmx-default-filters");
        sessionStorage.removeItem("wmx-notification-count");
        sessionStorage.removeItem("wmx-notification-dismiss");
        sessionStorage.removeItem("wmx-user");
        sessionStorage.removeItem("wmx-logo");

        sessionStorage.removeItem("wmx-upload-billing");
        sessionStorage.removeItem("wmx-upload-billing-file-info-accounts");
        sessionStorage.removeItem("wmx-upload-billing-file-info-assets");
    }
}

export const SessionModule = {
    state,
    getters,
    mutations,
    actions
};