<template>
    <main-page>
        <v-row class="h-100">
            <v-col cols="8">
                <video-player id="12GIRxGRGkjUgeQqmMUQbLxokSNKNFr5u" title="My Hero Academia - Heroes Rising"></video-player>
            </v-col>
            <v-col cols="4">
                <v-card elevation="0" class="all-episodes">
                    <div class="card-title">Tous les épisodes</div>
                    <hr>
                </v-card>
            </v-col>
        </v-row>
    </main-page>
</template>

<script>
    import VideoPlayer from "@/components/VideoPlayer.vue";
    export default {
        name: "Home",
        components: {VideoPlayer}
    }
</script>

<style lang="scss" scoped>
    .col {
        padding: 30px !important;
    }

    .all-episodes {
        height: 100%;

        .card-title {
            text-align: right;
            padding-right: 1em;
            font-size: 1em;
        }

        hr {
            margin-top: 0.5em;
            border-color: rgba(255, 255, 255, 0.2);
        }
    }
</style>
