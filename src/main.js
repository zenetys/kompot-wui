import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import axios from 'axios';
import * as Config from './plugins/config';
import * as Store from '@/plugins/store';
import i18n from './plugins/i18n';
import VueSession from 'vue-session';
import { store } from './store';

Vue.config.productionTip = false;
Vue.prototype.$kConfig = Config.kConfig;
Vue.prototype.$store = Store;
Vue.use(VueSession);

(async function init() {
    const earlyErrors = [];

    try { await Config.init(); }
    catch (e) { earlyErrors.push(e); }

    new Vue({
        router,
        vuetify,
        axios,
        i18n,
        store,
        render: (h) => h(App, {
            props: {
                earlyErrors,
            }
        }),
    }).$mount('#app');
})();
