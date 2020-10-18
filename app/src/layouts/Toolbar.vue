<template>
    <div class="toolbar">
        <div class="logo-container">
            <img class="logo" :src="require('../assets/img/conan_logo.png')" alt="deteconan">
            <h1 class="title theme-font">Deteconan</h1>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Toolbar"
    }
</script>

<style lang="scss" scoped>
    .toolbar {
        display: flex;
        align-items: center;
        padding: 1.5em;

        .logo-container {
            display: flex;
            align-items: center;
            border: 2px solid rgba(255, 255, 255, 0.1);
            padding: 0.3em;
            border-radius: 30px;
            width: 250px;
            margin-left: 1px;

            .logo {
                width: 60px;
                height: 60px;
                border-radius: 20px;
            }

            .title {
                margin-left: 1.5em;
                font-size: 1em !important;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 2px !important;
                color: rgba(255, 255, 255, 0.8);
            }
        }
    }
</style>
