<template>
    <div class="movie-preview">
        <div class="img-container">
            <img @load="imageLoaded = true" v-show="imageLoaded" :src="movie.image" :alt="movie.title">
            <div class="play-btn" @click.stop="playMovie(movie)">
                <v-icon>play_arrow</v-icon>
            </div>
            <v-btn @click.stop="deleteMovie" class="delete-btn" icon>
                <v-icon color="error" class="material-icons-outlined">delete</v-icon>
            </v-btn>
        </div>
        <div :title="movie.name" class="movie-title">{{ movie.name }}</div>
    </div>
</template>

<script>
    import Network from "@/helpers/Network.js";

    export default {
        name: "MoviePreview",
        props: {
            movie: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                imageLoaded: false
            }
        },
        methods: {
            deleteMovie() {
                if (!this.movie.id)
                    return;

                Network.post('/files/delete', {
                    file_id: this.movie.id
                }).then(() => {
                    this.$store.dispatch('loadMovies');
                }).catch(err => {
                    console.error(err);
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    .movie-preview {
        position: relative;
        width: 150px;

        .img-container {
            position: relative;
            width: 150px;
            height: 225px;
            transition: 200ms;
            background: rgba(39, 39, 39, 0.3);
            border-radius: 3px;

            &:hover {
                transform: scale(1.05, 1.05);

                img {
                    filter: brightness(0.5);
                }

                .play-btn {
                    display: flex;
                }
            }

            .delete-btn {
                opacity: 0;
                position: absolute;
                bottom: 0;
                right: 0;

                &:hover {
                    opacity: 1;
                }
            }

            img {
                object-fit: cover;
                width: 150px;
                height: 225px;
                cursor: pointer;
                transition: 200ms;
                border-radius: 3px;
                animation: fade 300ms ease;
            }

            .play-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid white;
                background-color: rgba(0, 0, 0, 0.3);
                display: none;
                align-items: center;
                justify-content: center;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                cursor: pointer;
                transition: 200ms;

                &:hover {
                    background-color: var(--v-primary-base);
                    border-color: var(--v-primary-base);

                    i {
                        color: black;
                    }
                }
            }
        }

        .movie-title {
            font-size: 11pt;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: pointer;
            margin-top: 0.5em;

            &:hover {
                text-decoration: underline;
            }
        }
    }
</style>
