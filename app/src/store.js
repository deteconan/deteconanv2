import Vue from 'vue'
import Vuex from 'vuex'
import Network from "@/helpers/Network.js";

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
        login({ commit, dispatch }) {
            return Vue.GoogleAuth.then(auth2 => {
                auth2.signIn().then(() => {
                    const token = auth2.currentUser.get().wc.access_token;
                    localStorage.setItem('token', token);
                }).then(() => Network.post('/users/grant-access')).then(() => {
                    dispatch('getCurrentUser');
                }).catch(err => {
                    console.error(err);
                    commit('setUser', null);
                    Network.removeToken();
                });
            });
        },
        logout({ commit }) {
            return Vue.GoogleAuth.then(auth2 => {
                auth2.signOut().then(() => {
                    commit('setUser', null);
                    Network.removeToken();
                });
            });
        },
        getCurrentUser({ commit }) {
            return Network.get('/users/current-user').then(res => {
                Vue.GoogleAuth.then(auth2 => {
                    if (auth2.isSignedIn.get()) {
                        const user = {
                            email: res.data.email,
                            admin: res.data.admin,
                            name: auth2.currentUser.get().tt.Ad,
                            avatar: auth2.currentUser.get().tt.dK
                        };
                        commit('setUser', user);
                    } else {
                        commit('setUser', null);
                        Network.removeToken();
                    }
                });
            }).catch(() => {
                commit('setUser', null);
            });
        }
    }
})
