<template>
  <div class="zodiac-container">
    <!-- 十二生肖按钮行 -->
    <div class="zodiac-buttons">
      <var-button 
        v-for="zodiac in zodiacList" 
        :key="zodiac.name"
        type="primary"
        class="zodiac-btn"
        @click="handleZodiacClick(zodiac)"
      >
        {{ zodiac.name }} ({{ zodiac.number }})
      </var-button>
    </div>
    
    <!-- 数字按钮网格 -->
    <div class="number-grid">
      <div 
        v-for="num in 49" 
        :key="num"
        class="number-cell"
        @click="handleNumberClick(num)"
      >
        <var-button type="primary" class="number-btn">
          {{ num.toString().padStart(2, '0') }}
        </var-button>
      </div>
    </div>
    
    <!-- 投注信息表格 -->
    <var-table border class="bet-table">
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
          <td>
            <NumberMenu :number="item.number"></NumberMenu>
          </td>
          <td>
            <ZodiacMenu :name="item.name"></ZodiacMenu>
          </td>
          <td>
            <span v-if="item.total > 0" class="total-bet">￥{{ item.total }}</span>
            <span v-else class="no-bet"></span>
          </td>
          <td>
            <var-chip v-if="item.beilv !== undefined&&item.beilv!==0" :type="getBeilvTagType(item.beilv)">
              {{ item.beilv }}
            </var-chip>
          </td>
          <td>
            <span v-if="item.peiTotal!==0&&item.peiTotal">￥{{ item.peiTotal }}</span>
          </td>
        </tr>
      </tbody>
    </var-table>
  </div>
</template>

<script setup lang="ts">
import {useMainStore} from "@/stores/mainStore";
import { ref, computed } from 'vue';

const store = useMainStore()

const zodiacData = computed(() => store.currentZodiacData)

// 十二生肖列表
const zodiacList = ref([
  { name: '鼠', number: '01,13,25,37,49' },
  { name: '牛', number: '02,14,26,38' },
  { name: '虎', number: '03,15,27,39' },
  { name: '兔', number: '04,16,28,40' },
  { name: '龙', number: '05,17,29,41' },
  { name: '蛇', number: '06,18,30,42' },
  { name: '马', number: '07,19,31,43' },
  { name: '羊', number: '08,20,32,44' },
  { name: '猴', number: '09,21,33,45' },
  { name: '鸡', number: '10,22,34,46' },
  { name: '狗', number: '11,23,35,47' },
  { name: '猪', number: '12,24,36,48' }
]);

// 获取赔率标签类型
function getBeilvTagType(beilv: number) {
  if (beilv < 10) {
    return 'warning';
  } else if (beilv > 10) {
    return 'danger';
  }
  return 'info';
}

function handleZodiacClick(zodiac: any) {
  // 处理生肖点击逻辑
  console.log('选中生肖:', zodiac.name);
}

function handleNumberClick(num: number) {
  // 处理数字点击逻辑
  console.log('选中号码:', num);
}
</script>

<style scoped>
.zodiac-container {
  padding: 16px;
  max-height: 80vh;
  overflow-y: auto;
}

.zodiac-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.zodiac-btn {
  flex: 1;
  min-width: calc(25% - 8px);
  max-width: calc(25% - 8px);
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.number-cell {
  aspect-ratio: 1;
}

.number-btn {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.bet-table {
  width: 100%;
  margin-top: 16px;
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

.var-table th, .var-table td {
  padding: 12px 16px;
  text-align: center;
}

.var-table th {
  background-color: #f5f5f5;
  font-weight: 500;
}
</style>