<template>
  <v-container v-if="getPost" class="mt-3" flexbox center>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card-title>
          <h1>{{getPost.title }}</h1>
          <v-btn @click="handleToggleLike" large icon v-if="getCurrentUser">
            <v-icon large :color="postLiked ? 'red' : 'grey'">favorite</v-icon>
          </v-btn>
          <h3 class="ml-3 font-weight-thin"> {{ getPost.likes }} LIKES</h3>
          <v-spacer></v-spacer>
          <v-icon @click="goToPreviousPage" color="info">arrow_back</v-icon>
        </v-card-title>
        <v-tooltip right>
          <span>Click to enlarge image</span>
          <v-card-media @click="toggleImageDialog" slot="activator" :src="getPost.imageUrl" id="post__image"></v-card-media>
        </v-tooltip>
        <v-dialog v-model="dialog">
          <v-card>
            <v-card-media :src="getPost.imageUrl" height="80vh"></v-card-media>
          </v-card>
        </v-dialog>
        <v-card-text>
          <span v-for="(category, index) in getPost.categories" :key="index">
            <v-chip class="mb-3" color="accent" text-color="white">{{category}}</v-chip>
          </span>
          <h3>{{getPost.description }}</h3>
        </v-card-text>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { GETPOST_QUERY } from "../../graphql/getPost.js"
import LikePost from "../../graphql/likePost.gql"
import UnLikePost from "../../graphql/unLikePost.gql"
import getCurrentUser from "../../graphql/getCurrentUser.gql"
export default {
  name: "Post",
  props: ["postId"],
  data() {
    return {
      dialog: false
    };
  },
  apollo: {
    getPost: {
      query: GETPOST_QUERY,
      variables() { return { postId: this.postId  } }
    },
    getCurrentUser: {
      query: getCurrentUser
    }
  },
  computed: {
    postLiked() {
      if (this.getCurrentUser.favorites[0] != null)  {
        return this.getCurrentUser.favorites.some(fave => fave.id === this.postId)
        } else return false;
      }
  },
  methods: {
    handleToggleLike() {
      if (this.postLiked) {
        this.handleUnLikePost()
        } else {
        this.handleLikePost()
        }
      },
    handleLikePost() {
      this.$apollo.mutate({
        mutation: LikePost,
        variables: {
          postId: this.postId,
          userId: this.getCurrentUser.id
        }
      })
      .then((data) =>{
        this.$apollo.queries.getCurrentUser.refresh()
        this.$apollo.queries.getPost.refresh()
      })
      .catch(error => {
      throw new Error('could not update post')
    })
    },
    handleUnLikePost() {
      this.$apollo.mutate({
        mutation: UnLikePost,
        variables: {
          postId: this.postId,
          userId: this.getCurrentUser.id
          }
        })
      .then((data) =>{
        console.log(data)
        this.$apollo.queries.getCurrentUser.refresh()
        this.$apollo.queries.getPost.refresh()
        })
      .catch(error => {
        console.log(error)
        throw new Error('could not update post')
        })
      },
    goToPreviousPage() {
      this.$router.go(-1);
      },
    toggleImageDialog() {
      if (window.innerWidth > 500) {
        this.dialog = !this.dialog;
        }
      }
    }
};
</script>
<style scoped lang="stylus">
  #post__image
    height: 400px !important;
</style>
