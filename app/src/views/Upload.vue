<template>
    <main-page>
        <div class="pa-10">
            <v-row justify="center">
                <v-card width="700">
                    <v-card-title>File d'attente</v-card-title>

                    <v-list v-if="queue.length > 0">
                        <v-list-item v-for="(file, index) in queue" :key="index">
                            <v-btn icon :href="file.link" target="_blank">
                                <v-icon>link</v-icon>
                            </v-btn>
                            <v-list-item-content class="ml-2">{{ file.name }}</v-list-item-content>

                            <span class="text-success f-500" v-if="file.speed">{{ file.speed | speed }}</span>

                            <v-list-item-action>
                                <v-icon v-if="file.progress === 100" size="35px" color="success">check_circle</v-icon>
                                <v-progress-circular v-else-if="file.progress >= 0" color="blue" :value="file.progress" :indeterminate="!file.progress"></v-progress-circular>
                                <v-icon v-else-if="file.progress < 0" size="35px" color="error">cancel</v-icon>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                    <v-card-text v-else class="text-center py-5 no-upload">Aucun téléchargement en cours</v-card-text>

                    <v-card-actions>
                        <div class="ml-2">
                            <span>Usage:</span>
                            <span class="ml-1">{{ totalUsage | bytes }}</span>
                        </div>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click.stop="dialogVisible = true">
                            <v-icon>add</v-icon>
                            <span class="ml-1">Ajouter</span>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-row>
        </div>

        <upload-dialog v-model="dialogVisible" @upload="upload"></upload-dialog>
    </main-page>
</template>

<script>
    import MainPage from "@/layouts/MainPage.vue";
    import UploadDialog from "@/components/UploadDialog.vue";
    export default {
        name: "Upload",
        components: {UploadDialog, MainPage},
        data() {
            return {
                queue: [],
                dialogVisible: false
            }
        },
        mounted() {
            this.$socket.on('progress', ({progress, speed, link, name}) => {
                this.addToQueue({name, link, progress, speed});
            });

            this.$socket.on('finish', link => {
                const media = this.queue.find(f => f.link === link);
                if (media) {
                    media.progress = 100;
                    media.speed = null;
                }
                this.$forceUpdate();
                this.$store.dispatch('loadMovies');
                this.$store.dispatch('getTotalUsage');
            });

            this.$socket.on('error', ({err, link}) => {
                const media = this.queue.find(f => f.link === link);
                if (media) {
                    media.progress = -1;
                    media.speed = null;
                }
                console.error(err);
            });
        },
        methods: {
            addToQueue(media) {
                const index = this.queue.findIndex(f => f.link === media.link);
                if (index < 0)
                    this.queue.push(media);
                else
                    this.queue.splice(index, 1, media);
                this.$forceUpdate();
            },
            upload(media) {
                if (this.queue.find(f => f.link === media.link)) // Cancel upload if already uploading
                    return;

                this.$socket.emit('upload_url', {
                    name: media.name,
                    link: media.link,
                    image: media.image,
                    year: media.year,
                    parent_id: media.parentId,
                    imdbId: media.imdbId
                });

                this.addToQueue(media);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .v-list, .no-upload {
        background: rgba(255, 255, 255, 0.1);
    }

    .v-list-item {
        &:nth-child(odd) {
            background: rgba(255, 255, 255, 0.1);
        }
    }
</style>
