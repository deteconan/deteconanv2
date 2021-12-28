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
                <div class="dark d-flex align-center px-5" style="height: 58px">
                    <v-btn @click.stop="togglePlayer" icon>
                        <v-icon>expand_more</v-icon>
                    </v-btn>

                    <h3 class="ml-5 opacity-80 text-spaced f-500">{{ playingMovie.name }}</h3>

                    <v-btn class="ml-auto" icon @click.stop="window.open('https://chrome.google.com/webstore/detail/substital-add-subtitles-t/kkkbiiikppgjdiebcabomlbidfodipjg')">
                        <v-icon class="material-icons-outlined">subtitles</v-icon>
                    </v-btn>

                    <v-btn v-if="!fallback && castAvailable" @click.stop="cast" icon class="ml-2">
                        <v-icon size="22">cast</v-icon>
                    </v-btn>
                </div>
                <div class="flex-grow-1 position-relative">
                    <div class="iframe-container">
                        <video v-if="!fallback && isMobileLayout" :src="url" @error="fallback = true" controls autoplay class="video-player"></video>
                        <video-player v-else-if="!fallback" :src="url" @error="fallback = true" class="video-player"></video-player>
                        <iframe v-else :src="driveUrl" allowfullscreen style="border: 0"></iframe>
<!--                        <v-progress-circular class="loading" indeterminate></v-progress-circular>-->
                    </div>
                </div>
            </v-sheet>
        </v-bottom-sheet>
    </div>
</template>

<script>
    import VideoPlayer from "@/components/VideoPlayer.vue";

    export default {
        name: "MoviePlayer",
        // eslint-disable-next-line vue/no-unused-components
        components: {VideoPlayer},
        data() {
            return {
                fallback: false,
                castAvailable: false
            }
        },
        computed: {
            url() {
                return `${process.env.VUE_APP_API_URL}/api/movie/stream/${this.playingMovie.id}`;
            },
            driveUrl() {
                return `https://drive.google.com/file/d/${this.playingMovie.id}/preview`;
            }
        },
        mounted() {
            window['__onGCastApiAvailable'] = isAvailable => {
                this.castAvailable = isAvailable;

                if (this.castAvailable) {
                    window.cast.framework.CastContext.getInstance().setOptions({
                        receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
                    });
                }
            };
        },
        methods: {
            castSession() {
                return window.cast.framework.CastContext.getInstance().getCurrentSession()
            },
            async cast() {
                if (!this.castSession()) {
                    try {
                        await window.cast.framework.CastContext.getInstance().requestSession();
                    } catch {
                        return;
                    }
                }

                const mediaInfo = new window.chrome.cast.media.MediaInfo(this.url, 'video/mp4');
                const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
                const session = this.castSession();

                return session.loadMedia(request)
                    .catch(err => console.error(err));
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
