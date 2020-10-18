<template>
    <div style="display: contents">
        <v-main class="main-page">
            <slot></slot>
        </v-main>
    </div>
</template>

<script>
    export default {
        name: "MainPage"
    }
</script>

<style lang="scss" scoped>
    .main-page {
        padding: 0 3em 0em 3em !important;
    }
</style>
