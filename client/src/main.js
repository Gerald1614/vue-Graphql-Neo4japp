import Vue from "vue";
import './plugins/vuetify'
import App from "./App.vue";
import router from "./router";
import { createProvider } from './vue-apollo'
import getCurrentUser from './graphql/getCurrentUser.gql'

Vue.config.productionTip = false;
const apolloProvider = createProvider({}, { router })

new Vue({
  router,
  apolloProvider,
  render: h => h(App),
  created() {
    this.$apollo.query({
      query: getCurrentUser
    }).then((currentUser) => {console.log(currentUser)})
    }
}).$mount("#app");
