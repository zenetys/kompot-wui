import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Panel from '../components/Panel';
import Drawio from '../components/DrawIo';
import Graph from '../components/Graph';
import Config from '/public/static/config.json';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        redirect: '/panel',
    },
    {
        path: '/panel',
        name: 'Bac à état',
        component: Panel,
        props: {
            apiType: Config.apiType
        },
    },
    {
        path: '/drawio/*',
        name: 'Schéma de baie',
        component: Drawio,
    },
    {
        path: '/graph/:site',
        name: 'IPSLA',
        component: Graph,
    },
];

const router = new VueRouter({
    routes,
});

export default router;
