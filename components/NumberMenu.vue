<template>
  <var-menu-select v-model="value" @select="handleSelect" placement="right-end">
    <var-button :type="buttonType">{{ number }}</var-button>
    <template #options>
      <var-menu-option v-for="option in options" :key="option.value" :label="option.label" :value="option.value" />
    </template>
  </var-menu-select>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMainStore } from "@/stores/mainStore"
import { Snackbar, Dialog } from '@varlet/ui'
import dayjs from 'dayjs'

const store = useMainStore()
const props = defineProps({
  number: {
    type: String,
    required: true
  }
})

// 判断是否为平码
const isPingMa = computed(() => {
  return store.currentChangCi?.pingMaList?.includes(props.number)
})

// 判断是否为特码
const isTeMa = computed(() => {
  return store.currentChangCi?.teMa === props.number
})

// 根据号码类型设置按钮样式
const buttonType = computed(() => {
  if (isTeMa.value) return 'danger'  // 特码显示红色
  if (isPingMa.value) return 'warning' // 平码显示橙色
  return 'primary' // 默认样式
})

const value = ref()
const options = [
  { label: '-1', value: -1 },
  { label: '-5', value: -5 },
  { label: '-10', value: -10 },
  { label: '-50', value: -50 },
  { label: '===分割线', value: 0 },
  { label: '+1', value: 1 },
  { label: '+5', value: 5 },
  { label: '+10', value: 10 },
  { label: '+20', value: 20 },
  { label: '+50', value: 50 },
  { label: '+100', value: 100 },


]

async function handleSelect(value: number) {
  Snackbar.allowMultiple(true)
  // 检查绝对值是否>=10
  if (Math.abs(value) >= 10) {
    const action = await Dialog({
      title: `确认${isTeMa.value ? '特码' : isPingMa.value ? '平码' : ''}${value > 0 ? '加' : '减'}注`,
      message: `您确定要对${isTeMa.value ? '特码' : isPingMa.value ? '平码' : '号码'} ${props.number} ${value > 0 ? '加' : '减'}注 ${Math.abs(value)} 元吗？`,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    if (action !== 'confirm') return
  }

  // 执行加减注逻辑
  if (value > 0) {
    const message = `${dayjs().format('HH:mm:ss--')} ${props.number}号加注${value}元`
    Snackbar.success(message)
  } else if (value < 0) {
    if (store.getBetByNumber(props.number) + value < 0) {
      Snackbar.error(`${props.number}号减注失败。注额不足`)
      return
    }
    const message = `${dayjs().format('HH:mm:ss--')} ${props.number}号减注${Math.abs(value)}元`
    Snackbar.warning(message)
  } else {
    Snackbar.warning('此操作无效')
  }
  console.log(store.currentChangCi)
  store.updateNumberBet(props.number, value)
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>