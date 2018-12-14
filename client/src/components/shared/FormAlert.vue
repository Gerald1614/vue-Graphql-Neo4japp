<template>
  <v-alert type="error" v-model="isVisible" dismissible>
    <h3>{{ message }}</h3>
</v-alert>
</template>

<script>

export default {

  props: ['message'],
  computed: {
      isVisible: function (){ 
         return Boolean(this.message)
  }
}
}
</script>
