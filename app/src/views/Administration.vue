<template>
    <main-page class="administration">
        <div style="height: 8%">
            <v-card elevation="0">
                <h2 class="pl-2">Gestion des fichiers</h2>
            </v-card>
        </div>

        <v-row style="height: 90%">
            <v-col class="h-100" cols="4">
                <v-card class="h-100" elevation="0">
                    <div class="mx-3 mt-1 d-flex align-items-center">
                        <div>Explorer</div>
                        <v-btn class="ml-auto" outlined color="success" small>
                            <v-icon left>add</v-icon> Nouveau
                        </v-btn>
                    </div>
                    <hr>
                    <div class="folders-container">
                        <div v-if="loadingFolders" class="loading-folders">
                            <div>
                                <p class="mb-2">Chargement des dossiers</p>
                                <v-progress-linear indeterminate rounded></v-progress-linear>
                            </div>
                        </div>
                        <template v-else-if="items.length > 0">
                            <v-treeview v-model="tree" :open.sync="open" :items="items" activatable item-key="id" return-object open-all @update:active="selectFile">
                                <template #label="{ item, open }">
                                    <div @contextmenu="onRightClick($event, item)" @click="selectFile(item)" style="cursor: pointer">
                                        <v-icon v-if="item.mimeType === 'folder'">
                                            {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                                        </v-icon>
                                        <v-icon class="material-icons-outlined" v-else>
                                            {{ icons[item.mimeType] }}
                                        </v-icon>
                                        <span class="pl-2">{{ item.name }}</span>
                                    </div>
                                </template>
                            </v-treeview>

                            <context-menu ref="foldersMenu" :options="foldersMenuOptions"></context-menu>
                        </template>
                        <div class="text-center mt-8" v-else>
                            <div class="mt-3 text-spaced opacity-80">Aucun dossier trouvé</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col class="h-100" cols="8">
                <v-card class="w-100 h-100 d-table" elevation="0">
                    <div class="mx-3 mt-1 d-flex align-items-center">
                        <div v-if="fileSelected">{{ fileSelected.name }}</div>
                        <div v-else>Aperçu</div>
                        <div class="file-buttons">
                            <v-btn outlined color="white" small>
                                <v-icon left>launch</v-icon> Déplacer
                            </v-btn>
                            <btn-confirm outlined color="error" small
                                         title="Supprimer le(s) fichier(s) sélectionné(s) ?" text="Attention, cette action est irréversible.">

                                <v-icon left>delete</v-icon> Supprimer
                            </btn-confirm>
                        </div>
                    </div>
                    <hr>
                    <div class="fields">
                        <template v-if="fileSelected && fileSelected.mimeType !== 'folder'">
                            <v-text-field v-model="fileSelected.name" placeholder="Nom" solo class="pr-10 ml-2"></v-text-field>
                            <div>{{ fileSelected | size }}</div>
                            <div class="ml-10 mr-2">{{ fileSelected | mimeType }}</div>
                        </template>
                        <template v-else-if="fileSelected">
                            <v-tabs grow background-color="transparent" v-model="uploadMode">
                                <v-tab href="#local"><v-icon class="mr-1 material-icons-outlined">insert_drive_file</v-icon>Local</v-tab>
                                <v-tab href="#url"><v-icon class="mr-1">attach_file</v-icon>URL</v-tab>
                            </v-tabs>
                        </template>
                    </div>
                    <div class="files-container">
                        <div v-if="!fileSelected" class="text-center mt-8">
                            <div class="mt-3 text-spaced opacity-80">Sélectionnez un fichier ou un dossier</div>
                        </div>
                        <template v-else-if="fileSelected.mimeType !== 'folder'">
                            <media-preview :id="fileSelected.id"></media-preview>
                        </template>
                        <template v-else-if="fileSelected.mimeType === 'folder'">
                            <v-tabs-items v-model="uploadMode" style="background: transparent">
                                <v-tab-item value="local">

                                </v-tab-item>
                                <v-tab-item value="url">
                                    <v-list style="background: transparent">
                                        <v-list-item v-for="(url, index) in urls" :key="index">
                                            <v-list-item-icon>
                                                <v-icon>attach_file</v-icon>
                                            </v-list-item-icon>
                                            <v-list-item-title class="d-flex" style="width: 100px">
                                                <span class="text-ellipsis" style="width: 50%">{{ url.name }}</span>
                                                <a class="text-ellipsis ml-2" style="width: 50%" :href="url.link" target="_blank">{{ url.link }}</a>
                                            </v-list-item-title>
                                            <v-list-item-action>
                                                <v-btn icon @click.stop="urls.splice(urls.indexOf(url), 1)">
                                                    <v-icon color="error">delete</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                            <v-progress-linear v-if="progress[url.link]" style="position: absolute; top: 0; left: 0;"
                                                               color="success" :value="progress[url.link]"></v-progress-linear>
                                        </v-list-item>
                                    </v-list>
                                </v-tab-item>
                            </v-tabs-items>
                        </template>
                    </div>
                    <div class="file-upload">
                        <template v-if="fileSelected">
                            <template v-if="fileSelected.mimeType === 'folder'">
                                <template v-if="uploadMode === 'local'">
                                    <div v-if="!file" class="upload-box" @click="clickFileInput" @drop="onDropFile" @dragover.prevent>
                                        <img :src="require('../assets/img/upload_file.png')">
                                        <span>Déposez un fichier ici</span>
                                        <input type="file" class="d-none" ref="file" accept="*/*" @change="onChangeFile">
                                    </div>
                                    <div class="file-info" v-else>
                                        <div class="d-flex w-100">
                                            <v-text-field class="mt-0 pt-0 d-flex" prepend-icon="attach_file" single-line hide-details label="Nom" :placeholder="file.name"></v-text-field>
                                            <div class="d-flex align-items-center" style="width: 50%">
                                                <span class="ml-auto">{{ formatBytes(file.size) }}</span>
                                            </div>
                                        </div>
                                        <div class="d-flex mt-auto">
                                            <v-btn v-if="file.type === 'application/json'" outlined color="yellow">
                                                <v-icon left>link</v-icon> Charger URLs
                                            </v-btn>
                                            <div class="d-flex ml-auto">
                                                <v-btn @click.stop="changeFile" outlined color="white">
                                                    <v-icon left>refresh</v-icon> Changer
                                                </v-btn>
                                                <v-btn style="margin-left: 1em; box-shadow: none;" color="primary">
                                                    <v-icon class="material-icons-outlined" left>backup</v-icon> Upload
                                                </v-btn>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <div v-else-if="uploadMode === 'url'">
                                    <div class="d-flex">
                                        <v-text-field v-model="url.name" class="mr-2" label="Nom" dense @keypress.13="uploadFromUrl"></v-text-field>
                                        <v-text-field v-model="url.link" class="ml-2" label="Url" dense @keypress.13="uploadFromUrl"></v-text-field>
                                    </div>
                                    <div class="d-flex justify-end">
                                        <v-btn v-if="false" outlined color="success" class="mr-3" :disabled="!this.url.name || !this.url.link" @click="addUrl">
                                            <v-icon left>add</v-icon> Add URLs
                                        </v-btn>
                                        <v-btn color="yellow" outlined :disabled="!this.url.name || !this.url.link" @click.stop="uploadFromUrl">
                                            <v-icon left>link</v-icon> Upload From URLs
                                        </v-btn>
                                    </div>
                                </div>
                            </template>
                            <template v-else>

                            </template>
                        </template>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </main-page>
</template>

<script>
    import BtnConfirm from "@/components/btn-confirm.vue";
    import Network from "@/helpers/Network.js";
    import MediaPreview from "@/components/MediaPreview.vue";
    import ContextMenu from "@/components/context-menu.vue";
    export default {
        name: "Administration",
        components: { ContextMenu, MediaPreview, BtnConfirm },
        data() {
            return {
                foldersMenuOptions: [
                    { title: 'Renommer', action: folder => console.log(folder.id), color: 'dark', icon: 'edit' },
                    { title: 'Supprimer', action: folder => console.log(folder.name), color: 'error', icon: 'delete' }
                ],
                fileSelected: null,
                loadingFolders: false,
                fileUpload: null,
                fileURL: null,
                file: null,
                tree: [],
                items: [],
                open: [],
                icons: {
                    'video/mp4': 'movie',
                    'image/jpeg': 'image'
                },
                uploadMode: 'url',
                url: {
                    name: null,
                    link: null
                },
                urls: [],
                progress: {}
            }
        },
        mounted() {
            this.buildTree();

            this.$socket.on('progress', ({progress, link}) => {
                this.progress[link] = progress;
                this.$forceUpdate();
            });

            this.$socket.on('finish', link => {
                this.progress[link] = null;
                this.$forceUpdate();
                this.buildTree();
            });

            this.$socket.on('error', err => {
                console.error(err);
            });
        },
        methods: {
            selectFile(file) {
                if (Array.isArray(file))
                    file = file.pop();
                this.fileSelected = file;
                this.url.name = null;
                this.url.link = null;
            },
            onRightClick(event, folder) {
                event.stopPropagation();
                event.preventDefault();
                this.$refs.foldersMenu.showContextMenu(event, folder);
                this.$forceUpdate();
            },
            formatBytes(bytes, decimals = 1) {
                if (bytes === 0) return '0 o';

                const k = 1024;
                const dm = decimals < 0 ? 0 : decimals;
                const sizes = ['o', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];

                const i = Math.floor(Math.log(bytes) / Math.log(k));

                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
            },
            clickFileInput() {
                this.$refs.file.click();
            },
            onDropFile(event) {
                event.stopPropagation();
                event.preventDefault();

                let files = event.dataTransfer.files;
                if (files.length > 0) {
                    this.createFile(files[0]);
                    this.fileUpload = files[0];
                } else {
                    this.fileUpload = null;
                }
            },
            onChangeFile(event) {
                let files = event.target.files;
                if (files.length > 0) {
                    this.createFile(files[0]);
                    this.fileUpload = files[0];
                } else {
                    this.fileUpload = null;
                }
            },
            createFile(file) {
                this.file = file;
                let reader = new FileReader();
                let vm = this;

                reader.onload = function(e) {
                    vm.fileUpload = e.target.result;
                };

                if (this.fileURL)
                    URL.revokeObjectURL(this.fileURL);

                this.fileURL = window.URL.createObjectURL(file);

                reader.readAsDataURL(file);
            },
            changeFile() {
                this.file = null;
                this.fileUpload = null;

                setTimeout(() => {
                    this.$refs.file.click();
                }, 50);
            },
            addUrl() {
                if (!this.url || !this.url.name || !this.url.link)
                    return;

                this.urls.push({
                    name: this.url.name,
                    link: this.url.link
                });
                this.url.name = null;
                this.url.link = null;
            },
            buildTree() {
                this.loadingFolders = true;
                Network.get('/files/tree').then(res => {
                    this.items = res.data;
                }).finally(() => {
                    this.loadingFolders = false;
                    this.$forceUpdate();
                });
            },
            uploadFromUrl() {
                if (!this.url || !this.url.name || !this.url.link)
                    return;

                this.$socket.emit('upload_url', {
                    url: this.url,
                    parent_id: this.fileSelected.id
                });

                this.urls.push({
                    name: this.url.name,
                    link: this.url.link
                });
                this.url.name = null;
                this.url.link = null;

                /* Network.post('/files/upload/urls', {
                    urls: this.urls,
                    parent_id: this.fileSelected.id
                }).then(() => {
                    this.urls = [];
                    this.buildTree();
                }); */
            }
        }
    }
</script>

<style lang="scss" scoped>
    .administration {
        height: 100%;
        max-height: 100%;

        .folders-container {
            position: absolute;
            top: 75px;
            left: 0;
            height: calc(100% - 75px - 3em);
            width: 100%;
            overflow-y: auto;
            border-radius: 0 !important;
            background: rgba(255, 255, 255, 0.05);
            padding: 1em 0;

            .loading-folders {
                padding-top: 30px;
                display: flex;
                justify-content: center;
            }
        }

        .folder {
            display: flex;
            align-items: center;
            color: rgba(255, 255, 255, 0.8);
            padding: 1em 1.5em;
            border-radius: 0 !important;
            transition: background 100ms ease;
            user-select: none;

            i {
                color: rgba(255, 255, 255, 0.8);
            }

            &:hover {
                background: rgba(255, 255, 255, 0.1);
                cursor: pointer;
            }

            &.active {
                background: rgba(0, 0, 0, 0.2);
            }
        }

        .file-buttons {
            display: flex;
            align-items: center;
            margin-left: auto;

            button:not(:first-child) {
                margin-left: 1em;
            }

            button:first-child {
                margin-left: auto !important;
            }
        }

        .fields {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1em;
            background: rgba(255, 255, 255, 0.05);
            margin: 0 -1em;
            height: 66px;
        }

        .field-name { width: 70%; }
        .field-size { width: 15%; }
        .field-type { width: 15%; }

        .files-container {
            overflow-y: auto;
            overflow-x: hidden;
            // height: 433px;
            // position: absolute;
            // top: 145px;
            // left: 0;
            width: calc(100% + 2em);
            height: calc(100% - 280px);
            background: rgba(255, 255, 255, 0.05);
            border-radius: 0 !important;
            margin: 5px -1em 0 -1em;
            position: relative;

            iframe {
                position: absolute;
                width: 100%;
                height: 100%;
            }

            .v-list-item {
                &:nth-child(odd) {
                    background: rgba(255, 255, 255, 0.03);
                }
            }

            .file {
                display: flex;
                align-items: center;
                padding: 0 1em;
                user-select: none;
                height: 50px;

                &:nth-child(even) {
                    background: rgba(255, 255, 255, 0.03);
                }

                &:hover {
                    background: rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                }
            }

            .loading-files {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                padding-top: 50px;
            }
        }

        .file-upload {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 0 !important;
            margin: 5px -1em 0 -1em;
            height: 115px;
            padding: 0.75em;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .upload-box {
                cursor: pointer;
                user-select: none;
                height: 100%;
                border: 3px dotted rgba(255, 255, 255, 0.05);
                background: rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                justify-content: center;

                &.disabled {
                    pointer-events: none;
                    opacity: 0;
                }

                img {
                    width: 50px;
                    height: 50px;
                }

                span {
                    margin-left: 1em;
                }
            }

            .file-info {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
        }

        hr {
            margin-top: 0.5em;
            margin-bottom: 1em;
            border-color: rgba(255, 255, 255, 0.2);
        }
    }
</style>
