<template>
    <main-page>
        <div class="pb-5 pb-lg-10 pt-lg-0">
            <div class="genres mb-lg-5">
                <genre-picker v-if="genres.length" v-model="selectedGenre"></genre-picker>
            </div>

<!--            <movie-section v-if="processingMovies.length > 0" title="En cours de traitement" :local-movies="processingMovies" class="mb-5 mb-lg-10"></movie-section>-->
<!--            <movie-section v-if="recentlyAddedMovies.length > 0" title="Ajouts récents" :local-movies="recentlyAddedMovies" class="mb-5 mb-lg-10"></movie-section>-->

            <movie-section v-if="filteredUpcomingMovies.length" title="À l'affiche" :local-movies="filteredUpcomingMovies" class="mb-5 mb-lg-10"></movie-section>
            <movie-section v-if="downloadedMovies.length" title="Téléchargés" :local-movies="downloadedMovies"></movie-section>
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
            downloadedMovies() {
                return this.filteredMovies.filter(m => m.thumbnailLink).sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
            }
        },
        methods: {
            filterMovie(movie) {
                if (this.$store.state.searchMovie && !movie.name.toLowerCase().includes(this.$store.state.searchMovie.toLowerCase()))
                    return false;

                return !(this.selectedGenre && !movie.genre_ids.includes(this.selectedGenre));
            },
            getUpcomingMovies() {
                return Network.get('/movies/upcoming').then(res => {
                    this.upcomingMovies = res.data;
                }).catch(err => console.error(err.response.data));
            }
        },
        mounted() {
            this.getUpcomingMovies();
        }
    }
</script>

<style lang="scss" scoped>

</style>
