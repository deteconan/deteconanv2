<template>
    <div class="movie-preview" @click.stop="playMovie(movie)">
        <v-img :src="movie.image | tmdbPoster" :alt="movie.name"></v-img>
        <div class="overlay">
            <div class="name">{{ movie.name }}</div>

            <div class="play-btn" :class="{ 'downloaded': downloaded }">
                <v-icon v-if="downloaded">play_arrow</v-icon>
                <v-icon v-else>arrow_downward</v-icon>
            </div>
        </div>
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
        computed: {
            downloaded() {
                return this.movies.find(m => +m.tmdbId === +this.movie.tmdbId);
            }
        }
    }
</script>

<style lang="scss">
.movie-preview {
    position: relative;
    width: var(--preview-width);
    height: calc(var(--preview-width) * 1.5);
    transition: all 200ms ease;
    background: rgba(39, 39, 39, 0.3);
    border-radius: 3px;

    &:hover {
        transform: scale(1.05, 1.05);
        z-index: 1;

        img, .v-image {
            filter: brightness(0.25);
        }

        .play-btn {
            display: flex;
        }

        .overlay {
            opacity: 1;
        }
    }

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 0.75rem;
        cursor: pointer;
        //background: rgba(0, 0, 0, 0.75);
        opacity: 0;
        transition: all 150ms ease;
        border-radius: inherit;

        .name {
            font-weight: 700;
            font-size: 1rem;
            letter-spacing: 1px;
        }
    }

    img, .v-image {
        object-fit: cover;
        // width: 150px;
        // height: 225px;
        width: 100%;
        height: 100%;
        cursor: pointer;
        transition: 200ms;
        border-radius: inherit;
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
        bottom: 1rem;
        right: 1rem;
        cursor: pointer;
        transition: 200ms;

        i {
            color: rgba(255, 255, 255, 0.8);
        }

        &:hover {
            background-color: var(--v-success-base);
            border-color: var(--v-success-base);

            &.downloaded {
                background-color: var(--v-primary-base);
                border-color: var(--v-primary-base);
            }

            i {
                color: black;
            }
        }
    }
}

.mobile {
    .movie-preview {
        transform: none;

        .overlay {
            display: none;
        }

        img, .v-image {
            filter: none;
        }

        &:hover:active {
            transform: scale(0.95);
        }
    }
}
</style>
