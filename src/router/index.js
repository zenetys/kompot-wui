import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '@/views/Home.vue';
import Panel from '@/components/Panel.vue';
import Drawio from '@/components/DrawIo.vue';
import Graph from '@/components/Graph.vue';

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
    {
        path: '/history',
        name: 'Historique',
        component: LogViewer,
    },
];

const router = new VueRouter({
    routes,
});

export default router;
