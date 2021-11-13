<template>
    <div id="app">
        <v-app :class="{'mobile': isMobileLayout}">
            <toolbar></toolbar>
            <div class="body-page">
                <sidebar></sidebar>
                <movie-player></movie-player>

                <keep-alive>
                    <router-view></router-view>
                </keep-alive>
            </div>
        </v-app>
    </div>
</template>

<script>
import Toolbar from "@/layouts/Toolbar.vue";
import Sidebar from "@/layouts/Sidebar.vue";
import MoviePlayer from "@/layouts/MoviePlayer.vue";

export default {
    name: 'App',
    components: {MoviePlayer, Sidebar, Toolbar},
    async created() {
        this.$store.commit('updateLayout');
        window.addEventListener('resize', async () => {
            this.$store.commit('updateLayout');
        });

        this.$store.dispatch('loadGoogleAuthApi').then(() => this.$store.dispatch('getCurrentUser'));
        await this.$store.dispatch('loadFolders');
        await this.$store.dispatch('loadMovies');
        await this.$store.dispatch('loadGenres');
        await this.$store.dispatch('getTotalUsage');
    }
}
</script>

<style lang="scss">
html, body {
    overflow: auto !important;
    --preview-width: 200px;
}

#app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Barlow', sans-serif;
    --toolbar-size: 64px;
    overflow: hidden;

    .mobile {
        --preview-width: 40vw;
    }

    .body-page {
        position: fixed;
        width: 100%;
        height: 100%;
        padding-top: var(--toolbar-size);
        top: 0;
        left: 0;
        display: flex;

        background-image: url("./assets/img/gradient-blur-wallpaper.jpg");
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
    }
}

*::-webkit-scrollbar {
    width: 8px;
    height: 12px;
}

*::-webkit-scrollbar-track {
    background-color: #2f2f2f;
    border-radius: 15px;
}

*::-webkit-scrollbar-thumb {
    border-radius: 15px;
    background: #535353;

    &:hover {
        background: #616161;
    }
}
</style>
