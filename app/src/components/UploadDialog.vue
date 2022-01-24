<template>
    <v-dialog :value="value" width="600" persistent scrollable :fullscreen="isMobileLayout">
        <v-card>
            <v-card-title class="d-flex align-center pr-3">
                <span>Ajouter du contenu</span>

                <v-btn @click.stop="$emit('input', false)" class="ml-auto" icon>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <div class="dialog-content">
                <div class="d-flex align-center justify-center" style="gap: 1rem">
                    <div class="upload-type" @click.stop="uploadType = 'torrent'" :class="{checked: uploadType === 'torrent'}" v-ripple>
                        <v-icon class="material-icons-outlined">mdi-magnet</v-icon>
                        <div class="f-500 text-spaced">Torrent</div>
                    </div>
                    <div class="upload-type" @click.stop="uploadType = 'url'" :class="{checked: uploadType === 'url'}" v-ripple>
                        <v-icon class="material-icons-outlined">link</v-icon>
                        <div class="f-500 text-spaced">Url</div>
                    </div>
                    <div v-if="false" class="upload-type" @click.stop="uploadType = 'video'" :class="{checked: uploadType === 'video'}" v-ripple>
                        <v-icon class="material-icons-outlined">videocam</v-icon>
                        <div>Vidéo</div>
                    </div>
                    <div v-if="false" class="upload-type" @click.stop="uploadType = 'file'" :class="{checked: uploadType === 'file'}" v-ripple>
                        <v-icon class="material-icons-outlined">insert_drive_file</v-icon>
                        <div>Fichier</div>
                    </div>
                </div>

                <div v-if="uploadType">
                    <v-divider class="my-7"></v-divider>
                    <div v-if="uploadType === 'torrent' || uploadType === 'url'">
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
                            <v-btn @click.stop="searchMovieInfo" :disabled="!file.name" :loading="loadingMoviesInfo || loadingMoviesTorrents">
                                <v-icon>search</v-icon>
                                <span v-if="!isMobileLayout" class="ml-1">Rechercher</span>
                            </v-btn>
                        </div>

                        <div v-if="moreOptions">
                            <v-checkbox v-model="convert" label="Convertir en MP4"></v-checkbox>
                            <v-select v-model="selectedProviders" label="Hébergeurs" :items="providers" item-text="name" item-value="value" multiple></v-select>
                        </div>

                        <template v-if="autocomplete.length > 0 || torrents.length > 0">
                            <v-tabs v-model="moviesTab" grow>
                                <v-tab href="#info">Informations</v-tab>
                                <v-tab v-if="uploadType === 'torrent'" href="#torrents">Torrents</v-tab>
                                <v-tab v-else-if="uploadType === 'url'" href="#url">Url</v-tab>
                            </v-tabs>

                            <v-tabs-items v-model="moviesTab">
                                <v-tab-item value="info">
                                    <v-progress-linear v-if="loadingMoviesInfo" indeterminate></v-progress-linear>
                                    <v-row class="px-3" v-if="!movieDetails">
                                        <v-col cols="6" lg="4" v-for="movie in autocomplete" :key="movie.id" class="text-center cursor-pointer" @click.stop="movieDetails = movie" v-ripple>
                                            <img :src="movie.image | tmdbPoster" :alt="movie.name" class="rounded" width="100%">
                                            <div class="subtitle-1">{{ movie.name }}</div>
                                            <div class="subtitle-2 opacity-80">{{ $moment(movie.release_date).format('YYYY') }}</div>
                                        </v-col>
                                    </v-row>

                                    <div v-else class="d-flex justify-center pa-5">
                                        <img :src="movieDetails.image | tmdbPoster" :alt="movieDetails.name" class="rounded" width="120px">
                                        <div class="ml-3 d-flex flex-column">
                                            <div class="title">{{ movieDetails.name }}</div>
                                            <div class="subtitle-1">{{ $moment(movieDetails.release_date).format('YYYY') }}</div>
                                            <v-btn class="mt-auto" @click.stop="movieDetails = null">
                                                <v-icon>close</v-icon>
                                                <span class="ml-1">Changer</span>
                                            </v-btn>
                                        </div>
                                    </div>
                                </v-tab-item>

                                <v-tab-item v-if="uploadType === 'torrent'" value="torrents">
                                    <v-progress-linear v-if="loadingMoviesTorrents" indeterminate></v-progress-linear>
                                    <v-list v-if="!movieTorrent" class="pa-0">
                                        <v-list-item>
                                            <v-list-item-content>
                                                <v-text-field v-model="customMagnet" label="Lien magnet" prepend-inner-icon="link" outlined hide-details dense autocomplete="off"></v-text-field>
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <v-btn @click.stop="setCustomMagnet" color="primary" :disabled="!customMagnet">Valider</v-btn>
                                            </v-list-item-action>
                                        </v-list-item>

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
                                            <v-list-item-action v-if="movieTorrent.seeds && movieTorrent.peers">
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
                                                <div v-if="movieTorrent.size" class="text-primary f-500">{{ movieTorrent.size }}</div>
                                            </v-list-item-action>
                                        </v-list-item>

                                        <v-btn @click.stop="movieTorrent = null" class="d-block mx-auto mt-3">
                                            <v-icon>close</v-icon>
                                            <span class="ml-1">Changer</span>
                                        </v-btn>
                                    </v-list>
                                </v-tab-item>

                                <v-tab-item v-else-if="uploadType === 'url'" value="url">
                                    <v-list class="pa-0">
                                        <v-list-item>
                                            <v-list-item-content>
                                                <v-text-field v-if="!file.link" v-model="customUrl" label="Lien direct" prepend-inner-icon="link" outlined hide-details dense autocomplete="off"></v-text-field>
                                                <span v-else>{{ file.link }}</span>
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <v-btn v-if="!file.link" @click.stop="setCustomUrl" color="primary" :disabled="!customUrl">Valider</v-btn>
                                                <v-btn v-else @click.stop="file.link = null">
                                                    <v-icon>close</v-icon>
                                                    <span class="ml-1">Changer</span>
                                                </v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
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
        { name: 'The Pirate Bay', value: 'ThePirateBay' },
        { name: 'Torrent Galaxy', value: 'TorrentGalaxy' },
        { name: 'Lime Torrents', value: 'Limetorrents' },
        { name: 'Rarbg', value: 'Rarbg' },
        { name: 'Nyaa', value: 'Nyaa' },
        { name: 'Torrent9', value: 'Torrent9' },
        { name: 'Torrentz2', value: 'Torrentz2' },
        { name: 'Kickass Torrents', value: 'KickassTorrents' },
        { name: 'Yts', value: 'Yts' },
        { name: 'Eztv', value: 'Eztv' },
        { name: '1337x', value: '1337x' }
    ];

    export default {
        name: "UploadDialog",
        props: {
            value: {
                type: Boolean
            },
            movieTitle: {
                type: String
            }
        },
        data() {
            return {
                uploadType: 'torrent',
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
                selectedProviders: ['ThePirateBay'],
                customMagnet: null,
                customUrl: null,
                convert: false
            }
        },
        computed: {
            canUpload() {
                if (this.uploadType === 'torrent')
                    return this.file.name && this.movieDetails && this.movieTorrent && this.folderSelected;
                else if (this.uploadType === 'url')
                    return this.file.name && this.movieDetails && this.file.link && this.folderSelected;
                else
                    return false;
            }
        },
        watch: {
            value(val) {
                if (!val)
                    this.reset();
                else {
                    this.uploadType = 'torrent';
                    this.file.name = this.movieTitle;
                    this.searchMovieInfo();
                    this.$emit('update:movie-title', null);
                }
            }
        },
        methods: {
            setCustomMagnet() {
                if (!this.customMagnet)
                    return;

                this.movieTorrent = {
                    magnet: this.customMagnet,
                    title: this.customMagnet
                };

                this.customMagnet = null;
            },
            setCustomUrl() {
                if (!this.customUrl)
                    return;

                this.file.link = this.customUrl;
                this.customUrl = null;
            },
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

                const options = {
                    name: this.file.name,
                    parentId: this.folderSelected,
                    tmdbId: this.movieDetails.tmdbId,
                    convert: this.convert,
                    progress: 0
                };

                if (this.uploadType === 'torrent')
                    options.link = this.movieTorrent.magnet;
                else if (this.uploadType === 'url')
                    options.link = this.file.link;

                this.$emit('upload', options);
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
            width: 100px;
            border-radius: 5px;
            cursor: pointer;

            &.checked {
                background: var(--v-primary-base);
            }

            &:not(.checked):hover {
                background: rgba(255, 255, 255, 0.1);
            }

            i {
                font-size: 50px;
                margin-bottom: 0.25rem;
            }
        }

        .v-list-item {
            &:nth-child(odd) {
                background: rgba(255, 255, 255, 0.05);
            }
        }
    }

    .mobile {
        .dialog-content {
            height: 100%;
        }
    }
</style>
