import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import vuetify from '@/plugins/vuetify';
import axios from 'axios';
import i18n from '@/plugins/i18n';
import VueSession from 'vue-session';
import { store } from './store';
import Config from '/public/static/config.json';

Vue.config.productionTip = false;
Vue.use(VueSession);

// Global variable for api to call
Vue.prototype.$apiType = Config.apiType;
Vue.prototype.$api = Config.api;
Vue.prototype.$dataPath = Config.dataPath;
Vue.prototype.$columnSettingsId = Config.columnSettingsId;

new Vue({
    router,
    vuetify,
    axios,
    i18n,
    store,
    render: (h) => h(App),
}).$mount('#app');
