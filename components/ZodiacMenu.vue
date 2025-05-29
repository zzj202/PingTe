<template>
  <var-menu-select v-model="value" @select="handleSelect">
    <var-button type="primary">{{ number }}</var-button>
    <template #options>
      <var-menu-option
          v-for="option in options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
      />
    </template>
  </var-menu-select>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useMainStore} from "@/stores/mainStore";

const store = useMainStore()
const props = defineProps({
  number: {
    type: String,
    required: true
  }
})
const value = ref()
const options = [
  {label: '+5', value: 5},
  {label: '+10', value: 10},
  {label: '+20', value: 20},
  {label: '+50', value: 50},
  {label: '+100', value: 100}
]
function handleSelect(value) {
  console.log(value)
  store.updateNumberBet(props.number,value)
}
</script>

<style scoped>

</style>