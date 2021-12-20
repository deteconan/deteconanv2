<template>
    <v-app-bar fixed app flat :style="headerStyle" class="desktop-menu">
        <div class="d-flex align-center w-100 px-5">
            <v-toolbar-title v-if="!isMobileLayout" class="font-weight-bold text-spaced-xl">
                <span>FLE</span>
                <span class="text-primary">X</span>
            </v-toolbar-title>

            <span class="nav-links pl-10">
                <v-btn v-for="(link, index) in links" :key="index" :to="link.to" text :ripple="false" color="white">{{ link.title }}</v-btn>
            </span>

            <v-spacer></v-spacer>

            <v-autocomplete @input="onSelectMovie" :search-input.sync="search" :items="searchItems" item-text="name"
                            return-object solo dense flat clearable hide-details hide-no-data prepend-inner-icon="search"
                            label="Rechercher dans mes films" class="search mr-3"></v-autocomplete>

            <v-btn v-if="isAdmin && $route.fullPath !== '/upload'" color="white" to="/upload" text outlined>
                <v-icon>backup</v-icon>
                <span class="text-none ml-2">Upload</span>
            </v-btn>

            <v-btn v-else-if="!user" @click.stop="$store.dispatch('login')" color="white" text outlined>
                <v-avatar color="white" size="20">
                    <v-img src="https://img-authors.flaticon.com/google.jpg"></v-img>
                </v-avatar>
                <span class="text-none ml-2">Se connecter</span>
            </v-btn>

            <v-menu v-if="user" bottom offset-y rounded min-width="200px" :position-y="70" absolute transition="slide-y-transition">
                <template #activator="{ on }">
                    <v-btn icon rounded x-large v-on="on" class="ml-5 mr-0">
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
        </div>
    </v-app-bar>
</template>

<script>
export default {
    name: "DesktopMenu",
    props: {
        scrolled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            links: [
                { title: 'Accueil', to: '/' },
                { title: 'Bibliothèque', to: '/library' }
            ],
            search: ''
        }
    },
    computed: {
        headerStyle() {
            return {
                'background': this.scrolled ? 'var(--v-dark-darken1)' : 'transparent'
            };
        },
        searchItems() {
            if (!this.search)
                return [];

            return this.movies.filter(movie => {
                return movie.name.toLowerCase().includes(this.search.toLowerCase());
            });
        }
    },
    methods: {
        onSelectMovie(movie) {
            if (movie)
                return this.playMovie(movie);
        }
    }
}
</script>

<style lang="scss">
.desktop-menu {
    user-select: none;
    height: var(--toolbar-size);

    .nav-links {
        display: flex;
        align-items: center;

        a {
            letter-spacing: .5px;
            text-transform: none;

            .v-btn__content {
                font-size: 1rem;
                font-weight: 400;
                opacity: 0.7;
                transition: 150ms ease;
            }

            &:hover .v-btn__content {
                opacity: 0.5;
            }

            &:before {
                content: none;
            }

            &.v-btn--active {
                .v-btn__content {
                    font-weight: 500;
                    opacity: 1;
                }
            }
        }
    }

    .search {
        max-width: 350px !important;

        .v-input__control {
            min-height: 36px !important;

            .v-input__slot {
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        }

        input::placeholder {
            letter-spacing: 0.5px !important;
        }

        .v-input__control, .v-input__slot {
            background-color: transparent !important;
            backdrop-filter: blur(5px);
        }
    }
}
</style>
