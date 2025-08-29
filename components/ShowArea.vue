<template>
    <div class="zodiac-container">
        <div class="filter-section">
            <var-select v-model="sortField" placeholder="排序方式" class="filter-select" variant="outlined" size="small">
                <var-option label="默认排序" value="number" />
                <var-option label="按金额排序" value="total" />
            </var-select>
            
            <var-select v-model="filterType" placeholder="筛选类型" class="filter-select" variant="outlined" size="small">
                <var-option label="全部" value="all" />
                <var-option label="平码" value="ping" />
                <var-option label="特码" value="te" />
                <var-option label="普通号码" value="normal" />
            </var-select>
            
            <var-button size="small" @click="exportData">导出数据</var-button>
        </div>

        <div class="stats-section">
            <div class="stat-card total">
                <div class="stat-title">总金额</div>
                <div class="stat-number">{{ amountStats.total }}</div>
            </div>
            
            <div class="stat-card highest">
                <div class="stat-title">最高金额</div>
                <div class="stat-number">{{ amountStats.highest }}</div>
            </div>
            
            <div class="stat-card count-5000">
                <div class="stat-title">≥5000</div>
                <div class="stat-number">{{ amountStats.count5000 }}</div>
            </div>
            
            <div class="stat-card count-2000">
                <div class="stat-title">≥2000</div>
                <div class="stat-number">{{ amountStats.count2000 }}</div>
            </div>
            
            <div class="stat-card count-1000">
                <div class="stat-title">≥1000</div>
                <div class="stat-number">{{ amountStats.count1000 }}</div>
            </div>
            
            <div class="stat-card count-500">
                <div class="stat-title">≥500</div>
                <div class="stat-number">{{ amountStats.count500 }}</div>
            </div>
        </div>

        <div class="zodiac-grid">
            <div v-for="item in filteredData" :key="item.number" class="zodiac-card" 
                 :class="[getAmountClass(item.total), getZodiacTypeClass(item.number)]">
                <div class="zodiac-header">
                    <span class="zodiac-number">{{ item.number }}</span>
                    <span class="zodiac-name">{{ item.name }}</span>
                </div>

                <div v-if="item.total" class="zodiac-content">
                    <div class="amount-row">
                        <span class="value">{{ formatAmount(item.total) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const store = useMainStore()

const zodiacData = computed(() => store.currentZodiacData)
const pingMa = ref(store.currentChangCi?.pingMaList || [])
const teMa = ref(store.currentChangCi?.teMa || '')

// 排序和筛选
const sortField = ref<'number' | 'total'>('number')
const filterType = ref<'all' | 'ping' | 'te' | 'normal'>('all')

// 排序后的数据
const sortedData = computed(() => {
    const data = [...zodiacData.value]

    switch (sortField.value) {
        case 'number':
            return data.sort((a, b) => parseInt(a.number) - parseInt(b.number))
        case 'total':
            return data.sort((a, b) => b.total - a.total)
        default:
            return data
    }
})

// 筛选后的数据
const filteredData = computed(() => {
    if (filterType.value === 'all') return sortedData.value
    if (filterType.value === 'ping') return sortedData.value.filter(item => pingMa.value.includes(item.number))
    if (filterType.value === 'te') return sortedData.value.filter(item => teMa.value === item.number)
    return sortedData.value.filter(item => !pingMa.value.includes(item.number) && teMa.value !== item.number)
})

// 金额统计
const amountStats = computed(() => {
    const stats = {
        total: '0',
        highest: '0',
        count5000: 0,
        count2000: 0,
        count1000: 0,
        count500: 0
    }
    
    if (filteredData.value.length > 0) {
        const totals = filteredData.value.map(item => item.total)
        stats.total = totals.reduce((a, b) => a + b, 0).toLocaleString('zh-CN')
        stats.highest = Math.max(...totals).toLocaleString('zh-CN')
        stats.count5000 = totals.filter(t => t >= 5000).length
        stats.count2000 = totals.filter(t => t >= 2000).length
        stats.count1000 = totals.filter(t => t >= 1000).length
        stats.count500 = totals.filter(t => t >= 500).length
    }
    
    return stats
})

// 导出数据
function exportData() {
    const headers = ['号码', '生肖', '金额']
    const csvContent = [
        headers.join(','),
        ...filteredData.value.map(item => 
            [item.number, item.name, item.total].join(',')
        )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${store.currentChangCi.name}_数据_${new Date().toLocaleString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// 格式化金额显示
const formatAmount = (amount: number) => {
    return amount.toLocaleString('zh-CN')
}

// 根据金额获取样式类
const getAmountClass = (amount: number) => {
    if (amount >= 5000) return 'amount-super-high'
    if (amount >= 2000) return 'amount-high'
    if (amount >= 1000) return 'amount-medium'
    if (amount >= 500) return 'amount-low'
    return 'amount-default'
}

// 根据号码类型获取样式类
const getZodiacTypeClass = (number: string) => {
    if (teMa.value === number) return 'zodiac-te'
    if (pingMa.value.includes(number)) return 'zodiac-ping'
    return ''
}
</script>

<style scoped>
.zodiac-container {
    padding: 12px;
    max-width: 800px;
    margin: 0 auto;
}

.filter-section {
    margin-bottom: 15px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
}

.filter-select {
    width: 150px;
}

.stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
}

.stat-card {
    background: white;
    border-radius: 10px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    text-align: center;
    transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-title {
    font-size: 13px;
    color: #666;
    margin-bottom: 6px;
}

.stat-number {
    font-weight: bold;
    font-size: 18px;
}

/* 统计卡片颜色 */
.stat-card.total {
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-left: 4px solid #0369a1;
}

.stat-card.highest {
    background: linear-gradient(135deg, #fff1f2, #ffe4e6);
    border-left: 4px solid #be123c;
}

.stat-card.count-5000 {
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    border-left: 4px solid #6d28d9;
}

.stat-card.count-2000 {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    border-left: 4px solid #047857;
}

.stat-card.count-1000 {
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border-left: 4px solid #b45309;
}

.stat-card.count-500 {
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    border-left: 4px solid #4b5563;
}

.zodiac-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
}

.zodiac-card {
    background-color: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s;
}

.zodiac-card:hover {
    transform: translateY(-2px);
}

.zodiac-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #f0f0f0;
}

.zodiac-number {
    font-weight: bold;
    font-size: 14px;
    color: #333;
}

.zodiac-name {
    font-size: 12px;
    color: #666;
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
}

.zodiac-content {
    display: flex;
    flex-direction: column;
}

.amount-row {
    display: flex;
    justify-content: center;
}

.value {
    font-weight: 600;
    font-size: 16px;
}

/* 金额颜色分类和大小变化 */
.amount-default .value {
    color: #6b7280; /* 灰色 */
    font-size: 16px;
}

.amount-low .value {
    color: #d97706; /* 橙色 */
    font-size: 18px;
}

.amount-medium .value {
    color: #dc2626; /* 红色 */
    font-size: 20px;
}

.amount-high .value {
    color: #7c2d12; /* 深红棕色 */
    font-size: 22px;
}

.amount-super-high .value {
    color: #7f1d1d; /* 深红色 */
    font-weight: 700;
    font-size: 25px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* 号码类型背景色 */
.zodiac-ping {
    background-color: #ffedd5;
}

.zodiac-te {
    background-color: #fee2e2;
}

@media (max-width: 768px) {
    .zodiac-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
    }

    .zodiac-card {
        padding: 10px;
    }
    
    .stats-section {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
    
    /* 响应式调整字体大小 */
    .amount-default .value {
        font-size: 14px;
    }
    
    .amount-low .value {
        font-size: 16px;
    }
    
    .amount-medium .value {
        font-size: 18px;
    }
    
    .amount-high .value {
        font-size: 20px;
    }
    
    .amount-super-high .value {
        font-size: 22px;
    }
}

@media (max-width: 480px) {
    .zodiac-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
    }

    .zodiac-number {
        font-size: 13px;
    }

    .zodiac-name {
        font-size: 11px;
    }
    
    .stats-section {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .stat-card {
        padding: 10px;
    }
    
    .stat-title {
        font-size: 12px;
    }
    
    .stat-number {
        font-size: 16px;
    }
    
    /* 响应式调整字体大小 */
    .amount-default .value {
        font-size: 12px;
    }
    
    .amount-low .value {
        font-size: 14px;
    }
    
    .amount-medium .value {
        font-size: 16px;
    }
    
    .amount-high .value {
        font-size: 18px;
    }
    
    .amount-super-high .value {
        font-size: 20px;
    }
    
    .filter-section {
        justify-content: flex-start;
    }
    
    .filter-select {
        width: 120px;
    }
}
</style>