<template>
    <div style="display: contents">
        <v-card class="minimized" v-if="playingMovie" elevation="15" @click.stop="togglePlayer">
            <img :src="playingMovie.image" style="border-radius: 3px">
            <div class="resume">
                <v-icon>play_arrow</v-icon>
                <span class="ml-1">Reprendre</span>
            </div>
        </v-card>
        <v-bottom-sheet :value="playerVisible" fullscreen>
            <v-sheet class="d-flex flex-column" height="100%" v-if="playingMovie">
                <div class="dark d-flex align-center px-5" style="height: 58px">
                    <v-btn @click.stop="togglePlayer" icon>
                        <v-icon>expand_more</v-icon>
                    </v-btn>
                    <h3 class="ml-5 opacity-80 text-spaced f-500">{{ playingMovie.name }}</h3>
                    <v-btn class="ml-auto" icon>
                        <v-icon>cast</v-icon>
                    </v-btn>
                </div>
                <div class="flex-grow-1 position-relative">
                    <div class="iframe-container">
                        <iframe :src="url" allowfullscreen frameborder="0"></iframe>
                        <v-progress-circular class="loading" indeterminate></v-progress-circular>
                    </div>
                </div>
            </v-sheet>
        </v-bottom-sheet>
    </div>
</template>

<script>
    export default {
        name: "MoviePlayer",
        computed: {
            url() {
                return `https://drive.google.com/file/d/${this.playingMovie.id}/preview`;
            }
        }
    }
</script>

<style lang="scss" scoped>
    .minimized {
        position: absolute;
        bottom: 15px;
        left: 15px;
        width: 190px;
        height: calc(190px * 1.5);
        z-index: 1;
        cursor: pointer;
        user-select: none;

        &:hover {
            .resume {
                opacity: 1;
            }
        }

        img {
            width: 100%;
            height: 100%;
        }

        .resume {
            opacity: 0;
            transition: 300ms ease;
            background: rgba(0, 0, 0, 0.6);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .iframe-container {
        background: rgba(0, 0, 0, 0.5);

        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
        }

        iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
        }
    }
</style>
