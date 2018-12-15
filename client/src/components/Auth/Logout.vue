<template>
  
</template>
<script>
import { onLogout, apolloClient } from '../../vue-apollo.js'

export default {
  async created() {    
    await onLogout(apolloClient)
    .then(() => {
      this.$router.push({ name: 'Home'})
    })
    
  }  
}
</script>