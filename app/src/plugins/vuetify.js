import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

const opts = {
    theme: {
        dark: true,
        options: {
            customProperties: true,
        },
        themes: {
            dark: {
                primary: '#e5a00d',
                dark: '#272727'
            }
        }
    }
}

export default new Vuetify(opts)
