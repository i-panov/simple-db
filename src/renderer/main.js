import Vue from 'vue'
import axios from 'axios'
import VModal from 'vue-js-modal'
// import VueConfirmDialog from 'vue-confirm-dialog'

import App from './App'
import router from './router'
import store from './store'

import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'

Vue.use(VModal)

// Vue.use(VueConfirmDialog)
// Vue.component('vue-confirm-dialog', VueConfirmDialog.default)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
