<template>
    <div style="display: contents">
        <v-card class="minimized" v-if="playingMovie" elevation="15" @click.stop="togglePlayer">
            <img :src="playingMovie.image | tmdbPoster" style="border-radius: 3px">
            <div class="resume">
                <v-btn class="position-absolute" style="top: 5px; right: 5px;" icon @click.stop="$store.commit('setMovie', null)">
                    <v-icon>close</v-icon>
                </v-btn>

                <v-icon>play_arrow</v-icon>
                <span class="ml-1">Reprendre</span>
            </div>
        </v-card>
        <v-bottom-sheet :value="playerVisible" fullscreen>
            <v-sheet class="d-flex flex-column" height="100%" v-if="playingMovie">
                <div class="black d-flex align-center px-5" style="height: 58px">
                    <v-btn @click.stop="togglePlayer" icon>
                        <v-icon>expand_more</v-icon>
                    </v-btn>

                    <h3 class="opacity-80 text-spaced f-500 mx-auto">{{ playingMovie.name }}</h3>

<!--                    <v-btn icon @click.stop="window.open('https://chrome.google.com/webstore/detail/substital-add-subtitles-t/kkkbiiikppgjdiebcabomlbidfodipjg')">-->
<!--                        <v-icon class="material-icons-outlined">subtitles</v-icon>-->
<!--                    </v-btn>-->
                </div>
                <div class="flex-grow-1 position-relative">
                    <div class="iframe-container">
<!--                        <video v-if="!fallback && isMobileLayout" :src="url" @error="fallback = true" controls autoplay class="video-player"></video>-->
                        <video-player v-if="!fallback" :src="url" :subtitle-src="subtitleUrl" :cast-options="castOptions" @error="fallback = true" @delay-subtitle="subtitleDelay = $event" class="video-player"></video-player>
                        <iframe v-else :src="driveUrl" allowfullscreen style="border: 0"></iframe>
                    </div>
                </div>
            </v-sheet>
        </v-bottom-sheet>
    </div>
</template>

<script>
    import VideoPlayer from "@/components/VideoPlayer.vue";
    import {tmdbPosterHD} from "@/filters.js";

    export default {
        name: "MoviePlayer",
        components: {VideoPlayer},
        data() {
            return {
                fallback: false,
                subtitleDelay: 0
            }
        },
        computed: {
            url() {
                return `${process.env.VUE_APP_API_URL}/api/movie/stream/${this.playingMovie.id}`;
            },
            subtitleUrl() {
                return `${process.env.VUE_APP_API_URL}/api/movie/subtitle/${this.playingMovie.imdbId}?offset=${this.subtitleDelay}`;
            },
            driveUrl() {
                return `https://drive.google.com/file/d/${this.playingMovie.id}/preview`;
            },
            castOptions() {
                return {
                    title: this.playingMovie.name,
                    image: tmdbPosterHD(this.playingMovie.image),
                    releaseDate: this.playingMovie.release_date
                };
            }
        },
        watch: {
            playingMovie: {
                deep: true,
                handler() {
                    this.fallback = false;
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .minimized {
        position: absolute;
        bottom: 15px;
        left: 15px;
        width: 190px;
        height: calc(190px * 1.5);
        z-index: 1;
        cursor: pointer;
        user-select: none;

        &:hover {
            .resume {
                opacity: 1;
            }
        }

        img {
            width: 100%;
            height: 100%;
        }

        .resume {
            opacity: 0;
            transition: 300ms ease;
            background: rgba(0, 0, 0, 0.6);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .iframe-container {
        background: rgba(0, 0, 0, 0.5);

        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
        }

        iframe, .video-player {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
        }
    }
</style>
