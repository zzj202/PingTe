<template>
  <div class="operate-history-container">
    <div class="filter-section">
      <var-select v-model="filterType" placeholder="筛选操作类型" class="filter-select" variant="outlined" size="small">
        <var-option label="全部" value="all" />
        <var-option label="直选" value="direct" />
        <var-option label="尾数" value="tail" />
        <var-option label="生肖" value="zodiac" />
        <var-option label="撤销" value="undo" />
        <var-option label="场次设置" value="setting" />
      </var-select>


    </div>

    <var-list v-model:loading="loading" :finished="finished" @load="loadMore" class="history-list">
      <transition-group name="list" tag="div">
        <var-cell v-for="(record, index) in filteredRecords" :key="record.id || index" class="history-item">
          <div class="record-card" :class="`type-${getRecordType(record)}`" @click="toggleDetails(index)">
            <div class="record-header">
              <div class="type-badge">
                <var-chip :type="getChipType(getRecordType(record))" size="small" round :outline="record.isUndo">
                  {{ getTypeText(record) }}
                </var-chip>
              </div>
              <div class="record-time">
                <var-icon name="clock-time-four-outline" size="16" />
                <span class="time-text">{{ formatTime(record.timestamp || Date.now()) }}</span>
              </div>
            </div>

            <div class="record-content">
              <div class="main-info">
                <div class="description">
                  {{ record.description || getBetDescription(record) }}
                </div>
                <div class="amount-display" v-if="hasAmount(record)">
                  <span class="amount-label">单注金额</span>
                  <span class="amount-value" style="color: tan;">
                    {{ Math.abs(record.betCount || 0) }}
                  </span>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span class="amount-label"> 总金额</span>
                  <span class="amount-value" :class="getRecordType(record)">
                    ¥{{ Math.abs(record.betCount || 0) * (record.numbers?.length || 1) }}
                  </span>
                </div>
              </div>

              <div class="record-details" :class="{ 'expanded': isExpanded(index) }">
                <div class="details-content">
                  <template v-if="record.type === 'name'">
                    <div class="detail-row">
                      <var-icon name="form-textbox" size="16" />
                      <span class="detail-label">原名称:</span>
                      <span class="detail-value">{{ record.details.oldName }}</span>
                    </div>
                    <div class="detail-row">
                      <var-icon name="form-textbox" size="16" />
                      <span class="detail-label">新名称:</span>
                      <span class="detail-value">{{ record.details.newName }}</span>
                    </div>
                  </template>

                  <template v-else-if="record.type === 'zhongjiang'">
                    <div class="detail-row">
                      <var-icon name="numeric" size="16" />
                      <span class="detail-label">平码:</span>
                      <div class="number-bubbles">
                        <template v-if="record.details.oldPingMa?.length">
                          <span class="number-bubble" v-for="(num, i) in record.details.oldPingMa" :key="i">
                            {{ num }}
                          </span>
                        </template>
                        <span v-else>无</span>
                        <var-icon name="chevron-right" :size="20" />
                        <span class="number-bubble" v-for="(num, i) in record.details.newPingMa" :key="i">
                          {{ num }}
                        </span>
                      </div>
                    </div>
                    <div class="detail-row">
                      <var-icon name="numeric" size="16" />
                      <span class="detail-label">特码:</span>
                      <span class="detail-value">{{ record.details.oldTeMa || '无' }}</span>
                      <var-icon name="arrow-right" size="16" />
                      <span class="detail-value">{{ record.details.newTeMa }}</span>
                    </div>
                  </template>

                  <template v-else>
                    <div class="detail-row" v-if="record.numbers?.length">
                      <var-icon name="numeric" size="16" />
                      <span class="detail-label">号码:</span>
                      <div class="number-bubbles">
                        <span class="number-bubble" v-for="(num, i) in record.numbers" :key="i" :class="{
                          'red': num % 2 === 1,
                          'blue': num % 2 === 0
                        }">
                          {{ num }}
                        </span>
                      </div>
                    </div>

                    <div class="detail-row" v-if="record.betTarget">
                      <var-icon :name="getTargetIcon(record.betType)" size="16" />
                      <span class="detail-label">{{ getTargetLabel(record.betType) }}:</span>
                      <span class="detail-value">{{ record.betTarget }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </var-cell>
      </transition-group>
    </var-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import type { OperationRecord } from '~/types/zodiac'

const store = useMainStore()

const filterType = ref('all')
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 20
const expandedIndex = ref<number | null>(null)

const allRecords = ref<OperationRecord[]>([])

// 默认展开所有卡片
const isExpanded = (index: number) => {
  return expandedIndex.value === null || expandedIndex.value === index
}

const filteredRecords = computed(() => {
  if (filterType.value === 'all') return allRecords.value
  if (filterType.value === 'undo') return allRecords.value.filter(r => r.isUndo)
  if (filterType.value === 'setting') return allRecords.value.filter(r => ['name', 'beilv', 'zhongjiang'].includes(r.type))
  return allRecords.value.filter(r => r.betType === filterType.value && !r.isUndo)
})


onMounted(() => {
  loadRecords()
})

const loadRecords = () => {
  if (store.currentChangCi?.operateHistory) {
    allRecords.value = [...store.currentChangCi.operateHistory]
  }
}

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

const toggleDetails = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const formattedTime = dayjs(date).format('MM-DD HH:mm:ss')
  const now = dayjs()
  const diffInMinutes = now.diff(date, 'minute')

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

const getBetDescription = (record: any) => {
  if (record.isUndo) {
    return `撤销 ${getOriginalBetDescription(record)}`
  }

  switch (record.betType) {
    case 'direct':
      return `直选号码 ${record.numbers?.join(', ')}`
    case 'tail':
      return `尾数 ${record.betTarget} 的所有号码`
    case 'zodiac':
      return `生肖 ${record.betTarget} 的所有号码`
    default:
      return record.description || '操作记录'
  }
}

const getOriginalBetDescription = (record: any) => {
  switch (record.betType) {
    case 'direct':
      return `直选号码 ${record.numbers?.join(', ')}`
    case 'tail':
      return `尾数 ${record.betTarget} 的所有号码`
    case 'zodiac':
      return `生肖 ${record.betTarget} 的所有号码`
    default:
      return '操作'
  }
}

const getRecordType = (record: any) => {
  if (record.isUndo) return 'undo'
  if (record.betType) return record.betType
  return record.type || 'setting'
}

const getTypeText = (record: any) => {
  if (record.typeText) return record.typeText
  return getBetTypeText(getRecordType(record))
}

const getBetTypeText = (type: string) => {
  switch (type) {
    case 'direct':
      return '直选'
    case 'tail':
      return '尾数'
    case 'zodiac':
      return '生肖'
    case 'undo':
      return '撤销'
    case 'name':
      return '场次名称'
    case 'beilv':
      return '赔率设置'
    case 'zhongjiang':
      return '中奖号码'
    default:
      return type
  }
}

const getChipType = (type: string) => {
  switch (type) {
    case 'direct':
      return 'primary'
    case 'tail':
      return 'warning'
    case 'zodiac':
      return 'success'
    case 'undo':
      return 'danger'
    case 'name':
      return 'info'
    case 'beilv':
      return 'info'
    case 'zhongjiang':
      return 'info'
    default:
      return ''
  }
}

const getTargetIcon = (type: string) => {
  switch (type) {
    case 'tail':
      return 'sort-numeric-descending'
    case 'zodiac':
      return 'zodiac-rat'
    case 'undo':
      return 'undo'
    default:
      return 'information'
  }
}

const getTargetLabel = (type: string) => {
  switch (type) {
    case 'tail':
      return '尾数'
    case 'zodiac':
      return '生肖'
    case 'undo':
      return '撤销'
    default:
      return '目标'
  }
}

// 判断记录是否有金额
const hasAmount = (record: any) => {
  return record.betCount !== undefined && record.betCount !== null
}
</script>

<style scoped>
.operate-history-container {
  padding: 0 12px 20px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  top: 0;
  background-color: #f8fafc;
  z-index: 10;
}

.filter-select {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  flex: 1;
  max-width: 200px;
}

.total-amount {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.total-label {
  font-size: 14px;
  color: #64748b;
}

.total-value {
  font-weight: bold;
  font-size: 16px;
  color: var(--color-primary);
}

.history-list {
  margin-top: 8px;
}

.history-item {
  padding: 8px 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.record-card {
  background-color: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-left: 4px solid var(--color-primary);
  cursor: pointer;
  overflow: hidden;
}

.record-card.type-tail {
  border-left-color: var(--color-warning);
}

.record-card.type-zodiac {
  border-left-color: var(--color-success);
}

.record-card.type-undo {
  border-left-color: var(--color-danger);
  background-color: rgba(239, 68, 68, 0.05);
}

.record-card.type-name {
  border-left-color: var(--color-info);
}

.record-card.type-beilv {
  border-left-color: var(--color-primary);
}

.record-card.type-zhongjiang {
  border-left-color: var(--color-success);
  background-color: rgba(16, 185, 129, 0.05);
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.record-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.time-text {
  font-size: 13px;
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
  color: #1e293b;
  flex: 1;
  margin-right: 12px;
}

.amount-display {
  display: flex;
  align-items: center;
  gap: 6px;
}

.amount-label {
  font-size: 12px;
  color: #64748b;
}

.amount-value {
  font-weight: bold;
  font-size: 16px;
}

.amount-value.direct {
  color: var(--color-primary);
}

.amount-value.tail {
  color: var(--color-warning);
}

.amount-value.zodiac {
  color: var(--color-success);
}

.amount-value.undo {
  color: var(--color-danger);
}

.record-details {
  max-height: 500px;
  /* 默认展开 */
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.record-details:not(.expanded) {
  max-height: 0;
  transition: max-height 0.3s ease-out;
}

.details-content {
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-label {
  color: #64748b;
  font-size: 13px;
  min-width: 60px;
}

.detail-value {
  color: #1e293b;
  font-weight: 500;
  font-size: 13px;
}

.number-bubbles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.number-bubble {
  background-color: #f1f5f9;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.2s;
}

.number-bubble.red {
  background-color: #fee2e2;
  color: #b91c1c;
}

.number-bubble.blue {
  background-color: #dbeafe;
  color: #1d4ed8;
}

@media (max-width: 600px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-select {
    max-width: 100%;
  }

  .total-amount {
    align-self: flex-end;
  }

  .main-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .amount-display {
    align-self: flex-end;
  }

  .time-text {
    font-size: 12px;
  }
}
</style>