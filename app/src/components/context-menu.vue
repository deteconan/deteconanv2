<template>
    <v-menu v-model="show" :position-x="x" :position-y="y" absolute offset-y>
        <v-list dense>
            <v-list-item v-for="option in options" :key="option.title" link @click="option.action(item)" :class="option.color">
                <div class="d-flex justify-end w-100 text-center">
                    <v-icon class="mr-3 material-icons-outlined" v-if="option.icon">{{ option.icon }}</v-icon>
                    <v-list-item-title :class="{'mr-2': option.icon}">{{ option.title }}</v-list-item-title>
                </div>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
    export default {
        name: "context-menu",
        props: {
            options: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                show: false,
                item: null,
                x: 0,
                y: 0
            }
        },
        methods: {
            showContextMenu(event, item) {
                event.preventDefault();
                this.show = true;
                this.item = item;
                this.x = event.clientX;
                this.y = event.clientY;
                this.$nextTick(() => {
                    this.show = true;
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    .v-list {
        padding: 0 !important;
    }
</style>
