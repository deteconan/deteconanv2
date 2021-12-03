<template>
    <v-dialog :value="value" @input="onInput" width="900" content-class="movie-dialog">
        <div v-if="movie" class="bg-image" v-bg-img="tmdbPosterHD(movie.image)">
            <video v-if="movie && trailer" :src="trailer" ref="trailer" @canplay="onLoad" @playing="onPlay" @ended="loaded = false" :class="{'loaded': loaded}" autoplay :muted="muted"></video>
            <div class="gradient"></div>

            <div v-if="movie">
                <v-btn @click.stop="onInput(false)" icon color="#eeee" class="close-btn">
                    <v-icon size="25">close</v-icon>
                </v-btn>

                <transition name="fade">
                    <v-btn v-if="loaded" @click.stop="muted = !muted" icon color="#eeee" class="mute-btn">
                        <v-icon v-if="muted" size="25">volume_off</v-icon>
                        <v-icon v-else size="25">volume_mute</v-icon>
                    </v-btn>
                </transition>

                <v-btn @click.stop="playMovie(movie), onInput(false)" color="primary" class="play-btn">
                    <v-icon>play_arrow</v-icon>
                    <span class="ml-1">Lecture</span>
                </v-btn>
            </div>
        </div>
        <v-skeleton-loader v-else type="image" width="100%" height="500" class="dark darken-2"></v-skeleton-loader>

        <div class="details">
            <div v-if="details">
                <div class="details-grid">
                    <div>
                        <div class="text-spaced mb-3">
                            <span>{{ date }}</span>
                            <template v-if="details.runtime">
                                <span class="mx-2">•</span>
                                <span>{{ runtime }}</span>
                            </template>
                        </div>

                        <div class="title">{{ movie.name }}</div>
                        <v-rating :value="movie.rating / 2" background-color="orange lighten-3" color="orange" dense size="15" readonly></v-rating>
                        <small class="d-block opacity-80 mt-3">{{ movieGenres }}</small>
                    </div>
                    <div>
                        <div v-if="distribution" class="mb-2">
                            <small class="opacity-50 mr-1">Distribution :</small>
                            <small>{{ distribution }}</small>
                        </div>
                        <div v-if="cast">
                            <small class="opacity-50 mr-1">Acteurs :</small>
                            <small>{{ cast }}</small>
                        </div>
                    </div>
                </div>

                <div class="text-justify mt-4">{{ details.description }}</div>
            </div>

            <v-skeleton-loader v-else type="article" class="mt-3"></v-skeleton-loader>
        </div>
    </v-dialog>
</template>

<script>
import Network from "@/helpers/Network.js";
import { tmdbPosterHD } from "@/filters.js";

export default {
    name: "MovieDialog",
    props: {
        value: {
            type: Boolean,
            required: true
        },
        movie: {
            type: Object
        }
    },
    data() {
        return {
            details: null,
            loaded: false,
            muted: true,
            trailer: null,
            tmdbPosterHD
        }
    },
    computed: {
        runtime() {
            const date = this.$moment().startOf('day').add({ minute: this.details.runtime });
            const hours = date.hours();
            const minutes = date.minutes();

            if (hours > 0) {
                if (minutes > 0)
                    return `${hours}h${this.$moment(date).format('mm')}`;
                else
                    return `${hours}h`;
            }
            else
                return `${minutes}min`;
        },
        isReleased() {
            return this.$moment().isSameOrAfter(this.$moment(this.details.release_date));
        },
        date() {
            if (this.isReleased)
                return this.$moment(this.details.release_date).format('YYYY');
            else
                return `À venir : ${this.$moment(this.details.release_date).locale('fr').format('LL')}`;
        },
        movieGenres() {
            if (!this.genres.length)
                return '';

            return this.genres.filter(g => this.movie.genre_ids.includes(g.id)).map(g => g.name).join(' ∙ ');
        },
        distribution() {
            if (!this.details)
                return '';

            return this.details.directors.concat(this.details.writers).slice(0, 4).map(d => d.name).join(', ');
        },
        cast() {
            if (!this.details)
                return '';

            return this.details.cast.slice(0, 4).map(d => d.name).join(', ');
        }
    },
    mounted() {
        this.loadMovie();
        this.loadTrailer();
    },
    methods: {
        reset() {
            this.loaded = false;
            this.trailer = null;
            this.details = null;
        },
        videoElement() {
            return this.$refs.trailer;
        },
        onInput(val) {
            this.$emit('input', val);
            this.$store.commit('toggleMovieDialog', { visible: val, movie: this.movie });
        },
        async onLoad() {
            if (!this.videoElement() || this.loaded)
                return;

            this.videoElement().volume = 0.2;

            try {
                await this.videoElement().play();
            } catch {
                this.muted = true;
                await this.videoElement().play();
            }

            this.loaded = true;
        },
        onPlay() {
            if (this.loaded)
                return;

            if (this.movie.currentTime) {
                this.videoElement().currentTime = this.movie.currentTime;
            }
        },
        loadMovie() {
            if (!this.movie)
                return;

            return Network.get(`/movies/details/${this.movie.tmdbId}`).then(res => {
                this.details = res.data;
            });
        },
        loadTrailer() {
            if (!this.movie)
                return;

            return Network.get(`/movie/trailer/${this.movie.tmdbId}`).then(res => {
                this.trailer = res.data;
            });
        }
    },
    watch: {
        value(val) {
            if (!val) {
                this.reset();
                this.toggleMovieDialog(false, null);
            }
            else {
                this.muted = localStorage.getItem('muted') === 'true';
                this.loadMovie();
                this.loadTrailer();
            }
        },
        muted(val) {
            localStorage.setItem('muted', val);
        }
    }
}
</script>

<style lang="scss">
.movie-dialog {
    .bg-image {
        background-size: cover;
        height: 500px;
        position: relative;

        .gradient {
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 40%, var(--v-dark-darken1));
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        video {
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 1s ease;

            &.loaded {
                opacity: 1;
            }
        }

        .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(3px);
        }

        .mute-btn {
            position: absolute;
            bottom: 1rem;
            right: 2rem;
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(3px);
        }

        .play-btn {
            color: black;
            font-size: 1rem;
            position: absolute;
            bottom: 1rem;
            left: 2rem;
        }
    }

    .details {
        padding: 1rem 2rem 2rem;
        background: var(--v-dark-darken1);

        .details-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1rem;

            .title {
                font-size: 1.5rem !important;
                font-weight: bold;
                letter-spacing: 1px !important;
                opacity: 0.8 !important;
            }

            small {
                font-size: 0.9rem;
            }
        }
    }

    .v-skeleton-loader {
        border-radius: 0;

        .v-skeleton-loader__heading {
            margin: 0 !important;
        }

        .v-skeleton-loader__article {
            background: transparent !important;
        }

        .v-skeleton-loader__paragraph, .v-skeleton-loader__article {
            padding-left: 0;
            padding-right: 0;
            background: transparent;
        }

        .v-skeleton-loader__paragraph {
            margin-top: 1rem;
        }

        .v-skeleton-loader__image {
            height: 100%;
        }
    }
}
</style>
