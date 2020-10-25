import Vue from "vue";

Vue.mixin({
    computed: {
        sidebarVisible() {
            return this.$store.state.sidebarVisible;
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
        totalUsage() {
            return this.$store.state.totalUsage;
        },
        window() {
            return window;
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
        toggleMainSidebar() {
            this.$store.commit('toggleSidebar');
        },
        playMovie(movie) {
            this.$store.commit('setMovie', movie);
            this.reach('/movie');
        }
    }
});

