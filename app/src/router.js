import Vue from 'vue'
import Router from 'vue-router'
import Home from "@/views/Home.vue"
import Movies from "@/views/Movies.vue"
import Upload from "@/views/Upload.vue"
import PlayingMovie from "@/views/PlayingMovie.vue"
import store from "@/store.js"

Vue.use(Router)

/*
function needAuthentication(to, from, next) {
    if (store.state.user)
        next();
    else
        next('/');
} */

function needAdmin(to, from, next) {
    if (store.state.user && store.state.user.admin)
        next();
    else
        next('/');
}

export default new Router({
    mode: `history`,
    routes: [
        {
            path: `/`,
            name: `accueil`,
            component: Home
        },
        {
            path: `/movies`,
            name: `films`,
            component: Movies
        },
        {
            path: `/upload`,
            name: `upload`,
            component: Upload,
            beforeEnter: needAdmin
        },
        {
            path: `/movie/:id`,
            name: `film`,
            component: PlayingMovie
        }
    ]
})
