import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import vuetify from '@/plugins/vuetify';
import axios from 'axios';
import i18n from '@/plugins/i18n';
import VueSession from 'vue-session';
import { store } from './store';

Vue.config.productionTip = false;
Vue.use(VueSession);


new Vue({
    router,
    vuetify,
    axios,
    i18n,
    store,
    render: (h) => h(App),
}).$mount('#app');
