<template>
 <v-container>
  <h1>home</h1>
  <ul v-for="post in AllPosts" :key="post.id">
    <li>
      {{ post.description }}
      {{ post.title }}
      {{post.author.userName}}
    </li>
  </ul>
 </v-container>

</template>

<script>
import gql from 'graphql-tag'

  export default {
   name: 'Home',
//    data () {
//   return {
//     // Initialize your apollo data
//     getPosts: ''
//   }
// },
   apollo: {
     AllPosts: {
       query: gql `
        query  {
          AllPosts {
            title
            description
            id
            createdAt
            author {
              id
              userName
            }
          }
        } `
     }
   }
  }
</script>
