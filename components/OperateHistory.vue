<template>
  <div class="operate-history-container">
    <div class="filter-section">
      <var-select
          v-model="filterType"
          placeholder="筛选操作类型"
          class="filter-select">
        <var-option label="全部" value="all"/>
        <var-option label="下注" value="bet"/>
        <var-option label="减注" value="reduce"/>
        <var-option label="包生肖" value="zodiac"/>
        <var-option label="赔率设置" value="odds"/>
        <var-option label="号码设置" value="numbers"/>
      </var-select>
    </div>

    <var-list
        v-model:loading="loading"
        :finished="finished"
        @load="loadMore"
        class="history-list">
      <var-cell
          v-for="(record, index) in filteredRecords"
          :key="index"
          class="history-item"
          :class="{
          'bet-item': record.type === 'bet',
          'reduce-item': record.type === 'reduce',
          'zodiac-item': record.type === 'zodiac',
          'odds-item': record.type === 'odds',
          'numbers-item': record.type === 'numbers'
        }"
      >
        <div class="record-header">
          <var-chip :type="getChipType(record.type)" size="small">
            {{ getTypeText(record.type) }}
          </var-chip>
          <span class="record-time">{{ formatTime(record.time) }}</span>
        </div>

        <div class="record-content">
          <!-- 金额显示 -->
          <div class="odds-display" v-if="['bet', 'reduce', 'zodiac'].includes(record.type)">
            {{ record.description }}
          </div>

          <!-- 赔率显示 -->
          <div class="odds-display" v-if="record.type === 'odds'">
            <div>{{ record.description }}</div>
          </div>

          <!-- 号码显示 -->
          <div class="numbers-display" v-if="record.type === 'numbers'">
            <div>{{ record.description }}</div>
          </div>

          <!-- 详细信息 -->
          <div class="record-details">
            <!-- 号码信息 -->
            <div class="detail-row" v-if="record.numbers?.length">
              <span class="detail-label">号码:</span>
              <span class="detail-value">{{ record.numbers.join(', ') }}</span>
            </div>

            <!-- 生肖信息 -->
            <div class="detail-row" v-if="record.zodiac">
              <span class="detail-label">生肖:</span>
              <span class="detail-value">{{ record.zodiac }}</span>
            </div>

            <!-- 操作人信息 -->
            <div class="detail-row" v-if="record.operator">
              <span class="detail-label">操作人:</span>
              <span class="detail-value">{{ record.operator }}</span>
            </div>
          </div>
        </div>
      </var-cell>
    </var-list>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useMainStore} from '@/stores/mainStore'
import dayjs from 'dayjs'

const store = useMainStore()

// 筛选条件
const filterType = ref('all')

// 分页状态
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 20

// 操作记录数据
const allRecords = ref<OperateRecord[]>([])

// 从store获取操作记录
onMounted(() => {
  loadRecords()
})

const loadRecords = () => {
  if (store.currentChangCi?.operateHistory) {
    allRecords.value = store.currentChangCi.operateHistory
  }
}

// 筛选后的记录
const filteredRecords = computed(() => {
  if (filterType.value === 'all') return allRecords.value
  return allRecords.value.filter(r => r.type === filterType.value)
})

// 加载更多数据
const loadMore = () => {
  setTimeout(() => {
    if (page.value * pageSize < allRecords.value.length) {
      page.value++
    } else {
      finished.value = true
    }
    loading.value = false
  }, 500)
}

// 获取标签类型
const getChipType = (type: string) => {
  switch (type) {
    case 'bet':
      return 'primary'
    case 'reduce':
      return 'danger'
    case 'zodiac':
      return 'success'
    case 'odds':
      return 'warning'
    case 'numbers':
      return 'info'
    default:
      return ''
  }
}

// 获取类型文本
const getTypeText = (type: string) => {
  switch (type) {
    case 'bet':
      return '下注'
    case 'reduce':
      return '减注'
    case 'zodiac':
      return '包生肖'
    case 'odds':
      return '赔率设置'
    case 'numbers':
      return '号码设置'
    default:
      return ''
  }
}

// 格式化时间显示
const formatTime = (time: Date) => {
  return dayjs(time).format('MM-DD HH:mm:ss')
}


// 类型定义

interface OperationRecord {
  type: 'bet' | 'reduce' | 'zodiac' | 'odds' | 'numbers' | 'changci'
  typeText: string
  title: string
  description?: string
  time: Date
  details: {
    numbers?: string[]
    amount?: number
    zodiac?: string
    pingMa?: number  //平码倍率
    teMa?: number | string  //特码倍率
    oldPingMa?: number  //旧的
    oldTeMa?: number | string    //旧的
    pingMaList?: string[]  //平码
    changciId?: number  //场次ID
    changciName?: string
    operator?: string
    oldPingMaList?: string[]


  }
}
</script>

<style scoped>
.operate-history-container {
  padding-bottom: 20px;
}

.filter-section {
  padding: 12px;
  background-color: #f8f9fa;
}

.history-list {
  margin-top: 8px;
}

.history-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 16px;
}

.bet-item {
  background-color: #f5f9ff;
}

.reduce-item {
  background-color: #fff5f5;
}

.zodiac-item {
  background-color: #f5fff5;
}

.odds-item {
  background-color: #fffcf5;
}

.numbers-item {
  background-color: #f5f5ff;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-time {
  font-size: 12px;
  color: #888;
}

.record-content {
  display: flex;
  gap: 16px;
}

.amount-display {
  font-size: 18px;
  font-weight: bold;
  min-width: 80px;
}

.bet-item .amount-display {
  color: var(--color-primary);
}

.reduce-item .amount-display {
  color: var(--color-danger);
}

.zodiac-item .amount-display {
  color: var(--color-success);
}

.odds-display {
  min-width: 120px;
  font-weight: bold;
}

.numbers-display {
  min-width: 200px;
}

.record-details {
  flex: 1;
}

.detail-row {
  display: flex;
  margin-bottom: 4px;
  font-size: 14px;
}

.detail-label {
  color: #666;
  min-width: 50px;
}

.detail-value {
  color: #333;
}
</style>