<template>
    <div class="genre-picker">
        <div v-if="isMobileLayout" class="overflow-x-auto scroll-container d-flex align-center">
            <div class="genres d-flex align-center py-2 pr-2">
                <v-chip @click.stop="selectGenre(genre.id)" v-for="genre in genresFiltered" :key="genre.id" color="primary" :class="{'active': genre.id === selected}" class="ml-2 cursor-pointer">{{ genre.name }}</v-chip>
            </div>
        </div>

        <div v-else ref="scrollContainer" class="overflow-hidden px-10 py-2" style="border-top: 1px solid rgba(255, 255, 255, 0.1)">
            <div ref="scroller" class="scroller" :style="scrollStyle">
                <v-chip @click.stop="selectGenre(genre.id)" v-for="genre in genresFiltered" :key="genre.id" color="primary" :class="{'active': genre.id === selected}" class="cursor-pointer">{{ genre.name }}</v-chip>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "GenrePicker",
    props: {
        value: {
            type: Number
        }
    },
    data() {
        return {
            selected: null,
            scroll: 0
        }
    },
    computed: {
        scrollStyle() {
            return `transform: translateX(${this.scroll}px);`
        },
        genresFiltered() {
            const genres = [];

            for (const movie of this.movies) {
                for (const genreID of movie.genre_ids) {
                    if (!genres.includes(genreID))
                        genres.push(genreID);
                }
            }

            return this.genres.filter(g => genres.includes(g.id));
        }
    },
    async created() {
        await this.$nextTick();

        if (!this.$refs.scroller)
            return;

        this.$refs.scrollContainer.addEventListener('wheel', event => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            if (this.$refs.scroller.getBoundingClientRect().width > this.$refs.scrollContainer.clientWidth  - 50) {
                this.scroll -= event.deltaY;
                this.scroll = Math.max(this.scroll, -(this.$refs.scroller.getBoundingClientRect().width - (this.$refs.scrollContainer.clientWidth - 50)));
                this.scroll = Math.min(this.scroll, 0);
            } else {
                this.scroll = 0;
            }
        });
    },
    methods: {
        selectGenre(id) {
            this.selected = this.selected === id ? null : id;

            setTimeout(() => {
                if (this.value !== id)
                    this.$emit('input', id);
                else
                    this.$emit('input', null);
            }, 20);
        }
    }
}
</script>

<style lang="scss">
.genre-picker {
    .scroll-container {
        min-width: 100%;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;

        .arrow-left, .arrow-right {
            position: absolute;
            z-index: 1;
            height: 100%;
            display: flex;
            align-items: center;
        }

        .arrow-left {
            left: 0;
            background: linear-gradient(90deg, var(--v-dark-base) 80%, transparent);
            padding-left: 0.5rem;
            padding-right: 1rem;
        }

        .arrow-right {
            right: 0;
            background: linear-gradient(-90deg, var(--v-dark-base) 80%, transparent);
            padding-left: 1rem;
            padding-right: 0.5rem;
        }

        &::-webkit-scrollbar {
            display: none;
        }
    }

    .v-chip {
        font-weight: 500;
        font-size: 0.8rem;
        letter-spacing: .5px;

        &:not(.active) {
            background-color: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(5px);
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
    }

    .scroller {
        display: inline-flex;
        gap: 0.5rem;
        transition: transform 100ms ease;
    }
}
</style>
