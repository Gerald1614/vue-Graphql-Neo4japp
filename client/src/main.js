import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import store from "./store"
import { createProvider } from "./vue-apollo";
// import currentUser from './mixins/getCurrentUser'

Vue.config.productionTip = false;
const apolloProvider = createProvider({}, { router });

new Vue({
  router,
  store,
  apolloProvider,
  render: h => h(App)
}).$mount("#app");
