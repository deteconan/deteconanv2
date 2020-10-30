<template>
    <v-navigation-drawer permanent :mini-variant="!sidebarVisible" width="220px">
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
        </v-list>
    </v-navigation-drawer>
</template>

<script>
    export default {
        name: "Sidebar"
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
</style>

<style lang="scss" scoped>

</style>
