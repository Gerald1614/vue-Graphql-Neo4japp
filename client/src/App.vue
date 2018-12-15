<template>
  <v-app style="background: #E3E3EE">
    <v-navigation-drawer app temporary fixed v-model="sideNav" >
      <v-toolbar color="accent" dark flat>
        <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
          <router-link to="/" tag="span" style="cursor: pointer">
            <h1 class="title text-uppercase pl-3">VueShare</h1>
          </router-link>
      </v-toolbar>
      <v-divider></v-divider>
      <v-list>
        <v-list-tile v-for="item in sideNavItems" :key="item.title" :to="item.link">
          <v-list-tile-action>
            <v-icon> {{item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            {{ item.title}}
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar fixed color="primary" dark>
      <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
      <v-toolbar-title class="title text-uppercase hidden-xs-only">
        <router-link to="/" tag="span" style="cursor: pointer">
        VueShare</router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field flex prepend-icon="search" placeholder="Search Posts" color="accent" single-line hide-details></v-text-field>
      <v-spacer></v-spacer>
      <v-toolbar-items  class="hidden-xs-only">
        <v-btn flat v-for="item in hbNavItems" :key="item.title" :to="item.link">
          <v-icon class="hidden-sm-only" left>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
        <v-btn flat to="/profile" v-if="isLoggedIn">
          <v-icon class="hidden-sm-only">account_box</v-icon>
          <v-badge right color="red darken-2">
            <span slot="badge">1</span>
            Profile
          </v-badge>
        </v-btn>
        <v-btn flat v-if="isLoggedIn" to="/logout">
          <v-icon class="hiddel-sm-only">exit_to_app</v-icon>
          Signout
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <v-container class="mt-4">
        <transition name="fade">
          <router-view></router-view>
        </transition>
        <v-snackbar v-model="authSnackbar" color="success" :timeout="6000" bottom left>
          <v-icon  class="mr-3">check_circle</v-icon>
          <h3>You are now signed in !</h3>
        </v-snackbar>
      </v-container>

    </v-content>
  </v-app>
</template>

<script>
import Home from './components/Home'
import gql from 'graphql-tag'
export default {
  name: 'App',
  data () {
    return {
      sideNav: false
    }
  },
  apollo: {
    isLoggedIn: {
      query: gql`
          query {
            isLoggedIn @client
          }`
    }
},
  computed: {
    authSnackbar() {
      return this.isLoggedIn
    },
    hbNavItems() {
      let items = [
        {icon: 'chat', title:"Posts", link: '/posts'},
        {icon: 'lock_open', title:"Sign In", link: '/signin'},
        {icon: 'create', title:"Sign Up", link: '/signup'},
      ];
      if (this.isLoggedIn) {
        items = [
          {icon: 'chat', title:"Posts", link: '/posts'}
        ]
      }
      return items
    },
    sideNavItems() {
      let items = [
        {icon: 'chat', title:"Posts", link: '/posts'},
        {icon: 'lock_open', title:"Sign In", link: '/signin'},
        {icon: 'create', title:"Sign Up", link: '/signup'},
      ];
      
   
      if (this.isLoggedIn) {
        items = [
          {icon: 'chat', title:"Posts", link: '/posts'},
          {icon: 'stars', title: 'Create Post', link: '/post/add'},
          {icon: 'account_box', title: 'Profile', link: '/profile'},
          {icon: 'exit_to_app', title:"Log Out", link: '/logout'}
        ]
      }
      return items
    }
  },
  methods: {
   
    toggleSideNav() {
      this.sideNav = !this.sideNav
    }
  }
}
</script>
<style lang="stylus">
  .fade-enter-active,
  .fade-leave-active 
    transition-property: all;
    transition-duration: 0.25s;

.fade-enter-active 
  transition-delay: 0.25s;
.fade-enter,
.fade-leave-active 
  opacity: 0;
  transform: translateX(-25px);
</style>
