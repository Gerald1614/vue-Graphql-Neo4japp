import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import { apolloProvider } from './vue-apollo'
import FormAlert from "./components/shared/FormAlert.vue"

Vue.config.productionTip = false;
Vue.component('form-alert', FormAlert);

new Vue({
  router,
  apolloProvider,
  render: h => h(App)
}).$mount("#app");
