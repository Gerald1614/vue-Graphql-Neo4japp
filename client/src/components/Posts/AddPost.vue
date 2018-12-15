<template>
  <v-container text-xs-center mt-5 pt-5>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Add Post</h1>
      </v-flex>
    </v-layout>

    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
            <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleAddPost">
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
               <v-layout row>
                <v-flex xs12>
                  <v-btn 
                  color="info" 
                  type="submit"
                  :loading="loading"
                  :disabled="!isFormValid || loading"
                  >
                  Add Post
                  </v-btn>
   
                </v-flex>
              </v-layout>
            </v-form>

      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import addPost from '../../graphql/addPost.gql'
  export default {
    name: 'AddPost',
    data() {
    return {
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
    };
  },
  methods: {
    async handleAddPost() {
      if(!this.$refs.form.validate()) {
        return
      }
      this.error=null
      this.loader =true;
        await this.$apollo.mutate({
          mutation: addPost,
          variables: {
            title: this.title,
            description: this.description,
            imageUrl: this.imageUrl,
            categories: this.categories
          }
        })
       .then((result) => {
         console.log(result)
          this.loading = false
          this.$router.push('/')
        })
        .catch(error => {
        throw new Error('we could not add the post')  
        })
    }
  }
  }
</script>
