import Vue from 'vue'
import Router from 'vue-router'
import Movies from "@/views/Movies.vue"
import Upload from "@/views/Upload.vue"

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
        }
    ]
})
