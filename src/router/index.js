import Vue from 'vue';
import VueRouter from 'vue-router';

import Panel from '@/components/Panel.vue';
import Drawio from '@/components/DrawIo.vue';
import Graph from '@/components/Graph.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
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
];

const router = new VueRouter({
    routes,
});

export default router;
