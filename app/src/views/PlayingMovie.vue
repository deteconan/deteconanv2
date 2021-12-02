<template>
    <main-page :loading="loading">
        <div class="pa-0 pa-lg-15 overflow-x-hidden" :class="{'h-100': isMobileLayout}" v-if="details">
            <v-row :class="{'h-100': isMobileLayout}">
                <v-col v-if="!isMobileLayout" cols="0" lg="4" class="pr-0">
                    <div style="height: 100%">
                        <v-img :src="details.image | tmdbPosterHD" style="border-top-left-radius: 5px; border-bottom-left-radius: 5px; height: 100%;"></v-img>
                    </div>
                </v-col>
                <v-col cols="12" lg="8" class="pl-0 pr-0 pr-lg-3 pt-0 pt-lg-3 pb-0 pb-lg-3" :class="{'h-100': isMobileLayout}">
                    <div class="details">
                        <div class="d-flex align-center">
                            <h1>{{ details.name }}</h1>
                            <template v-if="!isMobileLayout && isAdmin && movie">
                                <v-btn class="ml-auto" icon @click.stop="editDialog = true">
                                    <v-icon class="material-icons-outlined">edit</v-icon>
                                </v-btn>
                                <v-btn class="ml-3" icon @click.stop="deleteDialog = true">
                                    <v-icon class="material-icons-outlined text-error">delete</v-icon>
                                </v-btn>
                            </template>
                        </div>
                        <h3 class="text-spaced f-500 d-flex align-center mt-2">
                            <v-icon v-if="!isReleased" class="mr-2">event</v-icon>
                            <span>{{ date }}</span>
                        </h3>
                        <div class="font-weight-bold text-spaced opacity-80 mt-5 d-flex align-center">
                            <div class="mr-5">{{ runtime }}</div>
                            <v-img :src="require('../assets/img/popcorn.svg')" max-width="1.2em" max-height="1.2em" title="Note du public"></v-img>
                            <div class="ml-1">{{ details.rating * 10 }}%</div>
                        </div>

                        <v-btn v-if="movie" color="primary" class="mr-auto my-5" @click.stop="openPlayer">
                            <v-icon color="black">play_arrow</v-icon>
                            <span class="black--text ml-1 f-600">Lecture</span>
                        </v-btn>

                        <v-btn v-else-if="isReleased && isAdmin" @click.stop="download" color="success white--text" class="mr-auto mt-5">
                            <v-icon>cloud_download</v-icon>
                            <span class="ml-1 f-600">Télécharger</span>
                        </v-btn>

                        <div class="text-justify f-500 my-5">{{ details.description }}</div>

                        <div class="mt-auto d-flex">
                            <div class="font-weight-bold text-uppercase opacity-50 text-spaced">
                                <div v-if="directors">Réalisation</div>
                                <div v-if="writers">Écriture</div>
                                <div v-if="movieGenres">Genres</div>
                            </div>
                            <div class="ml-5 f-500">
                                <div>{{ directors }}</div>
                                <div>{{ writers }}</div>
                                <div>{{ movieGenres }}</div>
                            </div>
                        </div>
                    </div>
                </v-col>
            </v-row>

            <div v-if="!isMobileLayout" class="d-flex align-center">
                <h3 class="mt-5 mb-5">Acteurs</h3>
                <v-btn @click="scrollX('actors', -1)" rounded icon class="ml-auto">
                    <v-icon>chevron_left</v-icon>
                </v-btn>
                <v-btn @click="scrollX('actors', 1)" rounded icon>
                    <v-icon>chevron_right</v-icon>
                </v-btn>
            </div>
            <div v-if="!isMobileLayout" class="d-flex overflow-auto hide-scrollbar actors" ref="actors">
                <div v-for="actor in details.cast" :key="actor.id" style="width: 20%" class="text-center mr-10">
                    <v-avatar size="150" color="indigo">
                        <v-img :src="actor.image | tmdbPosterHD"></v-img>
                    </v-avatar>
                    <div class="font-weight-bold mt-3">{{ actor.name }}</div>
                    <div class="opacity-80 f-500 f-11">{{ actor.role }}</div>
                </div>
            </div>
        </div>

        <v-dialog v-if="movie" v-model="deleteDialog" max-width="320">
            <v-card>
                <v-card-title class="headline">Supprimer</v-card-title>
                <v-card-text>
                    <span>Voulez-vous vraiment supprimer</span>
                    <span class="font-weight-bold mx-1" style="color: white">{{ movie.name }}</span>
                    <span>?</span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click.stop="deleteDialog = false">Annuler</v-btn>
                    <v-btn text color="error" @click.stop="deleteMovie">Supprimer</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-if="editMovie" v-model="editDialog" max-width="320">
            <v-card>
                <v-card-title class="headline">Éditer</v-card-title>
                <v-card-text>
                    <v-text-field v-model="editMovie.name" label="Nom"></v-text-field>
                    <v-text-field v-model="editMovie.image" label="Miniature"></v-text-field>
                    <v-select v-model="editMovie.parentId" :items="folders" item-text="name" item-value="id" label="Dossier">
                        <template #prepend-inner>
                            <v-icon class="material-icons-outlined">folder</v-icon>
                        </template>
                    </v-select>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click.stop="editDialog = false">Annuler</v-btn>
                    <v-btn text color="success" @click.stop="updateMovie">Confirmer</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </main-page>
