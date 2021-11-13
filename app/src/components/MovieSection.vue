<template>
    <div>
        <div v-if="!isMobileLayout" ref="scrollContainer" class="scroll-container px-10" style="min-width: auto">
            <div class="d-flex align-center mb-3">
                <h3 class="text-spaced" v-if="title">{{ title }}</h3>

                <template v-if="canScrollLeft || canScrollRight">
                    <v-btn @click.stop="prev" rounded icon :disabled="!canScrollLeft" class="ml-auto">
                        <v-icon>chevron_left</v-icon>
                    </v-btn>
                    <v-btn @click.stop="next" rounded icon :disabled="!canScrollRight">
                        <v-icon>chevron_right</v-icon>
                    </v-btn>
                </template>
            </div>

            <div ref="scroller" class="scroller" :style="scrollStyle">
                <movie-preview v-for="(movie, index) in localMovies" :key="index" :movie="movie" class="movie"></movie-preview>
            </div>
        </div>
        <div v-else class="pa-5">
            <h3 class="text-spaced mb-3" v-if="title">{{ title }}</h3>
            <div class="scroll">
                <movie-preview v-for="(movie, index) in localMovies" :key="index" :movie="movie" class="movie"></movie-preview>
            </div>
        </div>
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
            scroll: 0,
            canScrollLeft: true,
            canScrollRight: true
        }
    },
    computed: {
        scrollStyle() {
            return `transform: translateX(${this.scroll}px);`
        }
    },
    async created() {
        await this.$nextTick();
        this.setupListeners();
    },
    methods: {
        prev() {
            this.scroll += this.$refs.scrollContainer.clientWidth;
            this.scroll = Math.min(this.scroll, 0);
        },
        next() {
            this.scroll -= this.$refs.scrollContainer.clientWidth;
            this.scroll = Math.max(this.scroll, -(this.$refs.scroller.getBoundingClientRect().width - (this.$refs.scrollContainer.clientWidth - 100)));
        },
        setupListeners() {
            const el = this.$refs.scrollContainer;

            if (!el)
                return;

            new ResizeObserver(entries => {
                if (!this.$refs.scroller)
                    return;

                const elWidth = entries[0].contentRect.width;
                this.canScrollRight = this.scroll > -(this.$refs.scroller.getBoundingClientRect().width - (this.$refs.scrollContainer.clientWidth - 100)) && elWidth > this.$refs.scrollContainer.clientWidth;
                this.canScrollLeft = this.scroll < 0;
            }).observe(this.$refs.scroller);

            this.$refs.scroller.addEventListener('wheel', event => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                if (event.deltaY > 0 && !this.canScrollRight) {
                    // Scrolling right
                    return;
                } else if (event.deltaY < 0 && !this.canScrollLeft) {
                    // Scrolling left
                    return;
                }

                this.scroll -= event.deltaY;
                this.scroll = Math.min(this.scroll, 0);
                this.scroll = Math.max(this.scroll, -(this.$refs.scroller.getBoundingClientRect().width - (el.clientWidth - 100)));
            });
        }
    },
    watch: {
        scroll(val) {
            this.canScrollLeft = val < 0;
            this.canScrollRight = val > -(this.$refs.scroller.getBoundingClientRect().width - (this.$refs.scrollContainer.clientWidth - 100));
        },
        '$refs.scroller.scrollWidth'(val) {
            console.log(val);
        }
    }
}
</script>

<style lang="scss" scoped>
.scroll-container {
    overflow-x: hidden;
    overflow-y: hidden;

    .scroller {
        position: relative;
        display: inline-flex;
        gap: 0.5rem;
        transition: transform 100ms ease;
        will-change: transform;
    }
}

.scroll {
    white-space: nowrap;
    overflow: auto;
    display: flex;
    gap: 1.5rem;

    margin-left: -20px;
    margin-right: -20px;
    padding-left: 20px;
    padding-right: 20px;

    &::-webkit-scrollbar {
        display: none;
    }
}
</style>
