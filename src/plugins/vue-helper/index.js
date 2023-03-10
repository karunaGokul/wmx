import { VueHelperProvider } from './vuehelper';

export default {
    install(vue, opts){   
        vue.prototype.$vuehelper = new VueHelperProvider();
    }
}   