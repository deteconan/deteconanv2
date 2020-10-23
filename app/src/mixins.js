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
        }
    }
});

