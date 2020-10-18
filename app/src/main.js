import './assets/style/global.scss';
import Vue from 'vue';
import App from './App.vue';
import vuetify from "@/plugins/vuetify.js";
import router from "@/router.js";
import MainPage from "@/layouts/MainPage.vue";
import "./mixins.js";
import "./filters.js";
import io from 'socket.io-client';

Vue.config.productionTip = false;

Vue.component('main-page', MainPage);

Vue.prototype.$socket = io(`${process.env.VUE_APP_API_URL}/upload`);

new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app');
