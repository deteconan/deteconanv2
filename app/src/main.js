import Vue from 'vue'
import App from './App.vue'
import vuetify from "@/plugins/vuetify.js"
import router from "@/router.js"
import store from "@/store.js"
import './mixins.js'
import './filters.js'
import './assets/style/global.scss'
import io from 'socket.io-client'
import moment from 'moment'
import { LoaderPlugin } from 'vue-google-login'

Vue.config.productionTip = false

let socketEnpoint = window.origin;
if (process.env.NODE_ENV === 'development')
  socketEnpoint = process.env.VUE_APP_API_URL;

Vue.prototype.$socket = io(`${socketEnpoint}/upload`)
Vue.prototype.$moment = moment

Vue.use(LoaderPlugin, {
  client_id: '22198592066-5d2g6ruijvqt2ne5psd5hdhlbhq8dotd.apps.googleusercontent.com'
})

new Vue({
  vuetify,
  store,
  router,
  render: h => h(App),
}).$mount('#app')
