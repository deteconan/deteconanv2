<template>
    <div @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" class="movie-preview" @click.stop="onClick" :class="{'preview-visible': previewVisible}">
        <v-img :src="movie.image | tmdbPoster" :alt="movie.name"></v-img>

        <transition name="fade-scale">
            <div v-if="previewVisible && !noTrailer" @click.stop="" class="overlay elevation-5">
                <div @click.stop="openMovieDialog" class="cursor-pointer border-inherit">
                    <aspect-ratio style="pointer-events: none">
                        <transition name="fade" class="border-inherit">
                            <div v-if="!loaded || trailerError" class="d-flex align-center justify-center border-inherit" v-bg-img="tmdbPoster(movie.image)" style="background-size: cover"></div>
                            <video v-else @error="onTrailerError" :src="trailer" autoplay width="100%" :muted="muted"></video>
                        </transition>
                        <!--                    <div v-else class="d-flex align-center justify-center" style="background: black">-->
                        <!--                        <span class="mr-1">{{ trailerError }}</span>-->
                        <!--                        <v-icon>sentiment_very_dissatisfied</v-icon>-->
                        <!--                    </div>-->
                    </aspect-ratio>
                </div>

                <div class="px-3 pt-2 pb-3 d-flex flex-column h-100">
                    <div class="d-flex">
                        <div class="mr-3">
                            <div class="name">{{ movie.name }}</div>
                            <v-rating :value="movie.rating / 2" background-color="orange lighten-3" color="orange" dense size="15" readonly></v-rating>
                        </div>
                        <v-btn @click.stop="playMovie(movie)" icon class="play-btn ml-auto" :class="{'downloaded': downloaded}">
                            <v-icon v-if="downloaded">play_arrow</v-icon>
                            <v-icon v-else>arrow_forward</v-icon>
                        </v-btn>
                    </div>
                    <small class="d-block mt-auto">{{ movieGenres }}</small>
                </div>

                <v-btn v-if="trailer" @click.stop="muted = !muted" icon class="mute-btn">
                    <v-icon v-if="muted">volume_off</v-icon>
                    <v-icon v-else>volume_mute</v-icon>
                </v-btn>
            </div>
        </transition>
    </div>
</template>

<script>
    import Network from "@/helpers/Network.js";
    import AspectRatio from "@/components/AspectRatio.vue";
    import { tmdbPoster } from "@/filters.js";

    export default {
        name: "MoviePreview",
        components: {AspectRatio},
        props: {
            movie: {
                type: Object,
                required: true
            },
            noTrailer: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                timeout: null,
                previewVisible: false,
                trailer: null,
                muted: false,
                loaded: false,
                trailerError: null,
                tmdbPoster
            }
        },
        computed: {
            downloaded() {
                return this.movies.find(m => +m.tmdbId === +this.movie.tmdbId);
            },
            movieGenres() {
                if (!this.genres.length)
                    return '';

                return this.genres.filter(g => this.movie.genre_ids.includes(g.id)).map(g => g.name).join(' ∙ ');
            }
        },
        activated() {
            this.reset();
        },
        deactivated() {
            this.reset();
        },
        methods: {
            reset() {
                clearTimeout(this.timeout);
                this.previewVisible = false;
                this.trailer = null;
                this.loaded = false;
                this.trailerError = null;
            },
            videoElement() {
                return this.$el.querySelector('video');
            },
            showPreview() {
                this.previewVisible = true;
                this.loaded = false;
                this.trailerError = null;

                return Network.get(`/movie/trailer/${this.movie.tmdbId}`, {
                    params: {
                        hd: false
                    }
                })
                .then(res => {
                    if (!this.previewVisible)
                        return;

                    this.trailer = res.data;

                    if (!this.trailer)
                        this.trailerError = 'Trailer indisponible';

                    this.loaded = true;
                    this.$nextTick(async () => {
                        if (this.videoElement()) {
                            this.videoElement().volume = 0.05;
                            try {
                                await this.videoElement().play();
                            } catch {
                                this.muted = true;
                                await this.videoElement().play();
                            }
                        }
                    });
                })
                .catch(err => console.error(err.response.data));
            },
            onClick() {
                return this.playMovie(this.movie);
            },
            onMouseEnter() {
                if (this.noTrailer)
                    return;

                this.muted = localStorage.getItem('muted') === 'true';
                this.previewVisible = false;
                this.trailer = null;
                clearTimeout(this.timeout);

                this.timeout = setTimeout(() => {
                    this.showPreview();
                }, 800);
            },
            onMouseLeave() {
                if (this.videoElement()) {
                    this.videoElement().pause();
                }

                clearTimeout(this.timeout);
                this.trailer = null;
                this.previewVisible = false;
            },
            onTrailerError() {
                this.trailerError = 'Erreur lors du chargement'
            },
            openMovieDialog() {
                if (this.videoElement())
                    this.movie.currentTime = this.videoElement().currentTime;

                this.toggleMovieDialog(true, this.movie);
            }
        },
        watch: {
            muted(val) {
                localStorage.setItem('muted', val);
            }
        }
    }
</script>

<style lang="scss">
.fade-scale-enter-active, .fade-scale-leave-active {
    transition: opacity .2s, transform 300ms;
}
.fade-scale-enter, .fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.8);
}

.movie-preview {
    position: relative;
    width: var(--preview-width);
    height: var(--preview-height);
    transition: all 200ms ease;
    background: rgba(39, 39, 39, 0.3);
    border-radius: 3px;
    //will-change: transform;

    &:first-child.preview-visible {
        margin-left: calc(var(--preview-width) / 2);
    }

    &:hover {
        .play-btn {
            display: flex;
        }
    }

    .overlay {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: -10%;
        left: -50%;
        width: calc(var(--preview-width) * 2);
        height: calc(var(--preview-height) * 1.2);
        border-radius: 5px;
        background: var(--v-dark-darken1);
        z-index: 1;

        video {
            background: black;
            border-top-left-radius: inherit;
            border-top-right-radius: inherit;
        }

        .name {
            font-weight: 700;
            font-size: 1.2rem;
            letter-spacing: 1px;
        }

        .mute-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
        }
    }

    img, .v-image {
        object-fit: cover;
        width: 100%;
        height: 100%;
        cursor: pointer;
        transition: 200ms;
        border-radius: inherit;
        animation: fade 300ms ease;

        .v-responsive__sizer {
            padding-bottom: 0 !important;
        }
    }

    .play-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.8);
        background-color: rgba(0, 0, 0, 0.3);
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 200ms;

        i {
            color: rgba(255, 255, 255, 0.8);
        }

        &:hover {
            background-color: white;
            border-color: white;

            &.downloaded {
                background-color: var(--v-primary-base);
                border-color: var(--v-primary-base);
            }

            i {
                color: black;
            }
        }
    }
}

.mobile {
    .movie-preview {
        transform: none;

        .overlay {
            display: none;
        }

        img, .v-image {
            filter: none;
        }

        &:hover:active {
            transform: scale(0.95);
        }
    }
}
</style>
