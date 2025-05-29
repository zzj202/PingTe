<!-- RealTimeClock.vue -->
<template>
  <span>{{ currentTime }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'

const currentTime = ref(dayjs().format('MM月DD日 HH:mm:ss'))

let timer: number

const updateTime = () => {
  currentTime.value = dayjs().format('MM月DD日 HH:mm:ss')
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>