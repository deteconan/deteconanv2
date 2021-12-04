import Vue from "vue";

Vue.mixin({
    computed: {
        user() {
            return this.$store.state.user;
        },
        sidebarVisible() {
            return this.$store.state.sidebarVisible;
        },
        playerVisible() {
            return this.$store.state.playerVisible;
        },
        folders() {
            return this.$store.state.folders;
        },
        movies() {
            return this.$store.state.movies;
        },
        playingMovie() {
            return this.$store.state.playingMovie;
        },
        genres() {
            return this.$store.state.genres;
        },
        totalUsage() {
            return this.$store.state.totalUsage;
        },
        window() {
            return window;
        },
        apiURL() {
            return process.env.VUE_APP_API_URL;
        },
        isAdmin() {
            return this.user && this.user.admin;
        },
        isMobileLayout() {
            return this.$store.state.isMobileLayout;
        }
    },
    methods: {
        reach(url) {
            if (this.$route.path !== url)
                this.$router.push(url);
        },
        switchTheme() {
            this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        },
        togglePlayer() {
            this.$store.commit('togglePlayer');
        },
        playMovie(movie) {
            return this.reach(`/movie/${movie.tmdbId}`);
        },
        rippleDelay(callback) {
            setTimeout(callback, 250);
        },
        toggleMovieDialog(visible, movie) {
            this.$store.commit('toggleMovieDialog', { visible, movie });
        }
    }
});

