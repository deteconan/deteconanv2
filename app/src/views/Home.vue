<template>
    <main-page>
        <div class="pb-5 pb-lg-10 pt-lg-0">
            <div class="genres dark mb-5">
                <genre-picker v-model="selectedGenre"></genre-picker>
            </div>

            <movie-section v-if="processingMovies.length > 0" title="En cours de traitement" :local-movies="processingMovies" class="mb-5 mb-lg-10"></movie-section>
            <movie-section v-if="recentlyAddedMovies.length > 0" title="Ajouts récents" :local-movies="recentlyAddedMovies" class="mb-5 mb-lg-10"></movie-section>

            <movie-section v-if="filteredUpcomingMovies.length > 0" title="Nouveautés" :local-movies="filteredUpcomingMovies" class="mb-5 mb-lg-10"></movie-section>
            <movie-section v-if="otherMovies.length > 0" title="Tous les films" :local-movies="otherMovies"></movie-section>
        </div>
    </main-page>
</template>

<script>
    import MainPage from "@/layouts/MainPage.vue";
    import Network from "@/helpers/Network.js";
    import MovieSection from "@/components/MovieSection.vue";
    import GenrePicker from "@/components/GenrePicker.vue";

    export default {
        name: "Home",
        components: {GenrePicker, MovieSection, MainPage},
        data() {
            return {
                upcomingMovies: [],
                selectedGenre: null
            }
        },
        computed: {
            filteredMovies() {
                return this.movies.filter(m => this.filterMovie(m));
            },
            filteredUpcomingMovies() {
                return this.upcomingMovies.filter(m => this.filterMovie(m));
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
        },
        methods: {
            filterMovie(movie) {
                if (this.$store.state.searchMovie && !movie.name.toLowerCase().includes(this.$store.state.searchMovie.toLowerCase()))
                    return false;

                return !(this.selectedGenre && !movie.genre_ids.includes(this.selectedGenre));
            }
        },
        mounted() {
            Network.get('/movies/upcoming').then(res => {
                this.upcomingMovies = res.data;
            }).catch(err => console.error(err.response.data));
        }
    }
</script>

<style lang="scss" scoped>
.genres {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
