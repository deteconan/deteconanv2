import Vue from 'vue'
import Router from 'vue-router'
import Movies from "@/views/Movies.vue"
import Upload from "@/views/Upload.vue"
import PlayingMovie from "@/views/PlayingMovie.vue"

Vue.use(Router)

export default new Router({
    mode: `history`,
    routes: [
        {
            path: `/movies`,
            name: `movies`,
            component: Movies
        },
        {
            path: `/upload`,
            name: `upload`,
            component: Upload
        },
        {
            path: `/movie/:id`,
            name: `movie`,
            component: PlayingMovie
        }
    ]
})
