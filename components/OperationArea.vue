<template>
    <div class="bet-container">
        <div class="layout-container">
            <!-- 左侧：加注操作区域 -->
            <div class="operation-section">
                <!-- 数字输入区域 -->
                <div class="input-section">
                    <label for="number-input" class="input-label">输入数字号码（支持多种分隔符）</label>
                    <input id="number-input" type="text" v-model="inputValue"
                        placeholder="例如：43.12.48.46.13.37.6.25.33.7.46.47 或 08/10/18/48" @input="processNumbers"
                        class="number-input">

                    <!-- 尾数快捷按钮 -->
                    <div class="tail-number-section">
                        <div class="tail-number-group">
                            <span class="tail-label">尾数：</span>
                            <button v-for="tail in 10" :key="tail" @click="toggleTailSelection(tail === 10 ? 0 : tail)"
                                :class="{ 'active': selectedTails.includes(tail === 10 ? 0 : tail) }" class="tail-button">
                                {{ tail === 10 ? '0' : tail }}
                            </button>
                        </div>
                    </div>

                    <!-- 十二生肖按钮组 -->
                    <div class="zodiac-section">
                        <div class="zodiac-group">
                            <span class="zodiac-label">生肖：</span>
                            <button v-for="zodiac in zodiacList" :key="zodiac.name" @click="toggleZodiacSelection(zodiac.name)"
                                :class="{ 'active': selectedZodiacs.includes(zodiac.name) }" class="zodiac-button">
                                {{ zodiac.name }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 注数输入区域 -->
                <div class="input-section">
                    <label for="bet-count" class="input-label">注数</label>
                    <div class="bet-input-wrapper">
                        <input id="bet-count" type="number" v-model.number="betCount" min="1" placeholder="输入注数"
                            @input="processBetCount" class="bet-input">
                        <div class="quick-bet-buttons">
                            <button v-for="count in quickBetCounts" :key="count" @click="setBetCount(count)"
                                class="quick-bet-button">
                                {{ count }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 错误提示 -->
                <div class="error-message" v-if="errorMessage">
                    <svg class="error-icon" viewBox="0 0 24 24">
                        <path
                            d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="#EF4444" stroke-width="2" stroke-linecap="round" />
                    </svg>
                    <span>{{ errorMessage }}</span>
                </div>

                <!-- 结果展示 -->
                <div class="result-section" v-if="numberArray.length > 0 && !errorMessage">
                    <div class="result-title">要加注的号码：</div>
                    <div class="number-list">
                        <span v-for="(number, index) in numberArray" :key="index" class="number-item">
                            {{ number }}
                        </span>
                    </div>
                    <div class="total-bet" v-if="betCount > 0">
                        每个号码加注：<span class="highlight">{{ betCount }}</span> 元，
                        总金额：<span class="highlight">{{ numberArray.length * betCount }}</span> 元
                    </div>
                </div>

                <!-- 空状态 -->
                <div class="empty-state" v-else-if="!errorMessage">
                    <svg class="empty-icon" viewBox="0 0 24 24">
                        <path
                            d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" />
                    </svg>
                    <p>输入数字序列后，提取的结果将显示在这里</p>
                </div>

                <!-- 提交按钮 -->
                <button class="submit-button" @click="handleSubmit" :disabled="!isFormValid">
                    提交
                </button>
            </div>

            <!-- 右侧：操作记录区域 -->
            <div class="records-section" v-if="operationRecords.length > 0">
                <h2 class="records-title">操作记录</h2>
                <div class="table-container">
                    <table class="records-table">
                        <thead>
                            <tr>
                                <th>序号</th>
                                <th>号码</th>
                                <th>每个加注</th>
                                <th>总金额</th>
                                <th>操作时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(record, index) in operationRecords" :key="index">
                                <td>{{ index + 1 }}</td>
                                <td class="numbers-cell">
                                    <div class="numbers-list">
                                        <span v-for="(num, i) in record.numbers" :key="i" class="number-badge">
                                            {{ num }}
                                        </span>
                                    </div>
                                </td>
                                <td>{{ record.betCount }} 元</td>
                                <td>{{ record.betCount * record.numbers.length }} 元</td>
                                <td>{{ formatTime(record.timestamp) }}</td>
                                <td>
                                    <button class="delete-button" @click="removeRecord(index)">
                                        <svg class="delete-icon" viewBox="0 0 24 24">
                                            <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface OperationRecord {
    numbers: string[]
    betCount: number
    timestamp: number
}

const store = useMainStore()
const inputValue = ref('')
const numberArray = ref<string[]>([])
const errorMessage = ref('')
const betCount = ref(0)
const selectedTails = ref<number[]>([])
const selectedZodiacs = ref<string[]>([])
const operationRecords = ref<OperationRecord[]>([])

// 固定的快速注数按钮
const fixedQuickBetCounts = [5, 10, 20, 30, 50, 100, 120, 150, 200, 500]
const quickBetCounts = ref<number[]>([...fixedQuickBetCounts])
const customBetCount = ref<number | null>(null)

// 表单验证状态
const isFormValid = computed(() => {
    return numberArray.value.length > 0 && betCount.value > 0 && !errorMessage.value
})

// 尾数对应的数字
const tailNumbers: Record<number, string[]> = {
    0: ['10', '20', '30', '40'],
    1: ['01', '11', '21', '31', '41'],
    2: ['02', '12', '22', '32', '42'],
    3: ['03', '13', '23', '33', '43'],
    4: ['04', '14', '24', '34', '44'],
    5: ['05', '15', '25', '35', '45'],
    6: ['06', '16', '26', '36', '46'],
    7: ['07', '17', '27', '37', '47'],
    8: ['08', '18', '28', '38', '48'],
    9: ['09', '19', '29', '39', '49']
}

// 十二生肖数据
const zodiacData = [
    { name: '鼠', numbers: ['06', '18', '30', '42'] },
    { name: '牛', numbers: ['05', '17', '29', '41'] },
    { name: '虎', numbers: ['04', '16', '28', '40'] },
    { name: '兔', numbers: ['03', '15', '27', '39'] },
    { name: '龙', numbers: ['02', '14', '26', '38'] },
    { name: '蛇', numbers: ['01', '13', '25', '37', '49'] },
    { name: '马', numbers: ['12', '24', '36', '48'] },
    { name: '羊', numbers: ['11', '23', '35', '47'] },
    { name: '猴', numbers: ['10', '22', '34', '46'] },
    { name: '鸡', numbers: ['09', '21', '33', '45'] },
    { name: '狗', numbers: ['08', '20', '32', '44'] },
    { name: '猪', numbers: ['07', '19', '31', '43'] }
]
const zodiacList = ref(zodiacData)

// 切换尾数选择
const toggleTailSelection = (tail: number) => {
    if (selectedZodiacs.value.length > 0) {
        errorMessage.value = "请先取消已选的生肖"
        return
    }
    
    const index = selectedTails.value.indexOf(tail)
    if (index === -1) {
        selectedTails.value.push(tail)
    } else {
        selectedTails.value.splice(index, 1)
    }
    updateNumbersFromSelection()
}

// 切换生肖选择
const toggleZodiacSelection = (zodiacName: string) => {
    if (selectedTails.value.length > 0) {
        errorMessage.value = "请先取消已选的尾数"
        return
    }
    
    const index = selectedZodiacs.value.indexOf(zodiacName)
    if (index === -1) {
        selectedZodiacs.value.push(zodiacName)
    } else {
        selectedZodiacs.value.splice(index, 1)
    }
    updateNumbersFromSelection()
}

// 根据选择更新号码数组
const updateNumbersFromSelection = () => {
    errorMessage.value = ''
    
    if (selectedTails.value.length > 0) {
        // 尾数选择模式
        const numbers: string[] = []
        selectedTails.value.forEach(tail => {
            numbers.push(...tailNumbers[tail])
        })
        inputValue.value = numbers.join(', ')
        numberArray.value = [...new Set(numbers)] // 去重
    } else if (selectedZodiacs.value.length > 0) {
        // 生肖选择模式
        const numbers: string[] = []
        selectedZodiacs.value.forEach(zodiacName => {
            const zodiac = zodiacList.value.find(z => z.name === zodiacName)
            if (zodiac) {
                numbers.push(...zodiac.numbers)
            }
        })
        inputValue.value = numbers.join(', ')
        numberArray.value = [...new Set(numbers)] // 去重
    } else {
        // 无选择模式
        inputValue.value = ''
        numberArray.value = []
    }
}

// 处理注数输入
const processBetCount = () => {
    errorMessage.value = ''

    // 验证注数
    if (isNaN(betCount.value)) {
        errorMessage.value = "注数必须是有效的数字"
        betCount.value = 0
        return
    }

    if (betCount.value <= 0 || !Number.isInteger(betCount.value)) {
        errorMessage.value = "注数必须是正整数"
        betCount.value = 0
        return
    }

    const MAX_BET_COUNT = 5000
    if (betCount.value > MAX_BET_COUNT) {
        errorMessage.value = `注数不能超过 ${MAX_BET_COUNT}`
        betCount.value = MAX_BET_COUNT
        return
    }

    // 添加自定义注数按钮
    if (betCount.value > 0 && !fixedQuickBetCounts.includes(betCount.value)) {
        // 移除旧的自定义注数
        if (customBetCount.value !== null) {
            const index = quickBetCounts.value.indexOf(customBetCount.value)
            if (index !== -1) {
                quickBetCounts.value.splice(index, 1)
            }
        }

        // 添加新的自定义注数
        quickBetCounts.value.push(betCount.value)
        customBetCount.value = betCount.value

        // // 保持按钮排序
        // quickBetCounts.value.sort((a, b) => a - b)
    }
}

// 处理数字输入
const processNumbers = () => {
    errorMessage.value = ''
    selectedTails.value = [] // 手动输入时取消尾数选择
    selectedZodiacs.value = [] // 手动输入时取消生肖选择

    const numbers = inputValue.value.match(/\d+/g)

    if (numbers) {
        // 验证数字范围
        for (const num of numbers) {
            const numInt = parseInt(num, 10)
            if (numInt < 1 || numInt > 49) {
                errorMessage.value = `错误：数字 "${num}" 不是有效的两位数（01-49）`
                numberArray.value = []
                return
            }
        }

        // 格式化为两位数
        numberArray.value = numbers.map(num => {
            const numInt = parseInt(num, 10)
            return numInt < 10 ? `0${numInt}` : `${numInt}`
        })
    } else {
        numberArray.value = []
    }
}

// 设置注数
const setBetCount = (count: number) => {
    betCount.value = count
    errorMessage.value = ""
}

// 格式化时间
const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
}

// 删除记录
const removeRecord = (index: number) => {
    operationRecords.value.splice(index, 1)
}

// 提交处理
const handleSubmit = async () => {
    if (!isFormValid.value) return

    const action = await Dialog({
        title: `确认操作`,
        message: `为 ${numberArray.value.length} 个号码各加注 ${betCount.value} 元？总金额 ${numberArray.value.length * betCount.value} 元`,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    })

    if (action !== 'confirm') return

    if (numberArray.value.length === 1) {
        store.updateNumberBet(numberArray.value[0], betCount.value)
    } else {
        store.updateNumberArrayBet(numberArray.value, betCount.value)
    }

    // 添加操作记录
    operationRecords.value.unshift({
        numbers: [...numberArray.value],
        betCount: betCount.value,
        timestamp: Date.now()
    })

    // 显示成功消息
    Snackbar.success(`已为 ${numberArray.value.length} 个号码各添加 ${betCount.value} 元，总金额 ${numberArray.value.length * betCount.value} 元`)

    // 重置表单输入
    inputValue.value = ''
    numberArray.value = []
    betCount.value = 0
    selectedTails.value = []
    selectedZodiacs.value = []
}
</script>

<style scoped>
.bet-container {
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    max-width: 1200px;
    margin: 1.25rem auto;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.title {
    color: #1e293b;
    text-align: center;
    margin-bottom: 1.875rem;
    font-weight: 600;
    font-size: 1.75rem;
    letter-spacing: -0.025em;
}

.layout-container {
    display: flex;
    gap: 2rem;
}

.operation-section {
    flex: 1;
    min-width: 0;
}

.input-section {
    margin-bottom: 1.5rem;
}

.input-label {
    display: block;
    margin-bottom: 0.5rem;
    color: #334155;
    font-weight: 500;
    font-size: 0.9375rem;
}

.number-input,
.bet-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 1rem;
    transition: all 0.2s ease;
    box-sizing: border-box;
    background-color: #f8fafc;
    color: #1e293b;
}

.number-input:focus,
.bet-input:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    background-color: #fff;
}

