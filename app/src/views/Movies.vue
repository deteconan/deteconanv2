<template>
    <main-page>
        <div class="pa-10 grid">
            <movie-preview v-for="(movie, index) in moviesFiltered" :key="index" :movie="movie" class="mb-10 mx-3"></movie-preview>
        </div>
    </main-page>
</template>

<script>
    import MainPage from "@/layouts/MainPage.vue";
    import MoviePreview from "@/components/MoviePreview.vue";
    export default {
        name: "Movies",
        components: {MoviePreview, MainPage},
        computed: {
            moviesFiltered() {
                if (!this.$store.state.searchMovie)
                    return this.movies;
                else
                    return this.movies.filter(m => m.name.toLowerCase().includes(this.$store.state.searchMovie.toLowerCase()));
            }
        }
    }
</script>

<style lang="scss" scoped>
    .grid {
        display: flex;
        flex-wrap: wrap;
    }
</style>
