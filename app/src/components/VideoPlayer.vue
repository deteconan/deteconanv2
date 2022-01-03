<template>
    <div @mousemove="onMouseMove" class="video-container" :style="cursorStyle">
        <video ref="video" @click.stop="onClickVideo" @loadeddata="onLoad" @timeupdate="onTimeUpdate"
               crossorigin="anonymous"
               @play="playing = true" @pause="playing = false" @error="$emit('error', $event)" autoplay :muted="muted">
            <source :src="src" type="video/mp4">
            <track v-if="subtitleSrc && subtitleVisible" :src="subtitleSrc" @load="onSubtitleLoad" label="Français"
                   srclang="fr" kind="subtitles" default>
        </video>

        <transition name="slide-fade" duration="150">
            <div v-if="cursorVisible" @mouseenter="hasFocus = true" @mouseleave="hasFocus = false" class="controls">
                <div class="slider-container">
                    <v-slider :value="currentTime" @change="seek" @start="seeking = true" @end="seeking = false"
                              :min="0"
                              :max="duration" dense hide-details></v-slider>
                    <div class="ml-2" style="width: 60px">{{ remainingTime }}</div>
                </div>

                <div class="buttons">
                    <v-btn @click.stop="togglePlaying" icon :ripple="false" class="mr-lg-3">
                        <v-icon v-if="!playing" size="60" class="material-icons-round">play_arrow</v-icon>
                        <v-icon v-else size="50" class="material-icons-round">pause</v-icon>
                    </v-btn>

                    <v-btn v-if="!isMobileLayout" @click.stop="jump(-10)" icon :ripple="false">
                        <v-icon size="50" class="material-icons-round">replay_10</v-icon>
                    </v-btn>

                    <v-btn v-if="!isMobileLayout" @click.stop="jump(10)" icon :ripple="false">
                        <v-icon size="50" class="material-icons-round">forward_10</v-icon>
                    </v-btn>

                    <v-hover v-if="!isMobileLayout" v-slot="{ hover: hoverBtn }" close-delay="300" class="ml-lg-3">
                        <div>
                            <v-btn @click.stop="toggleMute" icon :ripple="false">
                                <v-icon v-if="muted" size="50" class="material-icons-round">volume_off</v-icon>
                                <v-icon v-else size="50" class="material-icons-round">volume_down</v-icon>
                            </v-btn>

                            <v-hover v-slot="{ hover: hoverSlider }" close-delay="300" class="volume-slider">
                                <v-slider v-show="hoverBtn || hoverSlider" :value="currentVolume" hide-details dense
                                          @input="setVolume" vertical color="white" class="px-5"></v-slider>
                            </v-hover>
                        </div>
                    </v-hover>

                    <v-spacer></v-spacer>

                    <v-btn v-if="subtitleVisible" @click.stop="delayDialog.visible = true" icon :ripple="false">
                        <v-icon size="40" class="material-icons-round">history</v-icon>
                    </v-btn>

                    <v-btn @click.stop="toggleSubtitle" icon :ripple="false">
                        <v-icon v-if="!subtitleVisible" size="40" class="material-icons-round">subtitles_off</v-icon>
                        <v-icon v-else size="40" class="material-icons-round">subtitles</v-icon>
                    </v-btn>

                    <v-btn v-if="castAvailable" @click.stop="cast" icon :ripple="false">
                        <v-icon size="40" :color="castSession() ? 'primary' : 'white'">cast</v-icon>
                    </v-btn>

                    <v-btn @click.stop="toggleFullscreen" icon :ripple="false">
                        <v-icon v-if="!fullscreen" size="55" class="material-icons-round">fullscreen</v-icon>
                        <v-icon v-else size="55" class="material-icons-round">fullscreen_exit</v-icon>
                    </v-btn>
                </div>
            </div>
        </transition>

        <v-dialog v-model="delayDialog.visible" width="300" persistent content-class="delay-dialog">
            <v-card color="dark darken-1" class="position-relative">
                <v-btn @click.stop="delayDialog.visible = false" icon class="position-absolute"
                       style="top: 5px; right: 5px;">
                    <v-icon>close</v-icon>
                </v-btn>

                <v-card-title class="justify-center">Délai des sous-titres</v-card-title>

                <v-card-text class="pb-5">
                    <div class="title text-primary font-weight-bold text-center mb-3">{{ delayDialog.value }} ms</div>
                    <div class="grid-2">
                        <v-btn @click.stop="delaySubtitle(-100)" :loading="delayDialog.loading"
                               class="text-none">- 100 ms
                        </v-btn>
                        <v-btn @click.stop="delaySubtitle(100)" :loading="delayDialog.loading"
                               class="text-none">+ 100 ms
                        </v-btn>

                        <v-btn @click.stop="delaySubtitle(-500)" :loading="delayDialog.loading"
                               class="text-none">- 500 ms
                        </v-btn>
                        <v-btn @click.stop="delaySubtitle(500)" :loading="delayDialog.loading"
                               class="text-none">+ 500 ms
                        </v-btn>

                        <v-btn @click.stop="delaySubtitle(-1000)" :loading="delayDialog.loading"
                               class="text-none">- 1 s
                        </v-btn>
                        <v-btn @click.stop="delaySubtitle(1000)" :loading="delayDialog.loading"
                               class="text-none">+ 1 s
                        </v-btn>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: "VideoPlayer",
    props: {
        src: {
            type: String
        },
        subtitleSrc: {
            type: String
        },
        castOptions: {
            type: Object,
            default: () => ({
                title: null,
                image: null,
                releaseDate: null
            })
        }
    },
    data() {
        return {
            playing: true,
            duration: 100,
            currentTime: 0,
            muted: false,
            volume: 0,
            seeking: false,
            fullscreen: false,
            cursorVisible: true,
            mouseTimeout: null,
            subtitleVisible: false,
            delayDialog: {
                visible: false,
                value: 0,
                loading: false
            },
            hasFocus: false,
            castAvailable: false,
            castPlayer: null,
            castRemoteController: null
        }
    },
    computed: {
        remainingTime() {
            return this.$moment().startOf('day').add({second: this.duration - this.currentTime}).format('HH:mm:ss');
        },
        currentVolume() {
            return this.muted ? 0 : this.volume;
        },
        cursorStyle() {
            return {
                'cursor': this.cursorVisible ? 'default' : 'none'
            };
        }
    },
    created() {
        try {
            this.castAvailable = !!window.cast.framework.CastContext.getInstance();
            this.castPlayer = new window.cast.framework.RemotePlayer()
            this.castRemoteController = new window.cast.framework.RemotePlayerController(this.castPlayer);

            this.castRemoteController.addEventListener(window.cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED, () => {
                this.playing = !this.castPlayer.isPaused;
            });

            this.castRemoteController.addEventListener(window.cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, () => {
                this.currentTime = this.castPlayer.currentTime;
            });
        } catch {
            this.castAvailable = false;
        }
    },
    methods: {
        onLoad() {
            if (!this.isMobileLayout)
                this.setVolume(10);

            if (this.$refs.video) {
                this.duration = this.$refs.video.duration;
            }
        },
        onTimeUpdate() {
            if (!this.seeking && this.$refs.video)
                this.currentTime = this.$refs.video.currentTime;
        },
        onMouseMove() {
            if (this.isMobileLayout)
                return;

            this.cursorVisible = true;
            clearTimeout(this.mouseTimeout);

            this.mouseTimeout = setTimeout(() => {
                if (!this.hasFocus)
                    this.cursorVisible = false;
            }, 3000);
        },
        onSubtitleLoad() {
            const track = this.$refs.video.textTracks[0];

            if (track)
                track.mode = 'showing';
        },
        onClickVideo() {
            if (!this.isMobileLayout) {
                this.togglePlaying();
            } else {
                this.cursorVisible = !this.cursorVisible;
            }
        },
        togglePlaying() {
            if (this.castSession()) {
                this.castRemoteController.playOrPause();
            } else {
                if (this.$refs.video) {
                    if (this.playing)
                        this.$refs.video.pause();
                    else
                        this.$refs.video.play();
                }
            }
        },
        seek(time) {
            if (this.castSession()) {
                this.castPlayer.currentTime = time;
                this.castRemoteController.seek();
            } else {
                if (this.$refs.video)
                    this.$refs.video.currentTime = time;
            }
        },
        toggleMute() {
            if (this.$refs.video) {
                this.muted = !this.muted;
                this.$refs.video.muted = this.muted;
            }
        },
        setVolume(volume) {
            if (this.$refs.video) {
                this.volume = volume;
                this.$refs.video.volume = this.volume / 100;
                this.muted = this.volume === 0;
            }
        },
        jump(step) {
            if (this.castSession()) {
                this.castPlayer.currentTime += step;
                this.castRemoteController.seek();
            } else {
                if (this.$refs.video)
                    this.$refs.video.currentTime += step;
            }
        },
        async toggleFullscreen() {
            if (!this.fullscreen) {
                if (this.$el.requestFullscreen) {
                    await this.$el.requestFullscreen();
                } else if (this.$el.webkitRequestFullscreen) { /* Safari */
                    await this.$el.webkitRequestFullscreen();
                } else if (this.$el.msRequestFullscreen) { /* IE11 */
                    await this.$el.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    await document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    await document.msExitFullscreen();
                }
            }

            this.fullscreen = !this.fullscreen;
        },
        toggleSubtitle() {
            this.subtitleVisible = !this.subtitleVisible;

            if (this.castSession()) {
                const activeTrackIds = [];

                if (this.subtitleVisible)
                    activeTrackIds.push(1);

                const tracksInfoRequest = new window.chrome.cast.media.EditTracksInfoRequest(activeTrackIds);
                this.castSession().getMediaSession().editTracksInfo(tracksInfoRequest);
            }
        },
        delaySubtitle(delayInMs) {
            this.delayDialog.value += delayInMs;
        },
        castSession() {
            return window.cast.framework.CastContext.getInstance().getCurrentSession();
        },
        cast() {
            if (!this.castAvailable)
                return Promise.resolve();

            window.cast.framework.CastContext.getInstance().setOptions({
                receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
            });

            return window.cast.framework.CastContext.getInstance().requestSession()
                .then(() => {
                    const mediaInfo = new window.chrome.cast.media.MediaInfo(this.src, 'video/mp4');
                    const mediaMetaData = new window.chrome.cast.media.MovieMediaMetadata();
                    mediaMetaData.images = this.castOptions.image ? [new window.chrome.cast.Image(this.castOptions.image)] : null;
                    mediaMetaData.title = this.castOptions.title;
                    mediaMetaData.releaseDate = this.castOptions.releaseDate ? this.$moment(this.castOptions.releaseDate).format('YYYY-DD-MM') : null;

                    // Add subtitles
                    const subtitle = new window.chrome.cast.media.Track(1, window.chrome.cast.media.TrackType.TEXT);
                    subtitle.subtype = window.chrome.cast.media.TextTrackType.SUBTITLES;
                    subtitle.trackContentId = this.subtitleSrc;
                    subtitle.trackContentType = 'text/vtt';
                    mediaInfo.textTrackStyle = new window.chrome.cast.media.TextTrackStyle();
                    mediaInfo.tracks = [subtitle];

                    mediaInfo.metadata = mediaMetaData;
                    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
                    const session = this.castSession();

                    return session.loadMedia(request)
                        .then(() => {
                            // Load subtitles
                            const tracksInfoRequest = new window.chrome.cast.media.EditTracksInfoRequest([1]);
                            session.getMediaSession().editTracksInfo(tracksInfoRequest);
                        })
                        .catch(err => console.error(err));
                })
                .catch(err => {
                    console.error(err);
                });
        }
    },
    watch: {
        src() {
            if (!this.$refs.video)
                return;

            this.delayDialog.value = 0;
            const track = this.$refs.video.textTracks[0];
            if (track)
                track.mode = 'hidden';
            this.$refs.video.load();
        },
        'delayDialog.value'(val) {
            this.$emit('delay-subtitle', val);
        }
    }
}
</script>

