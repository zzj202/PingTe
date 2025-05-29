<template>
  <div class="zodiac-container">
    <var-table v-for="item in zodiacGroups" :key="item.name">
      <tbody>
      <tr>
        <td>
          <ZodiacMenu :name="item.name"></ZodiacMenu>
        </td>
        <th style="padding:5px 5px 25px 5px" v-for="it in item.numbers" :key="it">

          <var-badge type="danger" position="left-top" :offset-x="25" :offset-y="50"
                     :value="'￥'+store.getBetByNumber(it.number)"
                     :hidden="store.getBetByNumber(it.number)===0">
            <NumberMenu :number="it.number"></NumberMenu>
          </var-badge>
        </th>
      </tr>
      </tbody>
    </var-table>


  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'

import {useMainStore} from "@/stores/mainStore";
import {zodiacOrder} from "@/data/zodiac";

const store = useMainStore()

const zodiacData = ref(store.currentZodiacData)


const zodiacGroups = computed(() => {
  // 先创建空组，确保顺序
  const groups: Record<string, { name: string; numbers: any[] }> = {}

  zodiacOrder.forEach(name => {
    groups[name] = {
      name,
      numbers: []
    }
  })
  // 填充数据
  zodiacData.value.forEach(item => {
    if (groups[item.name]) {
      groups[item.name].numbers.push(item)
    }
  })
  // 按预定顺序返回
  return zodiacOrder.map(name => groups[name])
})

// 同前面的 getBeilvTagType 和 getBeilvText 方法
</script>

<style scoped>

</style>