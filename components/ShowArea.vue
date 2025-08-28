<template>
    <div class="zodiac-container">
        <div class="filter-section">
            <var-select v-model="sortField" placeholder="排序方式" class="filter-select" variant="outlined" size="small">
                <var-option label="默认排序" value="number" />
                <var-option label="按金额排序" value="total" />
            </var-select>
        </div>

        <div class="zodiac-grid">
            <div v-for="item in sortedData" :key="item.number" class="zodiac-card" 
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

// 排序字段
const sortField = ref<'number' | 'total'>('number')

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

// 格式化金额显示
const formatAmount = (amount: number) => {
    return amount.toLocaleString('zh-CN')
}

// 根据金额获取样式类
const getAmountClass = (amount: number) => {
    if (amount >= 3000) return 'amount-super-high'
    if (amount >= 1000) return 'amount-high'
    if (amount >= 500) return 'amount-medium'
    if (amount >= 200) return 'amount-low'
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
}

.filter-select {
    width: 150px;
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
}
</style>

