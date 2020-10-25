<template>
    <div class="movie-preview">
        <div class="img-container" @click.stop="playMovie(movie)">
            <img @load="imageLoaded = true" v-show="imageLoaded" :src="movie.image" :alt="movie.title">
            <div class="play-btn">
                <v-icon>play_arrow</v-icon>
            </div>
        </div>
        <div :title="movie.name" class="movie-title" @click.stop="playMovie(movie)">{{ movie.name }}</div>
    </div>
</template>

<script>
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
                border: 2px solid rgba(255, 255, 255, 0.8);
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

                i {
                    color: rgba(255, 255, 255, 0.8);
                }

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
