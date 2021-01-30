<template>
    <v-app-bar fixed app flat height="64px">
        <v-app-bar-nav-icon @click.stop="toggleMainSidebar"></v-app-bar-nav-icon>

        <v-toolbar-title class="font-weight-bold" style="letter-spacing: 1px">
            <span>FLE</span>
            <span class="text-primary">X</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-text-field v-if="$route.fullPath !== '/upload'" class="search" prepend-inner-icon="search" v-model="search" @keypress.13="searchMovie" placeholder="Rechercher un film"
                      solo flat hide-details single-line clearable @click:clear="clearSearch" autocomplete="off"></v-text-field>

        <v-btn v-if="isAdmin && $route.fullPath !== '/upload'" color="primary" class="ml-5" to="/upload">
            <v-icon>backup</v-icon>
            <span class="ml-1">Upload</span>
        </v-btn>

        <v-btn v-if="!user" @click.stop="$store.dispatch('login')" color="blue" class="ml-3">
            <v-avatar color="white" size="25">
                <v-img src="https://img-authors.flaticon.com/google.jpg"></v-img>
            </v-avatar>
            <span class="ml-2">Se connecter</span>
        </v-btn>

        <v-menu v-else bottom offset-y rounded min-width="200px" :position-y="70" absolute transition="slide-y-transition">
            <template #activator="{ on }">
                <v-btn icon rounded x-large v-on="on" class="ml-3 mr-0">
                    <v-avatar size="40">
                        <v-img :src="user.avatar"></v-img>
                    </v-avatar>
                </v-btn>
            </template>
            <v-card>
                <v-list-item-content class="justify-center">
                    <div class="mx-auto text-center">
                        <h3>{{ user.name }}</h3>
                        <p class="caption mt-2">{{ user.email }}</p>
                        <v-divider class="my-3"></v-divider>
                        <v-btn @click.stop="$store.dispatch('logout')" color="error" text>Se déconnecter</v-btn>
                    </div>
                </v-list-item-content>
            </v-card>
        </v-menu>
    </v-app-bar>
</template>

<script>
    // const google = {
    //     appId: '22198592066-5d2g6ruijvqt2ne5psd5hdhlbhq8dotd.apps.googleusercontent.com',
    //     redirectUri: `${window.origin}/auth/google`,
    //     state: 'flex'
    // };

    export default {
        name: "Toolbar",
        data() {
            return {
                search: null
            }
        },
        methods: {
            searchMovie() {
                this.$store.commit('searchMovie', this.search);
            },
            clearSearch() {
                this.$store.commit('searchMovie', '');
            }
        }
    }
</script>

<style lang="scss">
    header {
        .search {
            max-width: 500px !important;

            input::placeholder {
                letter-spacing: 0.5px !important;
            }

            .v-input__control, .v-input__slot {
                background-color: rgba(255, 255, 255, 0.05) !important;
            }
        }
    }
</style>
