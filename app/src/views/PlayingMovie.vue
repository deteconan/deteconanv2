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
            </div>
        </v-container>
    </main-page>
</template>

<script>
    import MainPage from "@/layouts/MainPage.vue";
    export default {
        name: "PlayingMovie",
        components: {MainPage},
        computed: {
            url() {
                return 'https://drive.google.com/file/d/' + this.playingMovie.id + '/preview';
            }
        },
        activated() {
            if (!this.playingMovie)
                this.reach('/movies');
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
</style>
