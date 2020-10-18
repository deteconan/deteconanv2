import Vue from 'vue';
import Router from 'vue-router';

import Home from "@/views/Home.vue";
import Administration from "@/views/Administration.vue";

Vue.use(Router);

export default new Router({
    mode: `history`,
    routes: [
        {
            path: `/`,
            name: `home`,
            component: Home
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Administration
        }
    ]
});
