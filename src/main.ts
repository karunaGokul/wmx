import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from "axios";

import './styles/main.scss';

import VueKeycloak from './plugins/keycloak';
import VueHelper from './plugins/vue-helper';
import Vuelidate from 'vuelidate';

import cssVars from 'css-vars-ponyfill';

Vue.config.productionTip = false;

cssVars({
  rootElement: document,
  onlyLegacy: true
});

Vue.use(VueHelper);
Vue.use(Vuelidate);

store.dispatch("loadSettings").then(() => {
  Vue.use(VueKeycloak, {
    init: {
      onLoad: 'login-required', checkLoginIframe: false
    },
    config: {
      url: store.getters.settings.keycloakUrl,
      realm: store.getters.settings.keycloakRealm,
      clientId: store.getters.settings.keycloakClientId,
      logoutRedirectUri: window.location.origin
    },
    onReady: () => {
      tokenInterceptor();

      new Vue({
        router,
        store,
        render: h => h(App)
      }).$mount('#app')
    }
  })
});

function tokenInterceptor() {
  axios.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${Vue.prototype.$keycloak.token}`
    return config
  }, error => {
    return Promise.reject(error)
  })

  const interceptor = axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const status = error.response ? error.response.status : null;
      axios.interceptors.response.eject(interceptor);

      if (status !== 401) return Promise.reject(error);
      if (status == 401) {
        store.dispatch("clearEntitlements");
        store.dispatch("clearSession");
        Vue.prototype.$keycloak.logoutFn();
        router.push("/").catch(err => { });
        return Promise.reject(error);
      }
    }
  )
}
