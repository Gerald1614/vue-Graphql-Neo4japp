<template>
  <v-container class="text-xs-center">
    <v-flex sm6 offset-sm3>
      <v-card class="white--text" color="secondary">
        <v-layout>
          <v-flex xs5>
            <v-card-media height="125px" contain :src="getCurrentUser.avatar"></v-card-media>
          </v-flex>
          <v-flex xs7>
            <v-card-title primary-title>
              <div>
                <div class="headline"> {{getCurrentUser.userName }}</div>
                <div>Joined {{ getCurrentUser.joinDate }}</div>
                <div class="hidden-xs-only font-weight-thin">{{ getCurrentUser.favorites.length }} Favorites</div>
                <div class="hidden-xs-only font-weight-thin">{{ getCurrentUser.posts.length }} Posts Added</div>
              </div>
            </v-card-title>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
    <v-container v-if="!getCurrentUser.favorites.length">
    <v-layout row wrap >
      <v-flex xs12>
        <h2>You have no favorites currently. Go and add some !</h2>
      </v-flex>
    </v-layout>
    </v-container>

  <v-container class="mt-3" v-else>
    <v-flex xs12>
      <h2 class="font-weight-light"> Favorited
        <span class="font-weight-regular"> {{ getCurrentUser.favorites.length }}</span>
      </h2>
    </v-flex>
    <v-layout row wrap>
      <v-flex xs2 sm6 v-for="favorite in getCurrentUser.favorites" :key="favorite.id">
        <v-card class="mt3 ml-1 mr-2" hover>
          <v-card-media height="30vh" :src="favorite.imageUrl"></v-card-media>
          <v-card-text>{{ favorite.title }}</v-card-text>
        </v-card>

      </v-flex>
    </v-layout>
  </v-container>

  <v-container v-if="!getCurrentUser.posts.length">
    <v-layout row wrap>
      <v-flex xs12>
        <h2>You have no posts currently, go and add some!</h2>
      </v-flex>
    </v-layout>
  </v-container>

  <v-container class="mt-3" v-else>
    <v-flex xs12>
      <h2 class="font-weight-light"> Your Posts
        <span class="font weight-regular"> {{ getCurrentUser.posts.length}}</span>
      </h2>
    </v-flex>
    <v-layout row wrap>
      <v-flex xs2 sm6 v-for="post in getCurrentUser.posts" :key="post.id">
        <v-card class="mt-3 ml-1 mr-2" hover>
          <v-btn color="info" @click="loadPost(post)" floating fab small dark>
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn color="error" floating fab small dark>
            <v-icon>delete</v-icon>
          </v-btn>
          <v-card-media height="30vh" :src="post.imageUrl"></v-card-media>
          <v-card-text>{{ post.title }}</v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
  <v-dialog xs12 offset-sm3 persistent v-model="editPostDialog">
    <v-card>
      <v-container>
        <v-card-title class="headline grey ligthen-2">Update Post</v-card-title>
        <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleUpdatePost">
          <v-layout row>
            <v-flex xs12>
              <v-text-field :rules="titleRules" v-model="title" label="Post title" type="text" required></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12>
              <v-text-field :rules="imageUrlRules" v-model="imageUrl" label="image Url" type="imageUrl" required></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12>
              <img :src="imageUrl" height="300px" alt="">
            </v-flex>
          </v-layout>
            <v-layout row>
            <v-flex xs12>
              <v-select :rules="categoriesRules" v-model="categories" :items="['Art', 'Education', 'Travel', 'Photography', 'Technology']" multiple label="Categories" >

              </v-select>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12>
              <v-textarea :rules="descRules" v-model="description" label="Post Description" type="text" required></v-textarea>
            </v-flex>
          </v-layout>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="!isFormValid" type="submit" class="success--text" flat>Update</v-btn>
            <v-btn class="error--text" flat @click="editPostDialog = false">Cancel</v-btn>
          </v-card-actions>
        </v-form>
      </v-container>
      </v-card>
  </v-dialog>
  </v-container>
</template>

<script>
import getCurrentUser from "../../graphql/getCurrentUser.gql"
import updateUserPost from '../../graphql/updateUserPost.gql'
  export default {
    name: 'Profile',
    data() {
      return {
        editPostDialog: false,
        title:"",
      imageUrl: "",
      categories: [],
      description:"",
      error: "",
      loading: false,
      isFormValid: true,
      titleRules: [
        title => !!title || "title is required",
        title => title.length >6 || "title must be more than 6 characters"
      ],
      imageUrlRules: [
         imageUrl => !!imageUrl || "imageUrl is required"
      ],
       categoriesRules: [
         categories => !! categories.length >=1 || " select at least one category"
      ],
       descRules: [
        desc => !!desc || "desc is required"
      ]
      }
    },
    apollo: {
    getCurrentUser: {
      query: getCurrentUser
    }
  },
  methods: {
    loadPost({id, title, imageUrl, categories, description}, editPostDialog = true) {
      this.editPostDialog = editPostDialog;
      this.postId = id;
      this.title = title;
      this.description = description;
      this.categories = categories;
      this.imageUrl = imageUrl;
    },
    async handleUpdatePost() {
      if(!this.$refs.form.validate()) {
        return
      }
        await this.$apollo.mutate({
          mutation: updateUserPost,
          variables: {
            postId: this.postId,
            title: this.title,
            description: this.description,
            imageUrl: this.imageUrl,
            categories: this.categories
          }
        })
       .then((result) => {
         console.log(result)
         this.editPostDialog = false
  //        this.$router.push('/')
        })
        .catch(error => {
        throw new Error('we could not add the post')  
        })
    }
  }
  }
</script>
