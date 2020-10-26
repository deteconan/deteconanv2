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

Vue.config.productionTip = false

Vue.prototype.$socket = io(`${process.env.VUE_APP_API_URL}/upload`)
Vue.prototype.$moment = moment

new Vue({
  vuetify,
  store,
  router,
  render: h => h(App),
}).$mount('#app')
