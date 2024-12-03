import Vue from 'vue';
import VueRouter from 'vue-router';

import Panel from '@/components/Panel.vue';
import DrawioViewerLegacy from '@/components/DrawioViewerLegacy.vue';
import DrawioViewer from '@/components/DrawioViewer.vue';
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
        path: '/drawio/view/:schema',
        name: 'DrawioViewer',
        component: DrawioViewer,
    },
    {
        /* Keep this route and component for now to preserve
         * compatibility with old drawio menu items. */
        path: '/drawio/*',
        name: 'DrawioViewerLegacy',
        component: DrawioViewerLegacy,
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
