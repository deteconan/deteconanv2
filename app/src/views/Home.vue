<template>
    <main-page>
        <div class="pa-5 pa-lg-10">
            <movie-section v-if="processingMovies.length > 0" title="En cours de traitement" :local-movies="processingMovies" class="mb-10"></movie-section>
            <movie-section v-if="recentlyAddedMovies.length > 0" title="Ajouts récents" :local-movies="recentlyAddedMovies" class="mb-10"></movie-section>
            <movie-section v-if="otherMovies.length > 0" title="Tous les films" :local-movies="otherMovies"></movie-section>
        </div>
    </main-page>
</template>

<script>
    import MainPage from "@/layouts/MainPage.vue";
    import MovieSection from "@/components/MovieSection.vue";

    export default {
        name: "Home",
        components: {MovieSection, MainPage},
        computed: {
            filteredMovies() {
                if (!this.$store.state.searchMovie)
                    return this.movies;
                else
                    return this.movies.filter(m => m.name.toLowerCase().includes(this.$store.state.searchMovie.toLowerCase()));
            },
            processingMovies() {
                return this.filteredMovies.filter(m => !m.thumbnailLink).sort((a, b) => b.createdTime > a.createdTime ? 1 : -1);
            },
            recentlyAddedMovies() {
                return this.filteredMovies.filter(m => m.thumbnailLink && this.$moment(m.createdTime).isAfter(this.$moment().subtract({ day: 2 })))
                    .sort((a, b) => b.createdTime > a.createdTime ? 1 : -1);
            },
            otherMovies() {
                return this.filteredMovies.filter(m => m.thumbnailLink).sort((a, b) => a.name > b.name ? 1 : -1);
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
