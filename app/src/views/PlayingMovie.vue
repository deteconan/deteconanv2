<template>
    <main-page>
        <v-container class="pa-10" style="width: 70%" v-if="playingMovie">
            <div class="movie-container">
                <div class="iframe-container">
                    <iframe :src="url" allowfullscreen frameborder="0"></iframe>
                </div>
            </div>

            <div class="d-flex mt-5">
                <img :src="playingMovie.image" :alt="playingMovie.title">
                <div class="ml-10">
                    <h1>{{ playingMovie.name }}</h1>
                    <h2 class="opacity-80 text-spaced">{{ playingMovie.year }}</h2>
                </div>
                <div class="ml-auto actions">
                    <v-btn block outlined @click.stop="window.open('https://chrome.google.com/webstore/detail/substital-add-subtitles-t/kkkbiiikppgjdiebcabomlbidfodipjg')">
                        <v-icon class="material-icons-outlined">subtitles</v-icon>
                        <span class="ml-1">Sous-titres</span>
                    </v-btn>
                    <v-btn block outlined class="mt-3" @click.stop="editDialog = true">
                        <v-icon class="material-icons-outlined">edit</v-icon>
                        <span class="ml-1">Modifier</span>
                    </v-btn>
                    <v-btn block outlined color="error" class="mt-3" @click.stop="deleteDialog = true">
                        <v-icon class="material-icons-outlined">delete</v-icon>
                        <span class="ml-1">Supprimer</span>
                    </v-btn>
                </div>
            </div>
        </v-container>

        <v-dialog v-if="playingMovie" v-model="deleteDialog" max-width="320">
            <v-card>
                <v-card-title class="headline">Supprimer</v-card-title>
                <v-card-text>
                    <span>Voulez-vous vraiment supprimer</span>
                    <span class="font-weight-bold mx-1" style="color: white">{{ playingMovie.name }}</span>
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
                    <v-text-field v-model="editMovie.year" label="Année"></v-text-field>
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
                editMovie: null
            }
        },
        computed: {
            url() {
                return 'https://drive.google.com/file/d/' + this.playingMovie.id + '/preview';
            }
        },
        activated() {
            if (!this.playingMovie)
                this.reach('/movies');
            this.editMovie = JSON.parse(JSON.stringify(this.playingMovie));
        },
        methods: {
            updateMovie() {
                if (!this.playingMovie.id)
                    return;

                this.editDialog = false;

                Network.post('/movies/update', this.editMovie).then(() => {
                    this.$store.dispatch('loadMovies');
                }).catch(err => {
                    console.error(err.response.data);
                });
            },
            deleteMovie() {
                if (!this.playingMovie.id)
                    return;

                this.deleteDialog = false;

                Network.post('/files/delete', {
                    file_id: this.playingMovie.id
                }).then(() => {
                    this.$store.dispatch('loadMovies');
                }).catch(err => {
                    console.error(err);
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    .movie-container {

        .iframe-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;

            iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 3px;
            }
        }
    }

    img {
        width: 12%;
        height: auto;
        border-radius: 3px;
    }

    .actions {
        opacity: 0;
        transition: opacity 300ms ease;

        &:hover {
            opacity: 1;
        }

        button {
            width: 180px;
            display: flex;
            justify-content: left;

            i {
                margin-right: 0.5rem;
            }
        }
    }
</style>