</template>

<script>
    import MainPage from "../layouts/MainPage.vue";
    import Network from "../helpers/Network";

    export default {
        name: "PlayingMovie",
        components: {MainPage},
        data() {
            return {
                deleteDialog: false,
                editDialog: false,
                editMovie: null,
                loading: false,
                details: null,
                movie: null
            }
        },
        computed: {
            url() {
                return `https://drive.google.com/file/d/${this.movie.id}/preview`;
            },
            directors() {
                if (this.details.directors)
                    return this.details.directors.map(d => d.name).join(', ');
                else
                    return '';
            },
            writers() {
                if (this.details.writers)
                    return this.details.writers.map(w => w.name).join(', ');
                else
                    return '';
            },
            movieGenres() {
                return this.genres.filter(g => this.details.genre_ids.includes(g.id)).map(g => g.name).join(', ');
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
            isReleased() {
                return this.$moment().isSameOrAfter(this.$moment(this.details.release_date));
            },
            date() {
                if (this.isReleased)
                    return this.$moment(this.details.release_date).format('YYYY');
                else
                    return `À venir : ${this.$moment(this.details.release_date).locale('fr').format('LL')}`;
            }
        },
        activated() {
            this.movie = this.movies.find(m => +m.tmdbId === +this.$route.params.id);

            if (this.movie)
                this.editMovie = JSON.parse(JSON.stringify(this.movie));

            this.loading = true;
            Network.get(`/movies/details/${this.$route.params.id}`).then(res => {
                this.details = res.data;
            }).finally(() => this.loading = false);
        },
        methods: {
            updateMovie() {
                if (!this.movie.id)
                    return;

                this.editDialog = false;

                Network.post('/movies/update', this.editMovie).then(() => {
                    this.$store.dispatch('loadMovies');
                }).catch(err => {
                    console.error(err.response.data);
                });
            },
            deleteMovie() {
                if (!this.movie.id)
                    return;

                this.deleteDialog = false;

                Network.post('/files/delete', {
                    file_id: this.movie.id
                }).then(() => {
                    this.$store.dispatch('loadMovies');
                    this.reach('/movies');
                }).catch(err => {
                    console.error(err);
                });
            },
            scrollX(name, xOffset) {
                this.$refs[name].scroll({
                    left: this.$refs[name].clientWidth * xOffset + this.$refs[name].scrollLeft,
                    behavior: 'smooth'
                });
            },
            openPlayer() {
                this.$store.commit('setMovie', this.movie);
                this.togglePlayer();
            },
            download() {
                this.reach(`/upload?q=${this.details.en_title}`);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .details {
        background: rgb(0 0 0 / 0.3);
        backdrop-filter: blur(5px);
        padding: 1.5em 2em 2em 2em;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .actors {
        margin: 0 -40px;
        padding-left: 40px;

        &::after {
            content: "";
            padding-right: 40px;
        }
    }

    .movie-container {

        .iframe-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 3px;

            .loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1;
            }

            iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 3px;
                z-index: 2;
            }
        }
    }

    img {
        width: 12%;
        height: auto;
        border-radius: 3px;
    }

    .actions {
        transition: opacity 300ms ease;

        &:hover {
            button {
                opacity: 1 !important;
            }
        }

        button {
            opacity: 0;
            width: 180px;
            display: flex;
            justify-content: left;

            &:first-child {
                opacity: 1;
            }

            i {
                margin-right: 0.5rem;
            }
        }
    }
</style>