.bet-input-wrapper {
    position: relative;
}

.quick-bet-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.quick-bet-button {
    padding: 0.5rem 0.75rem;
    background-color: #e2e8f0;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
}

.quick-bet-button:hover {
    background-color: #cbd5e1;
    transform: translateY(-1px);
}

.quick-bet-button:active {
    transform: translateY(0);
}

.tail-number-section {
    margin-top: 1rem;
}

.tail-number-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tail-label {
    font-size: 0.875rem;
    color: #64748b;
    margin-right: 0.25rem;
}

.tail-button {
    padding: 0.5rem 0.75rem;
    background-color: #e2e8f0;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    min-width: 2.25rem;
    text-align: center;
}

.tail-button:hover {
    background-color: #cbd5e1;
}

.tail-button.active {
    background-color: #3b82f6;
    color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #dc2626;
    background-color: #fee2e2;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
}

.error-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
}

.result-section {
    background-color: #f8f9fa;
    border-radius: 0.75rem;
    padding: 1.25rem;
    margin-top: 1.25rem;
    border-left: 4px solid #3b82f6;
}

.result-title {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.875rem;
    font-size: 1.0625rem;
}

.number-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
    margin-bottom: 0.875rem;
}

.number-item {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    color: white;
    padding: 0.5rem 0.875rem;
    border-radius: 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.15s ease;
}

