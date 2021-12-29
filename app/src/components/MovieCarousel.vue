<template>
    <div class="movie-carousel" :style="`min-height: ${this.itemWidth * 3/2}px`">
        <div v-for="(movie, index) in items" :key="index" class="movie" :style="styleFromIndex(index)" @click.stop="selectedIndex = index">
            <v-img :src="movie.image | tmdbPoster" :alt="movie.name" :aspect-ratio="2/3"></v-img>
        </div>

        <v-btn @click.stop="navigateBackward(3)" icon :disabled="selectedIndex === 0" class="btn-arrow left">
            <v-icon>chevron_left</v-icon>
        </v-btn>
        <v-btn @click.stop="navigateForward(3)" icon :disabled="selectedIndex === items.length - 1" class="btn-arrow right">
            <v-icon>chevron_right</v-icon>
        </v-btn>
    </div>
</template>

<script>
export default {
    name: "MovieCarousel",
    props: {
        items: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            selectedIndex: 0,
            lastTime: 0,
            itemWidth: 0
        }
    },
    methods: {
        styleFromIndex(index) {
            let scale = 0;
            const distance = Math.sqrt(Math.pow(index - this.selectedIndex, 2));

            if (distance <= 3) {
                scale = 1 / (1 + distance * 0.2);
            }

            return {
                width: `calc(${scale} * ${this.itemWidth}px)`,
                opacity: scale,
                margin: scale > 0 ? '0 0.5rem' : ''
            };
        },
        navigateBackward(step) {
            this.selectedIndex = Math.max(this.selectedIndex - step, 0);
        },
        navigateForward(step) {
            this.selectedIndex = Math.min(this.selectedIndex + step, this.items.length - 1);
        }
    },
    async created() {
        await this.$nextTick();

        this.itemWidth = window.innerWidth * 0.11;

        this.selectedIndex = 3;

        this.$el.addEventListener('wheel', event => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            if (Date.now() - this.lastTime < 50)
                return;

            this.lastTime = Date.now();

            if (event.deltaY > 0) {
                this.navigateForward(1);
            }

            if (event.deltaY < 0) {
                this.navigateBackward(1);
            }
        });

        window.addEventListener('resize', () => {
            this.itemWidth = window.innerWidth * 0.11;
        });
    },
    watch: {
        selectedIndex(val) {
            this.$emit('select-movie', this.items[val]);
        },
        items() {
            this.$emit('select-movie', this.items[this.selectedIndex]);
        }
    }
}
</script>

<style lang="scss" scoped>
.movie-carousel {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
        display: none;
    }

    .movie {
        cursor: pointer;
        scroll-snap-align: start;
        transition: 250ms ease;

        .v-image {
            width: 100%;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
    }

    .btn-arrow {
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: rgba(255, 255, 255, 0.3);
        background: rgba(0, 0, 0, 0.2);
        transition: 150ms ease;

        &:hover {
            color: rgba(255, 255, 255, 0.8);
            border-color: rgba(255, 255, 255, 0.8);
        }

        &.left {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
        }

        &.right {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
        }
    }
}
</style>
