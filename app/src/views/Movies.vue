<template>
    <main-page>
        <div class="pa-3 pa-lg-10 grid">
            <movie-preview v-for="(movie, index) in moviesFiltered" :key="index" :movie="movie" class="mb-5 mb-lg-10 mx-2 mx-lg-3"></movie-preview>
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
                    return this.movies.filter(() => true).sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
                else
                    return this.movies.filter(m => m.name.toLowerCase().includes(this.$store.state.searchMovie.toLowerCase()));
            }
        }
    }
</script>

<style lang="scss" scoped>
    .grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, 170px);
    }

    .mobile {
        .grid {
            justify-content: space-around;
        }
    }
</style>
