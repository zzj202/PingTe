<template>
  <div class="zodiac-container">
    <var-table border>
      <thead>
      <tr>
        <th>号码</th>
        <th>生肖</th>
        <th>投注</th>
        <th>赔率</th>
        <th>赔额</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in zodiacData" :key="item.number"
          :class="{ 'highlight-row': item.total > 0 }">
        <th>
          <NumberMenu :number="item.number"></NumberMenu>
        </th>
        <th>
          <ZodiacMenu :name="item.name"></ZodiacMenu>
        </th>
        <th>
          <span v-if="item.total > 0" class="total-bet">￥{{ item.total }}</span>
          <span v-else class="no-bet"></span>
        </th>
        <th>
          <var-chip v-if="item.beilv !== undefined&&item.beilv!==0" :type="getBeilvTagType(item.beilv)">
            {{ item.beilv }}
          </var-chip>
        </th>
        <th>
          <span v-if="item.peiTotal!==0&&item.peiTotal">￥{{ item.peiTotal }}</span>
        </th>
      </tr>
      </tbody>
    </var-table>
  </div>
</template>

<script setup lang="ts">
import {useMainStore} from "@/stores/mainStore";

const store = useMainStore()

const zodiacData = computed(() => store.currentZodiacData)

// 获取赔率标签类型
function getBeilvTagType(beilv: number) {
  if (beilv < 10) {
    return 'warning';
  } else if (beilv > 10) {
    return 'danger';
  }
  return 'info';
}
</script>

<style scoped>
.zodiac-container {

  max-height: 80vh;
  overflow-y: auto;
}

.highlight-row {
  background-color: rgba(255, 243, 224, 0.5);
}

.total-bet {
  color: #f44336;
  font-weight: bold;
}

.no-bet {
  color: #999;
}

.var-table {
  width: 100%;
  border-collapse: collapse;
}

.var-table th, .var-table td {
  padding: 12px 16px;
  text-align: center;
}

.var-table th {
  background-color: #f5f5f5;
  font-weight: 500;
}
</style>