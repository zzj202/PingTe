<template>
  <div class="operate-history-container">
    <div class="filter-section">
      <var-select v-model="filterType" placeholder="筛选操作类型" class="filter-select" variant="outlined" size="small">
        <var-option label="全部" value="all" />
        <var-option label="批量下注" value="more" />
        <var-option label="下注" value="bet" />
        <var-option label="减注" value="reduce" />
        <var-option label="包生肖" value="zodiac" />
        <var-option label="赔率设置" value="odds" />
        <var-option label="号码设置" value="numbers" />
      </var-select>
    </div>

    <var-list v-model:loading="loading" :finished="finished" @load="loadMore" class="history-list">
      <var-cell v-for="(record, index) in filteredRecords" :key="index" class="history-item"
        :class="`type-${record.type}`">
        <div class="record-card">
          <div class="record-header">
            <div class="type-badge">
              <var-chip :type="getChipType(record.type)" size="small" round>
                {{ getTypeText(record.type) }}
              </var-chip>
            </div>
            <div class="record-time">
              <var-icon name="clock-time-four-outline" size="16" />
              <span class="time-text">{{ formatTime(record.time) }}</span>
            </div>
          </div>

          <div class="record-content">
            <div class="main-info">
              <div class="description">
                {{ record.description }}
              </div>

              <div class="amount-display" v-if="record.details.amount">
                <span class="amount-label">总金额:</span>
                <span class="amount-value" :class="record.type">
                  {{ calculateTotalAmount(record) }}
                </span>
              </div>
            </div>

            <div class="record-details">
              <div class="detail-row" v-if="record.details.numbers?.length">
                <var-icon name="numeric" size="16" />
                <span class="detail-label">号码:</span>
                <div class="number-bubbles">
                  <span class="number-bubble" v-for="(num, i) in record.details.numbers" :key="i">
                    {{ num }}
                  </span>
                </div>
              </div>

              <div class="detail-row" v-if="record.details.zodiac">
                <var-icon name="zodiac-rat" size="16" />
                <span class="detail-label">生肖:</span>
                <span class="detail-value">{{ record.details.zodiac }}</span>
              </div>
            </div>
          </div>
        </div>
      </var-cell>
    </var-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMainStore } from '@/stores/mainStore'
import dayjs from 'dayjs'

const store = useMainStore()

const filterType = ref('all')
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 20
const allRecords = ref<OperationRecord[]>([])

onMounted(() => {
  loadRecords()
})

const loadRecords = () => {
  if (store.currentChangCi?.operateHistory) {
    allRecords.value = store.currentChangCi.operateHistory
  }
}

const filteredRecords = computed(() => {
  if (filterType.value === 'all') return allRecords.value
  return allRecords.value.filter(r => r.type === filterType.value)
})

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

const getChipType = (type: string) => {
  switch (type) {
    case 'more':
      return 'primary'
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

const getTypeText = (type: string) => {
  switch (type) {
    case 'more':
      return '批量下注'
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

const formatTime = (time: Date) => {
  const formattedTime = dayjs(time).format('MM-DD HH:mm:ss')
  const now = dayjs()
  const diffInMinutes = now.diff(time, 'minute')
  
  let relativeTime = ''
  if (diffInMinutes < 1) {
    relativeTime = '刚刚'
  } else if (diffInMinutes < 60) {
    relativeTime = `${diffInMinutes}分钟前`
  } else if (diffInMinutes < 1440) {
    relativeTime = `${Math.floor(diffInMinutes / 60)}小时前`
  } else {
    relativeTime = `${Math.floor(diffInMinutes / 1440)}天前`
  }
  
  return `${formattedTime} (${relativeTime})`
}

const calculateTotalAmount = (record: OperationRecord) => {
  if (!record.details.amount) return 0
  const numberCount = record.details.numbers?.length || 1
  return record.details.amount * numberCount
}

interface OperationRecord {
  type: 'more' | 'bet' | 'reduce' | 'zodiac' | 'odds' | 'numbers' | 'changci'
  typeText: string
  title: string
  description?: string
  time: Date
  details: {
    numbers?: string[]
    amount?: number
    zodiac?: string
    pingMa?: number
    teMa?: number | string
    oldPingMa?: number
    oldTeMa?: number | string
    pingMaList?: string[]
    changciId?: number
    changciName?: string
    operator?: string
    oldPingMaList?: string[]
  }
}
</script>

<style scoped>
.operate-history-container {
  padding: 0 12px 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.filter-section {
  padding: 16px 0;
  position: sticky;
  top: 0;
  background-color: #f8f9fa;
  z-index: 1;
}

.filter-select {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.history-list {
  margin-top: 8px;
}

.history-item {
  padding: 8px 0;
}

.record-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.record-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.time-text {
  font-size: 14px;
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description {
  font-weight: 500;
  font-size: 15px;
  color: #333;
  flex: 1;
  margin-right: 12px;
}

.amount-display {
  display: flex;
  align-items: center;
  gap: 4px;
}

.amount-label {
  font-size: 12px;
  color: #666;
}

.amount-value {
  font-weight: bold;
  font-size: 16px;
}
.amount-value.more {
  color: var(--color-primary);
}

.amount-value.bet {
  color: var(--color-primary);
}

.amount-value.reduce {
  color: var(--color-danger);
}

.amount-value.zodiac {
  color: var(--color-success);
}

.record-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  color: #666;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.number-bubbles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.number-bubble {
  background-color: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #333;
}

/* 不同类型卡片样式 */
.type-more .record-card {
  border-left: 4px solid var(--color-primary);
}

.type-bet .record-card {
  border-left: 4px solid var(--color-primary);
}

.type-reduce .record-card {
  border-left: 4px solid var(--color-danger);
}

.type-zodiac .record-card {
  border-left: 4px solid var(--color-success);
}

.type-odds .record-card {
  border-left: 4px solid var(--color-warning);
}

.type-numbers .record-card {
  border-left: 4px solid var(--color-info);
}
</style>