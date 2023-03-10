import Vue from 'vue';
import Vuex from 'vuex';

import { DataEntitlementModule } from './modules/entitlement.store';
import { SessionModule } from './modules/session.store';
import { SettingsModule } from './modules/settings.store';
import { UserPreferenceModule } from './modules/userPreference.store';

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    DataEntitlementModule,
    SessionModule,
    SettingsModule,
    UserPreferenceModule
  }
})
