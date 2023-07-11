import Vue from 'vue';
import App from './App.vue';
import router from './router'
import vuetify from './plugins/vuetify'
import * as Config from './plugins/config';
import * as Store from '@/plugins/store';
import i18n from './plugins/i18n';

Vue.prototype.$kConfig = Config.kConfig;
Vue.prototype.$store = Store;

(async function init() {
    const earlyErrors = [];

    try { await Config.init(); }
    catch (e) { earlyErrors.push(e); }

    new Vue({
        router,
        vuetify,
        i18n,
        render: (h) => h(App, {
            props: {
                earlyErrors,
            }
        }),
    }).$mount('#app');
})();
