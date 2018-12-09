<template>
 <v-container text-xs-center >
   <ApolloQuery :query="require('../graphql/getPosts.gql')">
    <template slot-scope="{result: {loading, error, data } }"> 
      <div v-if="loading">Loading...</div>
      <div v-else-if="error"> an error occured</div>
       <v-flex v-else-if="data" xs12>
        <v-carousel v-bind="{ 'cycle': true }" interval="3000">
          <v-carousel-item v-for="post in data.getPosts" :key="post.id" :src="post.imageUrl">
            <h1 id="carousel__title">{{ post.title }}</h1>
          </v-carousel-item>
        </v-carousel>
      </v-flex>
    </template>
   </ApolloQuery>

 </v-container>

</template>

<script>
export default {
  name: "Home",
  data() {
    return {};
  }
};
</script>

<style lang="stylus">
#carousel__title
  position: absolute;
  background-color: rgba(0,0,0,0.5);
  color: white;
  border-radius: 5px 5px 0 0;
  padding: 0.5em;
  margin: 0 auto ;
  bottom: 40px;
  left: 0;
  right: 0;
</style>
