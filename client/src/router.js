import Vue from "vue";
import Router from "vue-router";
import Home from "./components/Home.vue";
import AddPost from "./components/Posts/AddPost.vue";
import Posts from "./components/Posts/Posts.vue";
import Post from "./components/Posts/Post.vue"
import Profile from "./components/Auth/Profile.vue";
import Signin from "./components/Auth/Signin.vue";
import Signup from "./components/Auth/Signup.vue";
import Logout from "./components/Auth/Logout.vue";
import { apolloClient } from "./vue-apollo";
import getCurrentUser from './graphql/getCurrentUser.gql'

Vue.use(Router);


const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home
    },
    {
      path: "/profile",
      name: "Profile",
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: "/signup",
      name: "Signup",
      component: Signup
    },
    {
      path: "/signin",
      name: "Signin",
      component: Signin
    },
    {
      path: "/logout",
      name: "Logout",
      component: Logout
    },
    {
      path: "/posts",
      name: "posts",
      component: Posts
    },
    {
      path: "/posts/:postId",
      name: "post",
      component: Post,
      props: true
    },
    {
      path: "/post/add",
      name: "AddPost",
      component: AddPost,
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    let currentUser = await apolloClient.query({
      query: getCurrentUser,
      fetchPolicy: "network-only"
    });
    if (currentUser.data.getCurrentUser) {
      next();
    } else {
      next({
        path: "/signin",
        query: { redirect: to.fullPath }
      });
    }
  } else {
    next()
  }

})
export default router
