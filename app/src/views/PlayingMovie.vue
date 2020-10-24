<template>
    <main-page>
        <div class="pa-10" v-if="playingMovie">
            <iframe :src="url" allowfullscreen frameborder="0"></iframe>
        </div>
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

</style>
