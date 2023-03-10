import { PluginObject } from 'vue';
import { VueHelperProvider } from './vuehelper';

declare module 'vue/types/vue' {
    interface Vue {
        $vuehelper: VueHelperProvider;
    }
}

interface VueHelper extends PluginObject<undefined> {}

declare const VueHelper: VueHelper;
export = VueHelper;
