<template>
    <v-navigation-drawer :value="sidebarVisible" @input="$store.commit('toggleSidebar', $event)" :permanent="!isMobileLayout" :mini-variant="!isMobileLayout && !sidebarVisible"
                         width="100%" touchless :absolute="isMobileLayout">
        <v-list>
            <v-list-item to="/" link>
                <v-list-item-icon>
                    <v-icon>home</v-icon>
                </v-list-item-icon>
                <v-list-item-content>Accueil</v-list-item-content>
            </v-list-item>
            <v-list-item to="/movies" link>
                <v-list-item-icon>
                    <v-icon class="material-icons-outlined">theaters</v-icon>
                </v-list-item-icon>
                <v-list-item-content>Films</v-list-item-content>
            </v-list-item>
            <v-list-item v-if="!isMobileLayout" to="/library" link>
                <v-list-item-icon>
                    <v-icon class="material-icons-outlined">video_library</v-icon>
                </v-list-item-icon>
                <v-list-item-content>Bibliothèque</v-list-item-content>
            </v-list-item>
            <v-list-item v-if="isMobileLayout && isAdmin" to="/upload" link>
                <v-list-item-icon>
                    <v-icon class="material-icons-outlined">backup</v-icon>
                </v-list-item-icon>
                <v-list-item-content>Upload</v-list-item-content>
            </v-list-item>
        </v-list>

        <template #append>
            <div v-if="isMobileLayout" class="pa-2">
                <v-btn v-if="user" @click.stop="logout" color="error" block text large>
                    <v-icon class="mr-1">logout</v-icon>
                    <span class="font-weight-bold">Se déconnecter</span>
                </v-btn>

                <v-btn v-else @click.stop="login" color="blue" block large>
                    <v-avatar color="white" size="25" class="mr-2">
                        <v-img src="https://img-authors.flaticon.com/google.jpg"></v-img>
                    </v-avatar>
                    <span class="font-weight-bold">Se connecter</span>
                </v-btn>
            </div>
        </template>
    </v-navigation-drawer>
</template>

<script>
    export default {
        name: "Sidebar",
        async mounted() {
            await this.$nextTick();
            if (this.isMobileLayout)
                this.$store.commit('toggleSidebar', false);
        },
        methods: {
            login() {
                this.$store.dispatch('login').then(() => {
                    this.$store.commit('toggleSidebar', false);
                });
            },
            logout() {
                this.$store.dispatch('logout').then(() => {
                    this.$store.commit('toggleSidebar', false);
                });
            }
        }
    }
</script>

<style lang="scss">
    .v-navigation-drawer {
        background: transparent !important;
        backdrop-filter: blur(30px) brightness(0.8);

        .v-navigation-drawer__content {
            // background: #272727;
            background: transparent;
        }
    }

    .mobile {
        .v-navigation-drawer {
            background: #2f2f2f !important;
            padding-top: var(--toolbar-size) !important;

            .v-navigation-drawer__content {
                background: inherit;
            }
        }
    }
</style>

<style lang="scss" scoped>

</style>