<style lang="scss">
.delay-dialog {
    .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
    }
}

.video-container {
    position: relative;
    background: black;

    video {
        width: 100%;
        height: 100%;

        &::-webkit-media-text-track-container {
            transform: translateY(-50px);
        }
    }

    .slide-fade-enter-active {
        transition: all 150ms ease;
    }

    .slide-fade-leave-active {
        transition: all 150ms cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }

    .slide-fade-enter, .slide-fade-leave-to {
        transform: translateY(100%);
        opacity: 0;
    }

    .controls {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        animation: translateY 150ms ease;

        .slider-container {
            display: flex;
            align-items: center;
            padding: 0 2rem;

            .v-slider {
                cursor: pointer !important;

                .v-slider__track-container {
                    height: 4px;
                }
            }
        }

        .buttons {
            display: flex;
            align-items: center;
            gap: 2.5rem;
            padding: 1rem 2rem 2rem 2rem;

            button::before {
                content: none;
            }

            i {
                transition: transform 150ms ease;

                &:hover {
                    transform: scale(1.3);

                    &:active {
                        transform: scale(1.1);
                    }
                }
            }

            .volume-slider {
                position: absolute;
                top: -150px;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(3px);
                padding: 0.5rem 1rem;
                border-radius: 8px;

                .v-slider {
                    cursor: pointer !important;

                    .v-slider__track-container {
                        width: 5px;

                        .v-slider__track-background {
                            border-radius: 3px;
                        }
                    }
                }
            }

            .subtitle-delay {
                position: absolute;
                top: -70px;
                left: -30px;
                min-width: 100px;
            }
        }
    }
}

.mobile {
    .controls {
        .slider-container {
            padding: 0 1rem;
            margin-bottom: 0.5rem;
        }

        .buttons {
            gap: 2rem;
            padding: 0.5rem 1rem 1rem 1rem;

            i {
                &:hover {
                    transform: none;

                    &:active {
                        transform: none;
                    }
                }
            }
        }
    }
}
</style>
