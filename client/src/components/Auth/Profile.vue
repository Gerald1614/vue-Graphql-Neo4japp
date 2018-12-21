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

  <v-container class="mt-3" v-esle>
    <v-flex xs12>
      <h2 class="font-weight-light"> Your Posts
        <span class="font weight-regular"> {{ getCurrentUser.posts.length}}</span>
      </h2>
    </v-flex>
    <v-layout row wrap>
      <v-flex xs2 sm6 v-for="post in getCurrentUser.posts" :key="post.id">
        <v-card class="mt-3 ml-1 mr-2" hover>
          <v-btn color="info" floating fab small dark>
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
  </v-container>
</template>

<script>
import getCurrentUser from "../../graphql/getCurrentUser.gql"
  export default {
    name: 'Profile',
    apollo: {
    getCurrentUser: {
      query: getCurrentUser
    }
  }
  }
</script>
