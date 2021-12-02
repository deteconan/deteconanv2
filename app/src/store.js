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
        searchMovie: '',
        isMobileLayout: false,
        genres: [],

        movieDialog: {
            visible: false,
            movieId: null
        }
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        toggleSidebar(state, visible = null) {
            if (visible === null)
                state.sidebarVisible = !state.sidebarVisible;
            else
                state.sidebarVisible = visible;
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
        },
        updateLayout(state) {
            state.isMobileLayout = window.innerWidth < 600;
        },
        setGenres(state, genres) {
            state.genres = genres;
        },
        toggleMovieDialog(state, { visible, movieId }) {
            state.movieDialog.visible = visible;
            state.movieDialog.movieId = movieId;
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
        loadGoogleAuthApi() {
            return new Promise((resolve, reject) => {
                // eslint-disable-next-line no-undef
                gapi.load('auth2', () => {
                    // eslint-disable-next-line no-undef
                    gapi.auth2.init({ client_id: '22198592066-5d2g6ruijvqt2ne5psd5hdhlbhq8dotd.apps.googleusercontent.com' })
                        .then(resolve)
                        .catch(reject);
                });
            });
        },
        getCurrentUser({ commit }) {
            return Network.get('/users/current-user').then(res => {
                try {
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
                } catch (err) {
                    console.error(err);
                    commit('setUser', null);
                    Network.removeToken();
                }
            }).catch(() => {
                commit('setUser', null);
            });
        },
        loadGenres({ commit }) {
            return Network.get('/movies/genres')
                .then(res => commit('setGenres', res.data))
                .catch(err => console.error(err.response.data));
        }
    }
})
