<template>
    <main-page>
        <div class="pa-10">
            <movie-section v-if="processingMovies.length > 0" title="En cours de traitement" :local-movies="processingMovies" class="mb-10"></movie-section>
            <movie-section v-if="recentlyAddedMovies.length > 0" title="Ajouts récents" :local-movies="recentlyAddedMovies"></movie-section>
        </div>
    </main-page>
</template>

<script>
    import MainPage from "@/layouts/MainPage.vue";
    import MovieSection from "@/components/MovieSection.vue";

    export default {
        name: "Movies",
        components: {MovieSection, MainPage},
        computed: {
            processingMovies() {
                return this.movies.filter(m => !m.thumbnailLink).sort((a, b) => b.createdTime > a.createdTime ? 1 : -1);
            },
            recentlyAddedMovies() {
                return this.movies.filter(m => m.thumbnailLink).sort((a, b) => b.createdTime > a.createdTime ? 1 : -1);
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
