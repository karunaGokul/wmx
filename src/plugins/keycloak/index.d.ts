import { PluginObject } from 'vue';

declare module 'vue/types/vue' {
    interface Vue {
        $keycloak: any;
    }
}

interface VueKeycloak extends PluginObject<undefined> {}

declare const VueKeycloak: VueKeycloak;
export = VueKeycloak;
