<template>
  <div id="app">
    <v-app>
      <toolbar></toolbar>

      <div class="d-flex h-100">
        <Menu class="main-menu"></Menu>

        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </div>
    </v-app>
  </div>
</template>

<script>
  import Toolbar from "@/layouts/Toolbar.vue";
  import Menu from "@/layouts/Menu.vue";
  export default {
    name: 'App',
    components: {Menu, Toolbar}
  }
</script>

<style lang="scss">
  html, body {
    height: 100%;
    background-color: #2b2549;
    color: white;
  }

  #app {
    font-family: Poppins, sans-serif;
  }

  .theme--dark.v-application {
    background-color: #25294a !important;
  }
</style>
