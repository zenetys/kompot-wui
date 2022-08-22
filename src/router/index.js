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
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    },
];

const router = new VueRouter({
    routes,
});

export default router;
