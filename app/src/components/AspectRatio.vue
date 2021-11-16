<template>
    <div class="aspect-ratio" :style="style">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: "AspectRatio",
    props: {
        ratio: {
            type: Number,
            default: 16 / 9
        }
    },
    data() {
        return {
            width: 0
        }
    },
    computed: {
        style() {
            return {
                'padding-bottom': `calc(${this.width}px / ${this.ratio})`
            }
        }
    },
    created() {
        this.$nextTick(() => {
            const resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    if (entry.contentBoxSize) {
                        // Firefox implements `contentBoxSize` as a single content rect, rather than an array
                        const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
                        this.width = contentBoxSize.inlineSize;
                    }
                }
            });

            resizeObserver.observe(this.$el);
        });
    }
}
</script>

<style lang="scss">
.aspect-ratio {
    position: relative;
    width: 100%;
    border-radius: inherit;

    & > * {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
}
</style>
