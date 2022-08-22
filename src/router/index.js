import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Panel from '../components/Panel';
import Drawio from '../components/DrawIo';
import Graph from '../components/Graph';

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
        props: (route) => ({
            level: route.query.level,
            filter: route.query.filter,
            type_api: 'nagios',
        }),
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
