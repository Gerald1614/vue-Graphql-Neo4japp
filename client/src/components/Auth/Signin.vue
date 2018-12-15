<template>
  <v-container text-xs-center mt-5 pt-5>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Welcome back !</h1>
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
                  <v-btn 
                  color="accent" 
                  type="submit"
                  :loading="loading"
                  :disabled="!isFormValid || loading"
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
import { onLogin, apolloClient } from '../../vue-apollo.js'


export default {
  name: "Signin",
  data() {
    return {
      email: "",
      password: "",
      error: "",
      loading: false,
      isFormValid: true,
      emailRules: [
        email => !!email || "Email is required",
        email => email.length >3 || "Email must be more than 3 characters"
      ],
      passwordRules: [
        password => !!password || "Password is required",
        password => password.length >3 || "Password must be more than 3 characters"
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
        }).then ((result) => {
        onLogin(apolloClient, result.data.LoginUser.token)
        }).then (() => {
          this.loading = false
          this.$router.push({ name: 'Home'})
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

