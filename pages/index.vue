<template>

</template>
<script setup lang="ts">
definePageMeta({
  middleware: (to) => {
    console.log(to.meta)
    if (to.path === '/' || to.path === '') {
      return navigateTo('/mobile/main')
    }
  }
})

</script>
<style scoped>

</style>