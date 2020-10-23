<template>
    <v-app-bar fixed app flat height="64px">
        <v-app-bar-nav-icon @click.stop="toggleMainSidebar"></v-app-bar-nav-icon>

        <v-toolbar-title class="font-weight-bold" style="letter-spacing: 1px">
            <span>FLE</span>
            <span class="text-primary">X</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-text-field class="search" prepend-inner-icon="search" v-model="search" placeholder="Rechercher un film" solo flat hide-details single-line></v-text-field>

        <v-btn v-if="$route.fullPath !== '/upload'" color="primary" class="ml-5" to="/upload">
            <v-icon>backup</v-icon>
            <span class="ml-1">Upload</span>
        </v-btn>
    </v-app-bar>
</template>

<script>
    export default {
        name: "Toolbar",
        data() {
            return {
                search: null
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
