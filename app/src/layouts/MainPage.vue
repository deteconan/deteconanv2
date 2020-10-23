<template>
    <v-main class="pt-0 main-page" :class="{'sidebar-visible': sidebarVisible}">
        <slot></slot>
    </v-main>
</template>

<script>
    export default {
        name: "MainPage"
    }
</script>

<style lang="scss" scoped>
    .main-page {
        position: relative;
        overflow: auto;
        width: calc(100% - 56px);
        animation: scrollY 300ms ease;

        &.sidebar-visible {
            width: calc(100% - 220px);
        }
    }

    @keyframes scrollY {
        0%   {
            opacity: 0;
            transform: translateY(-15px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
