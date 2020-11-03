import Vue from 'vue'
import Router from 'vue-router'
import Home from "@/views/Home.vue"
import Movies from "@/views/Movies.vue"
import Upload from "@/views/Upload.vue"
import PlayingMovie from "@/views/PlayingMovie.vue"

Vue.use(Router)

function needAuthentication(to, from, next) {
    const token = localStorage.getItem('token');

    if (token)
        next();
    else
        next('/');
}

export default new Router({
    mode: `history`,
    routes: [
        {
            path: `/`,
            name: `home`,
            component: Home
        },
        {
            path: `/movies`,
            name: `movies`,
            component: Movies
        },
        {
            path: `/upload`,
            name: `upload`,
            component: Upload,
            beforeEnter: needAuthentication
        },
        {
            path: `/movie/:id`,
            name: `movie`,
            component: PlayingMovie
        }
    ]
})
