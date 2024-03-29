<template>
    <div id="app">
        <v-app :class="{'mobile': isMobileLayout}">
            <toolbar v-if="isMobileLayout"></toolbar>
            <desktop-menu v-else :scrolled="scrollOffset > 0"></desktop-menu>

            <div class="body-page">
                <sidebar v-if="isMobileLayout"></sidebar>
                <movie-player></movie-player>
                <movie-dialog v-model="$store.state.movieDialog.visible" :movie="$store.state.movieDialog.movie"></movie-dialog>

                <keep-alive>
                    <router-view @scroll.native="scrollOffset = $event.target.scrollTop"></router-view>
                </keep-alive>
            </div>
        </v-app>
    </div>
</template>

<script>
import Toolbar from "@/layouts/Toolbar.vue";
import Sidebar from "@/layouts/Sidebar.vue";
import MoviePlayer from "@/layouts/MoviePlayer.vue";
import MovieDialog from "@/components/MovieDialog.vue";
import DesktopMenu from "@/layouts/DesktopMenu.vue";

export default {
    name: 'App',
    components: {DesktopMenu, MovieDialog, MoviePlayer, Sidebar, Toolbar},
    data() {
        return {
            scrollOffset: 0
        }
    },
    async created() {
        this.$store.commit('updateLayout');
        window.addEventListener('resize', async () => {
            this.$store.commit('updateLayout');
        });

        this.$nextTick(() => {
            document.querySelector('main').addEventListener('scroll', event => {
                this.scrollOffset = event.target.scrollTop;
            });
        });

        this.$store.dispatch('loadGoogleAuthApi').then(() => this.$store.dispatch('getCurrentUser'));
        await this.$store.dispatch('loadFolders');
        await this.$store.dispatch('loadMovies');
        await this.$store.dispatch('loadGenres');
        await this.$store.dispatch('getTotalUsage');
    },
    watch: {
        '$route.name'() {
            this.$nextTick(() => {
                this.scrollOffset = document.querySelector('main').scrollTop;
            });
        }
    }
}
</script>

<style lang="scss">
html, body {
    overflow: auto !important;
    --preview-width: 200px;
    --preview-height: 300px;
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
        --preview-height: calc(40vw * 1.5);
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

    .v-main {
        overflow-x: hidden;
    }

    .v-main__wrap {
        max-height: 100%;
    }
}

.mobile {
    *::-webkit-scrollbar {
        width: 4px;
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
