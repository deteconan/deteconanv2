<template>
    <main-page class="d-flex flex-column">
        <v-container class="pb-0">
            <movie-carousel :items="movies" @select-movie="selectedMovie = $event"></movie-carousel>

            <v-row class="mt-5">
                <v-col cols="12" lg="6">
                    <v-card color="backdrop" elevation="5" class="d-flex flex-column h-100 pa-3">
                        <v-card-text class="text-spaced pb-2" style="font-size: 1rem">
                            <v-skeleton-loader v-if="loading" type="text" style="width: 100px"></v-skeleton-loader>
                            <div v-else-if="details">
                                <span>{{ date }}</span>
                                <template v-if="details.runtime">
                                    <span class="mx-2">•</span>
                                    <span>{{ runtime }}</span>
                                </template>
                            </div>
                        </v-card-text>

                        <v-skeleton-loader v-if="loading" type="title"></v-skeleton-loader>
                        <v-card-title v-else-if="details" class="headline fade-in pb-1 pt-0">{{ details.name }}</v-card-title>

                        <v-card-text class="d-flex flex-column h-100">
                            <div v-if="loading">
                                <v-skeleton-loader type="heading" class="mb-10"></v-skeleton-loader>
                                <v-skeleton-loader type="text, paragraph, paragraph"></v-skeleton-loader>
                            </div>

                            <div v-else-if="details" class="fade-in">
                                <v-rating :value="details.rating / 2" background-color="orange lighten-3" color="orange" dense size="15" readonly class="mb-4"></v-rating>

                                <v-btn v-if="downloaded" @click.stop="playMovie(selectedMovie)" color="primary" class="black--text mb-5">
                                    <v-icon>play_arrow</v-icon>
                                    <span class="f-600 text-spaced-xl ml-1">Lecture</span>
                                </v-btn>

                                <v-btn v-else-if="details && isAdmin" @click.stop="download" color="success white--text" class="white--text mb-5">
                                    <v-icon>cloud_download</v-icon>
                                    <span class="f-600 text-spaced-xl ml-2">Télécharger</span>
                                </v-btn>

                                <div class="d-block white--text" style="font-size: 1rem">{{ movieGenres }}</div>

                                <div class="text-justify mt-3" style="font-size: 1rem">{{ details.description }}</div>
                            </div>

                            <div class="mt-auto pt-5" style="font-size: 1rem">
                                <div v-if="loading">
                                    <v-skeleton-loader type="text" class="mb-2"></v-skeleton-loader>
                                    <v-skeleton-loader type="text"></v-skeleton-loader>
                                </div>
                                <div v-else-if="details">
                                    <div v-if="distribution" class="mb-2">
                                        <span class="opacity-50 mr-1">Distribution :</span>
                                        <span>{{ distribution }}</span>
                                    </div>
                                    <div v-if="cast">
                                        <span class="opacity-50 mr-1">Acteurs :</span>
                                        <span>{{ cast }}</span>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" lg="6">
                    <v-card color="backdrop" elevation="5" class="h-100 pa-3">
                        <v-card-title class="text-spaced mb-2" style="font-size: 1.5rem">Similaires</v-card-title>

                        <v-card-text>
                            <div v-if="loading" class="similar">
                                <v-skeleton-loader type="image" style="border-radius: 4px"></v-skeleton-loader>
                                <v-skeleton-loader type="image" style="border-radius: 4px"></v-skeleton-loader>
                                <v-skeleton-loader type="image" style="border-radius: 4px"></v-skeleton-loader>
                                <v-skeleton-loader type="image" style="border-radius: 4px"></v-skeleton-loader>
                                <v-skeleton-loader type="image" style="border-radius: 4px"></v-skeleton-loader>
                                <v-skeleton-loader type="image" style="border-radius: 4px"></v-skeleton-loader>
                                <v-skeleton-loader type="image" style="border-radius: 4px"></v-skeleton-loader>
                                <v-skeleton-loader type="image" style="border-radius: 4px"></v-skeleton-loader>
                            </div>

                            <div v-else-if="details" class="similar">
                                <movie-preview v-for="(movie, index) in details.similar.slice(0, 8)" :key="index" :movie="movie" no-trailer></movie-preview>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </main-page>
</template>

<script>
import MainPage from "@/layouts/MainPage.vue";
import MovieCarousel from "@/components/MovieCarousel.vue";
import Network from "@/helpers/Network.js";
import MoviePreview from "@/components/MoviePreview.vue";
export default {
    name: "Library",
    components: {MoviePreview, MovieCarousel, MainPage},
    data() {
        return {
            loading: false,
            selectedMovie: null,
            details: null,
            timeout: null
        }
    },
    computed: {
        downloaded() {
            return !!this.movies.find(m => +m.tmdbId === +this.selectedMovie.tmdbId);
        },
        movieGenres() {
            if (!this.genres.length)
                return '';

            return this.genres.filter(g => this.details.genre_ids.includes(g.id)).map(g => g.name).join(' ∙ ');
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
    methods: {
        loadMovie() {
            if (!this.selectedMovie)
                return;

            if (this.details && +this.details.tmdbId === +this.selectedMovie.tmdbId)
                return;

            this.loading = true;

            return Network.get(`/movie/about/${this.selectedMovie.tmdbId}`)
                .then(res => {
                    this.details = res.data;
                })
                .catch(err => console.error(err.response.data))
                .finally(() => this.loading = false);
        },
        download() {
            return this.reach(`/upload?q=${this.details.original_title}`);
        }
    },
    watch: {
        selectedMovie(val) {
            if (!val)
                return;

            clearTimeout(this.timeout);

            this.timeout = setTimeout(() => this.loadMovie(), this.details ? 500 : 0);
        }
    }
}
</script>

<style lang="scss" scoped>
.v-card.backdrop {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
}

.similar {
    --preview-width: 7vw;
    --preview-height: calc(var(--preview-width) * 1.5);

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--preview-width), 1fr));
    gap: 1rem 0.5rem;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        background-color: transparent;
        border-radius: 15px;
    }

    .v-skeleton-loader {
        width: var(--preview-width);
        height: var(--preview-height);
    }

    .movie-preview {
        &:hover {
            transform: scale(1.05);
        }

        &:hover:active {
            transform: scale(1.02);
        }
    }
}
</style>
