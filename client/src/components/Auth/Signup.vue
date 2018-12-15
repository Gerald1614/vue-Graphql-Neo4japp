<template>
  <v-container text-xs-center mt-5 pt-5>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Get started here</h1>
      </v-flex>
    </v-layout>
    <v-layout v-if="error" row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <form-alert :message="error"></form-alert>
      </v-flex>
    </v-layout>

    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <v-card color="accent" dark>
          <v-container>
            <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleSignupUser">
              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="usernameRules" v-model="username" prepend-icon="face" label="username" type="text" required></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="emailRules" v-model="email" prepend-icon="face" label="email" type="email" required></v-text-field>
                </v-flex>
              </v-layout>
               <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="passwordRules" v-model="password" prepend-icon="extension" label="Password" type="password" required></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="passwordRules" v-model="passwordConfirmation" prepend-icon="gavel" label="Confirm Password" type="password" required></v-text-field>
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
                  Sign Up
                  </v-btn>
                  <h3>Already  have an Account? 
                    <router-link to="/Signin">Sign In</router-link>
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
import signUp from '../../graphql/signUp.gql'
import { onLogin, apolloClient } from '../../vue-apollo.js'
import getCurrentUser from '../../graphql/getCurrentUser.gql'


export default {
  name: "Signup",
  data() {
    return {
      username:"",
      email: "",
      password: "",
      passwordConfirmation:"",
      error: "",
      loading: false,
      isFormValid: true,
      usernameRules: [
        username => !!username || "Username is required",
        username => username.length >3 || "Username must be more than 3 characters"
      ],
      emailRules: [
        email => !!email || "Email is required",
        email => /.@+./.test(email) || "Email must be valid"
      ],
       passwordRules: [
        password => !!password || "Password is required",
        password => password.length >3 || "Password must be more than 3 characters",
        passwordConfirmation => passwordConfirmation === this.password || "passwords must match"
      ]
    };
  },
  methods: {
    async handleSignupUser() {
      if(!this.$refs.form.validate()) {
        return
      }
      this.error=null
      try {
      localStorage.setItem('apollo-token', "");
      this.loader =true;
        await this.$apollo.mutate({
          mutation: signUp,
          variables: {
            userName: this.username,
            email: this.email,
            password: this.password
          }
        })
       .then((result) => {
         console.log(result)
        onLogin(apolloClient, result.data.CreateUser.token)
       }).then(() => {
          this.loading = false
          this.$router.push('/')
        })
        .catch(error => {
        throw new Error('registration failed')
      })
        
      }
      catch(error) {
        console.log(error)
        this.error = 'registration failed';

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

