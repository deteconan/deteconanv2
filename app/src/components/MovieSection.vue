<template>
    <div class="movie-section" ref="movies">
        <template v-if="!isMobileLayout">
            <div class="mb-3 d-flex align-center">
                <h3 class="text-spaced" v-if="title">{{ title }}</h3>

                <v-btn @click="prev" rounded icon class="ml-auto" :disabled="!canPrev">
                    <v-icon>chevron_left</v-icon>
                </v-btn>
                <v-btn @click="next" rounded icon :disabled="!canNext">
                    <v-icon>chevron_right</v-icon>
                </v-btn>
            </div>

            <v-window v-model="onboarding">
                <v-window-item v-for="n in Math.ceil(localMovies.length / elementsPerPage)" :key="n">
                    <div class="d-flex">
                        <movie-preview v-for="(movie, index) in currents(n)" :key="index" :movie="movie" class="movie"></movie-preview>
                    </div>
                </v-window-item>
            </v-window>
        </template>
        <template v-else>
            <h3 class="text-spaced mb-3" v-if="title">{{ title }}</h3>
            <div class="scroll">
                <movie-preview v-for="(movie, index) in localMovies" :key="index" :movie="movie" class="movie"></movie-preview>
            </div>
        </template>
    </div>
</template>

<script>
    import MoviePreview from "@/components/MoviePreview.vue";
    export default {
        name: "MovieSection",
        components: {MoviePreview},
        props: {
            localMovies: {
                type: Array,
                required: true
            },
            title: {
                type: String
            }
        },
        data() {
            return {
                elementsPerPage: 5,
                onboarding: 0
            }
        },
        computed: {
            canPrev() {
                return (this.onboarding - 1) * this.elementsPerPage >= 0;
            },
            canNext() {
                return (this.onboarding + 1) * this.elementsPerPage <= (this.localMovies.length - 1);
            }
        },
        mounted() {
            this.elementsPerPage = Math.round(this.$refs.movies.clientWidth / 182);
        },
        methods: {
            next() {
                const index = (this.onboarding + 1) * this.elementsPerPage;
                this.onboarding = index > (this.localMovies.length - 1)
                    ? this.onboarding
                    : this.onboarding + 1
            },
            prev() {
                const index = (this.onboarding - 1) * this.elementsPerPage;
                this.onboarding = index < 0
                    ? this.onboarding
                    : this.onboarding - 1
            },
            currents(n) {
                n--;
                return this.localMovies.slice(n * this.elementsPerPage, n * this.elementsPerPage + this.elementsPerPage);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .movie-section {
        .movie {
            margin-right: 2em;

            &:last-child {
                margin-right: 0;
            }
        }
    }

    .mobile {
        .movie-section {
            .scroll {
                white-space: nowrap;
                overflow: auto;
                margin-left: -20px;
                margin-right: -20px;
                padding-left: 20px;
                padding-right: 20px;

                &::-webkit-scrollbar {
                    display: none;
                }
            }

            .movie {
                display: inline-block;
            }
        }
    }
</style>
