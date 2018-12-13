import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

const state = {
  isLoggedIn: false
};
const mutations = {
  toggleIsLoggedIn(state, payload) {
    state.isLoggedIn = payload;
  }
};
const getters = {
  isLoggedIn: state => state.isLoggedIn
};
export default new Vuex.Store({
  state,
  mutations,
  getters
});
