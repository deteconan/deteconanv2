<template>
    <v-app-bar fixed app flat height="64px">
        <v-app-bar-nav-icon v-if="!searchMode" @click.stop="$store.commit('toggleSidebar')"></v-app-bar-nav-icon>

        <v-btn v-if="searchMode" @click.stop="toggleSearchMode" class="mr-1" icon>
            <v-icon>arrow_back</v-icon>
        </v-btn>

        <v-toolbar-title v-else-if="!searchMode" class="text-capitalize">{{ $route.name }}</v-toolbar-title>

        <v-spacer v-if="!searchMode"></v-spacer>

        <v-text-field ref="search" v-show="searchMode" class="search" dense
                      prepend-inner-icon="search" v-model="search" @keypress.13="searchMovie" placeholder="Rechercher un film"
                      solo flat hide-details single-line clearable @click:clear="clearSearch" autocomplete="off"></v-text-field>

        <v-btn v-if="!searchMode && $route.fullPath !== '/upload'" @click.stop="toggleSearchMode" class="ml-3" icon>
            <v-icon>search</v-icon>
        </v-btn>
    </v-app-bar>
</template>

<script>
    export default {
        name: "Toolbar",
        data() {
            return {
                search: null,
                searchMode: false
            }
        },
        methods: {
            searchMovie() {
                this.$store.commit('searchMovie', this.search);
            },
            clearSearch() {
                this.$store.commit('searchMovie', '');
            },
            toggleSearchMode() {
                this.searchMode = !this.searchMode;

                if (this.searchMode) {
                    this.$nextTick(() => {
                        this.$refs.search.focus();
                    });
                }
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
