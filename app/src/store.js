import Vue from 'vue'
import Vuex from 'vuex'
import Network from "@/helpers/Network.js"
import router from "@/router.js"

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        user: null,
        sidebarVisible: true,
        playerVisible: false,
        folders: [],
        movies: [],
        playingMovie: null,
        totalUsage: 0,
        searchMovie: ''
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        toggleSidebar(state) {
            state.sidebarVisible = !state.sidebarVisible;
        },
        togglePlayer(state) {
            state.playerVisible = !state.playerVisible;
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
        },
        searchMovie(state, search) {
            state.searchMovie = search;
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
        },
        async login({ commit, dispatch }) {
            // eslint-disable-next-line no-undef
            const auth = gapi.auth2.getAuthInstance();
            await auth.signIn();
            const token = auth.currentUser.get().getAuthResponse(true).access_token;
            localStorage.setItem('token', token);

            return Network.post('/users/grant-access')
                .then(() => dispatch('getCurrentUser'))
                .catch(err => {
                    console.error(err.response.data);
                    commit('setUser', null);
                    Network.removeToken();
                });
        },
        async logout({ commit }) {
            // eslint-disable-next-line no-undef
            const auth = gapi.auth2.getAuthInstance();
            await auth.signOut();
            commit('setUser', null);
            Network.removeToken();
            if (router.currentRoute.fullPath !== '/')
                router.push('/');
        },
        getCurrentUser({ commit }) {
            return Network.get('/users/current-user').then(res => {
                try {
                    // eslint-disable-next-line no-undef
                    Vue.prototype.$gauth.then(() => {
                        // eslint-disable-next-line no-undef
                        const auth = gapi.auth2.getAuthInstance();
                        const profile = auth.currentUser.get().getBasicProfile();
                        const user = {
                            email: res.data.email,
                            admin: res.data.admin,
                            name: profile.getGivenName(),
                            avatar: profile.getImageUrl()
                        };
                        commit('setUser', user);
                    });
                } catch (err) {
                    console.error(err);
                    commit('setUser', null);
                    Network.removeToken();
                }
            }).catch(() => {
                commit('setUser', null);
            });
        }
    }
})
