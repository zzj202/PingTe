<template>
  <div class="zodiac-container">
    <var-table border>
      <thead>
      <tr>
        <th>生肖</th>
        <th>号码</th>
      </tr>
      <tr v-for="item in zodiacGroups" :key="item.name">
        <td>{{ item.name }}</td>
        <th v-for="it in item.numbers" :key="it">
          <NumberMenu :number="it.number"></NumberMenu>
        </th>
      </tr>
      </thead>

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
  console.log(zodiacOrder.map(name => groups[name]))
  return zodiacOrder.map(name => groups[name])
})

// 同前面的 getBeilvTagType 和 getBeilvText 方法
</script>

<style scoped>
.zodiac-group-container {
  margin: 20px;
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.number-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  transition: all 0.3s;
}

.number-card.has-bet {
  border-color: #ff9800;
  background-color: #fff3e0;
}

.number {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.total {
  color: #f44336;
  font-size: 14px;
}

.beilv {
  margin-top: 4px;
}
</style>