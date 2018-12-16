<template>
  <v-container text-xs-center v-if="infiniteScrollPosts">
    <div v-for="post in infiniteScrollPosts.posts" :key="post.id">
      <img :src="post.imageUrl" height="100px" alt="">
      <h3>{{ post.title }}</h3>
    </div>
    <v-btn @click="showMorePosts" v-if="showMoreEnabled">Fetch more</v-btn>
  </v-container>
</template>

<script>
import { INFINITE_SCROLL_POSTS_QUERY } from "../../graphql/infiniteScrollPosts.js"

const pageSize = 2
  export default {
    name: 'Posts',
    data() {
      return {
        pageNum: 1,
        showMoreEnabled: true
      }
    },
    apollo: {
      infiniteScrollPosts: {
        query: INFINITE_SCROLL_POSTS_QUERY,
            variables: {
              pageNum: 1,
              pageSize
            }
      }
    },

    methods: {
      showMorePosts() {
        this.pageNum += 1;
        this.$apollo.queries.infiniteScrollPosts.fetchMore({
          variables: {
            pageNum: this.pageNum,
            pageSize
          },
          updateQuery: (prevResult, { fetchMoreResult }) => {
            const newPosts = fetchMoreResult.infiniteScrollPosts.posts;
            const hasMore = fetchMoreResult.infiniteScrollPosts.hasMore;
            this.showMoreEnabled = hasMore;

            return {
              infiniteScrollPosts: {
                __typename: prevResult.infiniteScrollPosts.__typename,
                posts: [
                  ...prevResult.infiniteScrollPosts.posts,
                  ...newPosts
                ],
                hasMore
              }
            }
          }
        })
      }
    }
  }
</script>
