<template>
    <main-page>
        <div class="pa-10">
            <movie-section title="Ajouts récents" :local-movies="movies"></movie-section>
        </div>
    </main-page>
</template>

<script>
    import MainPage from "@/layouts/MainPage.vue";
    import MovieSection from "@/components/MovieSection.vue";

    export default {
        name: "Movies",
        components: {MovieSection, MainPage}
    }
</script>

<style lang="scss" scoped>

</style>
