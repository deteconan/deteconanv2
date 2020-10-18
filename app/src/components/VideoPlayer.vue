<template>
    <div :class="{'fullscreen': fullscreen}">
        <div class="video-box">
            <v-progress-circular class="spinner" indeterminate color="white"></v-progress-circular>
            <iframe :src="url" frameBorder="0" style="border-radius: inherit" allowfullscreen></iframe>
        </div>
        <h3 v-if="title" class="title">{{ title }}</h3>
    </div>
</template>

<script>
    export default {
        name: "VideoPlayer",
        props: {
            id: {
                type: String,
                required: true
            },
            title: {
                type: String
            }
        },
        data() {
            return {
                fullscreen: false
            }
        },
        computed: {
            url() {
                return 'https://drive.google.com/file/d/' + this.id + '/preview';
            }
        },
        methods: {
            toggleFullscreen(fullscreen) {
                this.fullscreen = fullscreen;
            }
        }
    }
</script>

<style lang="scss" scoped>
    .title {
        color: rgba(255, 255, 255, 0.8);
        font-size: 18pt !important;
        padding: 1.2em 0 0.2em 0.5em;
        letter-spacing: 0.5px !important;
        font-weight: 300;
    }

    .fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
    }

    .video-box {
        background: black;
        position: relative;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;
        border-radius: 30px;

        iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        .spinner {
            position: absolute;
            width: 2.5rem;
            height: 2.5rem;
            left: calc(50% - 1.25rem);
            top: calc(50% - 1.25rem);
        }
    }
</style>
