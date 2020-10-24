import Vue from 'vue'
import Vuex from 'vuex'
import Network from "@/helpers/Network.js";

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        sidebarVisible: true,
        folders: [],
        movies: [],
        playingMovie: null,
        totalUsage: 0
    },
    mutations: {
        toggleSidebar(state) {
            state.sidebarVisible = !state.sidebarVisible;
        },
        setFolders(state, folders) {
            state.folders = folders;
        },
        setMovies(state, movies) {
            state.movies = movies;
        },
        setMovie(state, movie) {
            state.playingMovie = movie;
        },
        setTotalUsage(state, usage) {
            state.totalUsage = usage;
        }
    },
    actions: {
        loadFolders({ commit }) {
            return Network.get('/folders').then(res => {
                commit('setFolders', res.data);
            });
        },
        loadMovies({ commit }) {
            return Network.get('/movies').then(res => {
                commit('setMovies', res.data);
            });
        },
        getTotalUsage({ commit }) {
            return Network.get('/usage/total').then(res => {
                commit('setTotalUsage', res.data);
            });
        }
    }
})
