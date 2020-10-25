<template>
    <v-dialog :value="value" width="600" persistent scrollable>
        <v-card>
            <v-card-title class="d-flex align-center pr-3">
                <span>Ajouter du contenu</span>

                <v-btn @click.stop="$emit('input', false)" class="ml-auto" icon>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <div class="dialog-content">
                <div class="d-flex align-center justify-center">
                    <div class="upload-type" @click.stop="uploadType = 'movie'" :class="{checked: uploadType === 'movie'}" v-ripple>
                        <v-icon class="material-icons-outlined">theaters</v-icon>
                        <div>Film</div>
                    </div>
                    <div class="upload-type" @click.stop="uploadType = 'serie'" :class="{checked: uploadType === 'serie'}" v-ripple>
                        <v-icon class="material-icons-outlined">live_tv</v-icon>
                        <div>Série</div>
                    </div>
                    <div class="upload-type" @click.stop="uploadType = 'video'" :class="{checked: uploadType === 'video'}" v-ripple>
                        <v-icon class="material-icons-outlined">videocam</v-icon>
                        <div>Vidéo</div>
                    </div>
                    <div class="upload-type" @click.stop="uploadType = 'file'" :class="{checked: uploadType === 'file'}" v-ripple>
                        <v-icon class="material-icons-outlined">insert_drive_file</v-icon>
                        <div>Fichier</div>
                    </div>
                </div>

                <div v-if="uploadType">
                    <v-divider class="my-7"></v-divider>
                    <div v-if="uploadType === 'movie'">
                        <v-text-field v-model="file.name" autocomplete="off" outlined label="Nom du film" append-icon="search" @keypress.13="searchMovieInfo" @click:append="searchMovieInfo">
                            <template #prepend-inner>
                                <v-icon class="material-icons-outlined">theaters</v-icon>
                            </template>
                        </v-text-field>

                        <v-select hide-details v-model="folderSelected" :items="folders" item-text="name" item-value="id" label="Dossier" outlined>
                            <template #prepend-inner>
                                <v-icon class="material-icons-outlined">folder</v-icon>
                            </template>
                        </v-select>

                        <div class="d-flex align-center justify-space-between my-5">
                            <v-btn text class="opacity-80" @click.stop="moreOptions = !moreOptions">
                                <span>Plus d'options</span>
                                <v-icon class="ml-1">{{ moreOptions ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
                            </v-btn>
                            <v-btn @click.stop="searchMovieInfo" :disabled="!file.name" :loading="loadingMoviesInfo || loadingMoviesTorrents"
                                   v-if="autocomplete.length === 0 && torrents.length === 0">
                                <v-icon>search</v-icon>
                                <span class="ml-1">Rechercher</span>
                            </v-btn>
                        </div>

                        <div v-if="moreOptions" class="d-flex flex-wrap">
                            <v-select v-model="selectedProviders" label="Hébergeurs" :items="providers" item-text="name" item-value="value" multiple></v-select>
                        </div>

                        <template v-if="autocomplete.length > 0 || torrents.length > 0">
                            <v-tabs v-model="moviesTab" grow>
                                <v-tab href="#info">Informations</v-tab>
                                <v-tab href="#torrents">Torrents</v-tab>
                            </v-tabs>

                            <v-tabs-items v-model="moviesTab">
                                <v-tab-item value="info">
                                    <v-progress-linear v-if="loadingMoviesInfo" indeterminate></v-progress-linear>
                                    <v-row class="px-3" v-if="!movieDetails">
                                        <v-col cols="4" v-for="movie in autocomplete" :key="movie.id" class="text-center cursor-pointer" @click.stop="movieDetails = movie" v-ripple>
                                            <img :src="movie.image" :alt="movie.name" class="rounded" width="100%" height="255px">
                                            <div class="subtitle-1">{{ movie.name }}</div>
                                            <div class="subtitle-2 opacity-80">{{ movie.year }}</div>
                                        </v-col>
                                    </v-row>

                                    <div v-else class="d-flex justify-center pa-5">
                                        <img :src="movieDetails.image" :alt="movieDetails.name" class="rounded" width="120px" height="180px">
                                        <div class="ml-3 d-flex flex-column">
                                            <div class="title">{{ movieDetails.name }}</div>
                                            <div class="subtitle-1">{{ movieDetails.year }}</div>
                                            <v-btn class="mt-auto" @click.stop="movieDetails = null">
                                                <v-icon>close</v-icon>
                                                <span class="ml-1">Changer</span>
                                            </v-btn>
                                        </div>
                                    </div>
                                </v-tab-item>
                                <v-tab-item value="torrents">
                                    <v-progress-linear v-if="loadingMoviesTorrents" indeterminate></v-progress-linear>
                                    <v-list v-if="!movieTorrent" class="pa-0">
                                        <v-list-item v-for="(torrent, index) in torrents" :key="index" link @click.stop="movieTorrent = torrent">
                                            <v-list-item-content>
                                                <div class="text-ellipsis line-spaced" :title="torrent.title">{{ torrent.title }}</div>
                                                <div class="opacity-80 subtitle-2">{{ torrent.provider }}</div>
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <div class="f-500">
                                                <span class="text-success mr-1">
                                                    <span>{{ torrent.seeds }}</span>
                                                    <v-icon color="success">arrow_upward</v-icon>
                                                </span>
                                                    <span class="text-error">
                                                    <span>{{ torrent.peers }}</span>
                                                    <v-icon color="error">arrow_downward</v-icon>
                                                </span>
                                                </div>
                                                <div class="text-primary f-500">{{ torrent.size }}</div>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </v-list>

                                    <v-list v-else class="pa-0 pb-3">
                                        <v-list-item>
                                            <v-list-item-content>
                                                <div class="text-ellipsis line-spaced" :title="movieTorrent.title">{{ movieTorrent.title }}</div>
                                                <div class="opacity-80 subtitle-2">{{ movieTorrent.provider }}</div>
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <div class="f-500">
                                                <span class="text-success mr-1">
                                                    <span>{{ movieTorrent.seeds }}</span>
                                                    <v-icon color="success">arrow_upward</v-icon>
                                                </span>
                                                    <span class="text-error">
                                                    <span>{{ movieTorrent.peers }}</span>
                                                    <v-icon color="error">arrow_downward</v-icon>
                                                </span>
                                                </div>
                                                <div class="text-primary f-500">{{ movieTorrent.size }}</div>
                                            </v-list-item-action>
                                        </v-list-item>

                                        <v-btn @click.stop="movieTorrent = null" class="d-block mx-auto mt-3">
                                            <v-icon>close</v-icon>
                                            <span class="ml-1">Changer</span>
                                        </v-btn>
                                    </v-list>
                                </v-tab-item>
                            </v-tabs-items>
                        </template>
                    </div>
                </div>
            </div>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click.stop="$emit('input', false)" class="mr-1" text>Annuler</v-btn>
                <v-btn color="primary" :disabled="!canUpload" @click.stop="upload">
                    <v-icon>backup</v-icon>
                    <span class="ml-1">Upload</span>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import Network from "@/helpers/Network.js";

    const providers = [
        { name: 'Torrent9', value: 'Torrent9' },
        { name: 'The Pirate Bay', value: 'ThePirateBay' },
        { name: 'Lime Torrents', value: 'Limetorrents' },
        { name: 'Rarbg', value: 'Rarbg' },
        { name: 'Torrentz2', value: 'Torrentz2' },
        { name: 'Kickass Torrents', value: 'KickassTorrents' },
    ];

    export default {
        name: "UploadDialog",
        props: {
            value: {
                type: Boolean
            }
        },
        data() {
            return {
                uploadType: null,
                autocomplete: [],
                torrents: [],
                movieDetails: null,
                movieTorrent: null,
                file: {
                    name: null,
                    link: null
                },
                moviesTab: 'info',
                loadingMoviesInfo: false,
                loadingMoviesTorrents: false,
                folderSelected: null,
                moreOptions: false,
                providers: providers,
                selectedProviders: providers.map(p => p.value)
            }
        },
        computed: {
            canUpload() {
                return this.uploadType && this.file.name && this.movieDetails && this.movieTorrent && this.folderSelected;
            }
        },
        watch: {
            value(val) {
                if (!val)
                    this.reset();
            }
        },
        methods: {
            searchMovieInfo() {
                if (!this.file.name)
                    return;

                if (!this.movieDetails) {
                    this.loadingMoviesInfo = true;
                    Network.post('/movies/autocomplete', {
                        name: this.file.name
                    }).then(res => {
                        this.autocomplete = res.data;
                    }).catch(err => {
                        this.autocomplete = [];
                        console.error(err.response.data);
                    }).finally(() => this.loadingMoviesInfo = false);
                }

                if (!this.movieTorrent) {
                    this.loadingMoviesTorrents = true;
                    Network.post('/movies/torrents', {
                        name: this.file.name,
                        providers: this.selectedProviders
                    }).then(res => {
                        this.torrents = res.data;
                    }).catch(err => {
                        this.torrents = [];
                        console.error(err);
                    }).finally(() => this.loadingMoviesTorrents = false);
                }
            },
            reset() {
                this.file.name = null;
                this.file.link = null;
                this.autocomplete = [];
                this.torrents = [];
                this.uploadType = null;
                this.movieDetails = null;
                this.movieTorrent = null;
                this.folderSelected = null;
            },
            upload() {
                if (!this.canUpload)
                    return;

                this.$emit('input', false);

                this.$emit('upload', {
                    link: this.movieTorrent.magnet,
                    name: this.file.name,
                    parentId: this.folderSelected,
                    progress: 0,
                    image: this.movieDetails.image,
                    year: this.movieDetails.year
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    .dialog-content {
        background: #353535;
        padding: 1em;
        height: 60vh;
        overflow: auto;

        .upload-type {
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
            padding: 0.5em 1em;
            width: 90px;
            border-radius: 5px;
            cursor: pointer;

            &.checked {
                i {
                    color: var(--v-primary-base);
                }
            }

            &:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            i {
                font-size: 50px;
            }
        }

        .v-list-item {
            &:nth-child(odd) {
                background: rgba(255, 255, 255, 0.05);
            }
        }
    }
</style>
