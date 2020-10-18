<template>
    <v-navigation-drawer class="menu" dark width="100%" permanent>
        <v-list-item-group id="menu">
            <v-list-item link inactive :ripple="false" class="pt-5" style="pointer-events: none">
                <v-list-item-icon style="visibility: hidden">
                    <v-icon class="material-icons-outlined">home</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title></v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item @click="updateTab('/')" :ripple="false" inactive :class="{ 'tab-active': tabSelected === '/' }">
                <v-list-item-icon>
                    <v-icon v-if="false" class="material-icons-outlined">home</v-icon>
                    <img class="icon" :src="require('../assets/svg/home.svg')">
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>Accueil</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item @click="updateTab('/series')" :ripple="false" inactive :class="{ 'tab-active': tabSelected === '/series' }">
                <v-list-item-icon>
                    <v-icon v-if="false">slideshow</v-icon>
                    <img class="icon" :src="require('../assets/svg/video.svg')">
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>Séries</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item @click="updateTab('/dashboard')" :ripple="false" inactive :class="{ 'tab-active': tabSelected === '/dashboard' }">
                <v-list-item-icon>
                    <v-icon class="material-icons-outlined" v-if="false">dashboard</v-icon>
                    <img class="icon" :src="require('../assets/svg/dashboard.svg')">
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>Administration</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item link inactive :ripple="false" class="pt-3" style="pointer-events: none">
                <v-list-item-icon style="visibility: hidden">
                    <v-icon class="material-icons-outlined">home</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title></v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list-item-group>

        <div class="footer"></div>
    </v-navigation-drawer>
</template>

<script>
    export default {
        name: "Menu",
        data() {
            return {
                tabSelected: '/'
            }
        },
        async created() {
            await this.updateTab();
        },
        mounted() {
            this.tabSelected = this.$route.path;
        },
        methods: {
            async updateTab(url) {
                let elements = document.getElementsByClassName('v-list-item');

                if (url) {
                    this.tabSelected = url;
                    this.reach(url);
                }

                await this.$nextTick();
                await this.$nextTick();

                await elements.forEach(e => {
                    e.classList.remove('tab-prev-active');
                    e.classList.remove('tab-next-active');
                });

                await elements.forEach((e, i) => {
                    if (e.classList.contains('tab-active')) {
                        elements[i-1].classList.add('tab-prev-active');
                        elements[i+1].classList.add('tab-next-active');
                    }
                });

                this.$forceUpdate();
            }
        }
    }
</script>

<style lang="scss" scoped>
    .menu {
        background: transparent !important;
        transform: none !important;
        will-change: auto !important;
        height: 100%;
        border-top-right-radius: 40px;
        display: inline !important;

        .tab-prev-active {
            border-top-right-radius: 0 !important;
            border-bottom-right-radius: 40px !important;
        }

        .tab-next-active {
            border-top-right-radius: 40px !important;
            border-bottom-right-radius: 0 !important;
        }

        .v-list {
            padding: 0;
        }

        .v-list-item {
            cursor: pointer;
            padding-left: 2em !important;
            // transition: background 800ms ease !important;

            &:not(.tab-active) {
                background: linear-gradient(90deg, #202442 0%, #202442 100%);
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
            }

            &.tab-active {
                background: linear-gradient(90deg, #202442 20%, #25294a 100%);

                .v-list-item__title {
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.7) !important;
                }

                i {
                    color: #c94d1a !important;
                }

                .icon {
                    filter: invert(29%) sepia(66%) saturate(1792%) hue-rotate(355deg) brightness(101%) contrast(87%);
                }
            }

            .icon {
                width: 26px;
                height: 26px;
                color: red;
                filter: invert(35%) sepia(50%) saturate(418%) hue-rotate(194deg) brightness(91%) contrast(83%);
                transition: 300ms ease;
            }
        }

        .v-list-item__title {
            color: #585e8e !important;
            font-weight: 500;
            font-size: 12pt;
            transition: color 300ms ease;
        }

        i {
            color: #585e8e !important;
            font-size: 20pt;
            transition: color 300ms ease;
        }

        .footer {
            height: 100%;
            background: #202442;
        }
    }
</style>
