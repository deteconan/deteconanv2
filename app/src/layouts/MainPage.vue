<template>
    <v-main class="pt-0 main-page" :class="{'sidebar-visible': sidebarVisible}">
        <v-overlay v-if="loading" :value="true" absolute>
            <v-progress-circular color="primary" indeterminate></v-progress-circular>
        </v-overlay>
        <div v-else class="default">
            <slot></slot>
        </div>
    </v-main>
</template>

<script>
    export default {
        name: "MainPage",
        props: {
            loading: {
                type: Boolean,
                default: false
            }
        }
    }
</script>

<style lang="scss" scoped>
    .main-page {
        position: relative;
        overflow: auto;
        width: calc(100% - 56px);

        &.sidebar-visible {
            width: calc(100% - 220px);
        }
    }

    .default {
        animation: scrollY 300ms ease;
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