.number-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.total-bet {
    font-size: 1rem;
    color: #1e293b;
    font-weight: 500;
    margin-top: 0.625rem;
}

.highlight {
    font-weight: 600;
    color: #3b82f6;
}

.empty-state {
    text-align: center;
    padding: 2.5rem 1.25rem;
    color: #9ca3af;
}

.empty-icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: 1rem;
    opacity: 0.6;
}

.empty-state p {
    font-size: 1rem;
    margin: 0;
    color: #64748b;
}

.submit-button {
    width: 100%;
    padding: 0.875rem;
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1.25rem;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.submit-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #cbd5e1;
}

/* 生肖按钮样式 */
.zodiac-section {
    margin-top: 1rem;
}

.zodiac-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.zodiac-label {
    font-size: 0.875rem;
    color: #64748b;
    margin-right: 0.25rem;
}

.zodiac-button {
    padding: 0.5rem 0.75rem;
    background-color: #e2e8f0;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    min-width: 2.25rem;
    text-align: center;
}

.zodiac-button:hover {
    background-color: #cbd5e1;
}

.zodiac-button.active {
    background-color: #10b981;
    color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 操作记录表格样式 */
.records-section {
    flex: 1;
    min-width: 0;
    max-width: 500px;
    border-left: 1px solid #e2e8f0;
    padding-left: 2rem;
}

.records-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
}

