<template>
    <div @mousemove="onMouseMove" class="video-container" :style="cursorStyle">
        <video ref="video" @click.stop="togglePlaying" @loadeddata="onLoad" @timeupdate="onTimeUpdate"
               @play="playing = true" @pause="playing = false" @error="$emit('error', $event)" :src="src" autoplay :muted="muted"></video>

        <div v-if="cursorVisible" class="controls">
            <div class="slider-container">
                <v-slider :value="currentTime" @change="seek" @start="seeking = true" @end="seeking = false" :min="0"
                          :max="duration" dense hide-details></v-slider>
                <div class="ml-2" style="width: 60px">{{ remainingTime }}</div>
            </div>

            <div class="buttons">
                <v-btn @click.stop="togglePlaying" icon :ripple="false" class="mr-3">
                    <v-icon v-if="!playing" size="60" class="material-icons-round">play_arrow</v-icon>
                    <v-icon v-else size="50" class="material-icons-round">pause</v-icon>
                </v-btn>

                <v-btn @click.stop="jump(-10)" icon :ripple="false">
                    <v-icon size="50" class="material-icons-round">replay_10</v-icon>
                </v-btn>

                <v-btn @click.stop="jump(10)" icon :ripple="false">
                    <v-icon size="50" class="material-icons-round">forward_10</v-icon>
                </v-btn>

                <v-hover v-slot="{ hover: hoverBtn }" close-delay="300" class="ml-3">
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

                <v-btn @click.stop="toggleFullscreen" icon :ripple="false">
                    <v-icon v-if="!fullscreen" size="60" class="material-icons-round">fullscreen</v-icon>
                    <v-icon v-else size="60" class="material-icons-round">fullscreen_exit</v-icon>
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "VideoPlayer",
    props: {
        src: {
            type: String
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
            mouseTimeout: null
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
    methods: {
        onLoad() {
            this.setVolume(10);

            if (this.$refs.video)
                this.duration = this.$refs.video.duration;
        },
        onTimeUpdate() {
            if (!this.seeking && this.$refs.video)
                this.currentTime = this.$refs.video.currentTime;
        },
        onMouseMove() {
            this.cursorVisible = true;
            clearTimeout(this.mouseTimeout);

            this.mouseTimeout = setTimeout(() => {
                this.cursorVisible = false;
            }, 3000);
        },
        togglePlaying() {
            if (this.$refs.video) {
                if (this.playing)
                    this.$refs.video.pause();
                else
                    this.$refs.video.play();
            }
        },
        seek(time) {
            if (this.$refs.video)
                this.$refs.video.currentTime = time;
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
            if (this.$refs.video)
                this.$refs.video.currentTime += step;
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
        }
    }
}
</script>

<style lang="scss">
.video-container {
    position: relative;
    background: black;

    video {
        width: 100%;
        height: 100%;
    }

    .controls {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;

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
        }
    }
}
</style>
