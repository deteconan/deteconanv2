<template>
    <v-main class="pt-0 main-page" :class="{'sidebar-visible': sidebarVisible}">
        <v-overlay v-if="loading" :value="true" absolute color="transparent">
            <v-progress-circular color="primary" indeterminate size="65"></v-progress-circular>
        </v-overlay>
        <div v-else class="default" :class="{'h-100': isMobileLayout}">
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

    .mobile {
        .main-page {
            width: 100% !important;

            &.sidebar-visible {
                width: 100% !important;
            }
        }
    }

    .default {
        animation: scrollY 300ms ease;
        display: flex;
        flex-direction: column;
        height: 100%;
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
