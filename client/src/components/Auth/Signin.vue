<template>
  <v-container text-xs-center mt-5 pt-5>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>

      </v-flex>
    </v-layout>
    <v-layout v-if="error" row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <form-alert :message="error"></form-alert>
      </v-flex>
    </v-layout>

    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <v-card color="secondary" dark>
          <v-container>
            <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleSigninUser">
              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="formRules" v-model="email" prepend-icon="face" label="email" type="text" required></v-text-field>
                </v-flex>
              </v-layout>
               <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="formRules" v-model="password" prepend-icon="extension" label="Password" type="password" required></v-text-field>
                </v-flex>
              </v-layout>
               <v-layout row>
                <v-flex xs12>
                  <v-btn 
                  color="accent" 
                  type="submit"
                  :loading="loading"
                  :disabled="!isFormValid"
                  >
                  Sign In
                  </v-btn>
                  <h3>Don't have an Account? 
                    <router-link to="/Signup">Sign Up</router-link>
                  </h3>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script> 
import LoginUser from '../../graphql/loginUser.gql'
import { onLogin } from '../../vue-apollo.js'
import getCurrentUser from '../../graphql/getCurrentUser.gql'


export default {
  name: "Signin",
  data() {
    return {
      email: "",
      password: "",
      error: "",
      loading: false,
      isFormValid: true,
      formRules: [
        email => !!email || "this field is required",
        email => email.length >3 || "must be more than 3 characters"
      ]
    };
  },
  methods: {
    async handleSigninUser() {
      if(!this.$refs.form.validate()) {
        return
      }
      this.error=null
      try {
      localStorage.setItem('apollo-token', "");
      this.loader =true;
        let result = await this.$apollo.mutate({
          mutation: LoginUser,
          variables: {
            email: this.email,
            password: this.password
          }
        })
        const apolloClient = this.$apollo.provider.defaultClient
        const currentUser = this.$apollo
          .query({
            query: getCurrentUser
          })
          .then(user => {
            console.log(user.data.getCurrentUser)
            this.loading = false
          })
          .catch(err => {
            throw new Error('authentication required')
            })
        onLogin(apolloClient, result.data.LoginUser.token)
        .then(() => {
          this.$router.push('/')
        })
        .catch(error => {
        throw new Error('authentication required')
      })
      }
      catch(error) {
        console.log(error)
        this.error = 'authentication failed';

      };
    }
  }
};
</script>
<style lang="stylus">
.custom-loader {
    animation: loader 1s infinite;
    display: flex;
  }
  @-moz-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-webkit-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-o-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

