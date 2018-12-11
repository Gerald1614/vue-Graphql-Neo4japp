<template>
  <v-container text-xs-center mt-5 pt-5>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>

      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <v-card color="secondary" dark>
          <v-container>
            <v-form @submit.prevent="handleSigninUser">
              <v-layout row>
                <v-flex xs12>
                  <v-text-field v-model="email" prepend-icon="face" label="email" type="text" required></v-text-field>
                </v-flex>
              </v-layout>
               <v-layout row>
                <v-flex xs12>
                  <v-text-field v-model="password" prepend-icon="extension" label="Password" type="password" required></v-text-field>
                </v-flex>
              </v-layout>
               <v-layout row>
                <v-flex xs12>
                  <v-btn color="accent" type="submit">Sign In</v-btn>
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
import getCurrentUser from '../../mixins/UserCurrent'

export default {
  name: "Signin",
  mixins: [
    getCurrentUser
  ],
  data() {
    return {
      email: "",
      password: ""
    };
  },
  watch: {
    getCurrentUser(value) {
      if(value) {
        this.$router.push('/')
      }
    }
  },
  methods: {
    async handleSigninUser() {
      try {
        let result = await this.$apollo.mutate({
          mutation: LoginUser,
          variables: {
            email: this.email,
            password: this.password
          }
        });
        const apolloClient = this.$apollo.provider.defaultClient
        await onLogin(apolloClient, result.data.LoginUser.token)
        this.$router.go()
      }
      catch(error) {
        console.error(error);
      };
    }
  }
};
</script>
