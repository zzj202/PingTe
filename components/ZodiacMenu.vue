<template>
  <var-menu-select v-model="value" @select="handleSelect" placement="right-end">
    <var-button type="default">{{ name }}</var-button>
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
import {Snackbar} from '@varlet/ui'
import dayjs from 'dayjs'

const store = useMainStore()
const props = defineProps({
  name: {
    type: String,
    required: true
  }
})
const value = ref()
const options = [
  {label: '各包5', value: 5},
  {label: '各包10', value: 10},
  {label: '各包20', value: 20},
  {label: '各包50', value: 50},
  {label: '各包100', value: 100},
]
//下注
async function handleSelect(value: any) {
  Snackbar.allowMultiple(true)
  const action = await Dialog({
    title: '确认操作',
    message: `包生肖${props.name} 的 ${store.getNumbersByZodiac(props.name)} 号码各 ${Math.abs(value)} 元？ 将花费${store.getNumbersByZodiac(props.name).length * value}元确定吗？`,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })

  // 如果用户取消操作，直接返回
  if (action !== 'confirm') {
    return
  }
  if (value > 0) {
    Snackbar.success(dayjs().format('HH:mm:ss--') + props.name + "  各包" + value + "元成功")
  } else if (value === 0) {
    Snackbar.warning('此操作无效')
  }
  store.updateZodiacBet(props.name, value)
}
</script>

<style scoped>

</style>