.table-container {
    overflow-x: auto;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
}

.records-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    font-size: 0.875rem;
}

.records-table th,
.records-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.records-table th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #334155;
    position: sticky;
    top: 0;
}

.records-table tr:hover {
    background-color: #f8fafc;
}

.delete-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.delete-button:hover {
    background-color: #fee2e2;
}

.delete-icon {
    width: 1.25rem;
    height: 1.25rem;
}

/* 号码列表样式 */
.numbers-cell {
    max-width: 200px;
    overflow: hidden;
}

.numbers-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    max-height: 60px;
    overflow-y: auto;
}

.number-badge {
    background-color: #e2e8f0;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #334155;
}

/* 调整表格列宽 */
.records-table th:nth-child(1),
.records-table td:nth-child(1) {
    width: 50px;
}

.records-table th:nth-child(2),
.records-table td:nth-child(2) {
    width: 200px;
}

.records-table th:nth-child(3),
.records-table td:nth-child(3),
.records-table th:nth-child(4),
.records-table td:nth-child(4) {
    width: 100px;
}

.records-table th:nth-child(5),
.records-table td:nth-child(5) {
    width: 80px;
}

.records-table th:nth-child(6),
.records-table td:nth-child(6) {
    width: 60px;
}

@media (max-width: 1024px) {
    .layout-container {
        flex-direction: column;
    }
    
    .records-section {
        max-width: 100%;
        border-left: none;
        border-top: 1px solid #e2e8f0;
        padding-left: 0;
        padding-top: 2rem;
        margin-top: 2rem;
    }
}

@media (max-width: 768px) {
    .numbers-list {
        max-height: 40px;
    }
    
    .records-table th:nth-child(2),
    .records-table td:nth-child(2) {
        width: 150px;
    }
    
    .records-table th,
    .records-table td {
        padding: 0.5rem;
        font-size: 0.8125rem;
    }
}

@media (max-width: 640px) {
    .bet-container {
        padding: 1.5rem;
        margin: 0.625rem;
        border-radius: 0.75rem;
    }

    .title {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .quick-bet-buttons,
    .tail-number-group {
        justify-content: center;
    }

    .number-list {
        justify-content: center;
    }

    .zodiac-group {
        justify-content: center;
    }

    .zodiac-button {
        padding: 0.4rem 0.6rem;
        font-size: 0.8125rem;
    }
}
</style>