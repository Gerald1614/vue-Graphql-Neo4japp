<template>
  
</template>
<script>
import { onLogout } from '../../vue-apollo.js'
import getCurrentUser from '../../graphql/getCurrentUser.gql'

export default {
  created() {
    const apolloClient = this.$apollo.provider.defaultClient
    onLogout(apolloClient)
    .then(() => this.$router.push('/')) 
  }  
}
</script>