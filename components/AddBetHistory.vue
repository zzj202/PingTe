<template>

    <div class="bet-history-panel" v-if="allRecords.length > 0">
        <div class="panel-header">
            <h2 class="panel-title">加注记录</h2>
            <div class="panel-subtitle">最近操作记录</div>
        </div>

        <div class="history-table-container">
            <table class="history-table">
                <thead>
                    <tr>
                        <th class="text-left">序号</th>
                        <th class="text-left">下注方式</th>
                        <th class="text-left">号码</th>
                        <th class="text-right">数量</th>
                        <th class="text-right">总金额</th>
                        <th class="text-right">时间</th>
                        <th class="text-right">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(record, index) in allRecords" :key="index">
                        <td class="text-left">{{ index + 1 }}</td>
                        <td class="text-left">
                            <span :class="['bet-type-tag', record.betType]">
                                <template v-if="record.betType === 'direct'">直接下注</template>
                                <template v-else-if="record.betType === 'tail'">尾数 {{ record.betTarget }}</template>
                                <template v-else>生肖 {{ record.betTarget }}</template>
                            </span>
                        </td>
                        <td class="text-left">
                            <div class="record-numbers">
                                <span v-for="(num, i) in record.numbers" :key="i" class="mini-number-badge">
                                    {{ num }}
                                </span>
                            </div>
                        </td>
                        <td class="text-right">
                            {{ record.numbers.length }}
                        </td>
                        <td class="text-right amount-cell">
                            ¥{{ record.totalAmount }}
                        </td>
                        <td class="text-right time-cell">
                            {{ formatTime(record.timestamp) }}
                        </td>
                        <td class="text-right action-cell">
                            <button class="action-btn delete-btn" @click="removeRecord(index)" title="撤销">
                                <svg viewBox="0 0 24 24">
                                    <path
                                        d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20"
                                        stroke="#EF4444" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script lang="ts" setup>
import type { OperationRecord } from '~/types/zodiac'


const store = useMainStore()
const allRecords = ref<OperationRecord[]>([])


onMounted(() => {
    loadRecords()
})

const loadRecords = () => {
    if (store.currentChangCi?.addBetHistory) {
        allRecords.value = store.currentChangCi.addBetHistory
    }
    console.log(allRecords.value)
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
const removeRecord = async (index: number) => {
    const record = allRecords.value[index]
    const action = await Dialog({
        title: '确认撤销',
        message: `确定要撤销这条记录吗？${getBetDescription(record)}，总金额 ${record.totalAmount} 元`,
        confirmButtonText: '确定撤销',
        cancelButtonText: '取消',
    })

    if (action !== 'confirm') return

    try {
        await store.cancelBet(record.numbers, record.betCount)
        allRecords.value.splice(index, 1)
        Snackbar.success('撤销成功')
    } catch (error) {
        Snackbar.error('撤销失败: ' + error.message)
    }
}
const getBetDescription = (record: OperationRecord) => {
    if (record.betType === 'tail') {
        return `包尾数 ${record.betTarget}，共 ${record.numbers.length} 个号码，每个 ${record.betCount} 元`
    } else if (record.betType === 'zodiac') {
        return `包生肖 ${record.betTarget}，共 ${record.numbers.length} 个号码，每个 ${record.betCount} 元`
    }
    return `直接下注 ${record.numbers.length} 个号码，每个 ${record.betCount} 元`
}

</script>
<style scoped>
.bet-history-panel {
    flex: 0 0 500px;
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    max-height: calc(100vh - 3rem);
    display: flex;
    flex-direction: column;
}

.panel-header {
    margin-bottom: 1.5rem;
}

.panel-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--gray-800);
    margin: 0 0 0.25rem 0;
}

.panel-subtitle {
    font-size: 0.875rem;
    color: var(--gray-500);
}

/* 历史记录表格 */
.history-table-container {
    flex: 1;
    overflow-y: auto;
}

.history-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
}

.history-table th {
    position: sticky;
    top: 0;
    background: white;
    padding: 0.75rem 1rem;
    font-weight: 600;
    color: var(--gray-600);
    border-bottom: 1px solid var(--gray-200);
    z-index: 1;
}

.history-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--gray-200);
}

.history-table tr:last-child td {
    border-bottom: none;
}

.history-table tr:hover td {
    background: var(--gray-100);
}

.text-left {
    text-align: left;
}

.text-right {
    text-align: right;
}

.bet-type-tag {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.bet-type-tag.direct {
    background: var(--gray-200);
    color: var(--gray-700);
}

.bet-type-tag.tail {
    background: #BFDBFE;
    color: #1E40AF;
}

.bet-type-tag.zodiac {
    background: #A7F3D0;
    color: #065F46;
}

.record-numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    max-width: 150px;
}

.mini-number-badge {
    background: var(--gray-200);
    color: var(--gray-700);
    padding: 0.125rem 0.375rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.amount-cell {
    font-weight: 500;
    color: var(--gray-800);
}

.action-cell {
    padding-right: 0;
}

.action-btn {
    background: none;
    border: none;
    padding: 0.25rem;
    border-radius: 0.25rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
}

.action-btn:hover {
    background: var(--gray-200);
}

.action-btn svg {
    width: 1.125rem;
    height: 1.125rem;
}

.delete-btn:hover svg path {
    stroke: var(--danger-color);
}

.time-cell {
    font-size: 0.75rem;
    color: var(--gray-500);
    white-space: nowrap;
}

/* 调整表格列宽 */
.history-table th:nth-child(1),
.history-table td:nth-child(1) {
    width: 50px;
}

.history-table th:nth-child(2),
.history-table td:nth-child(2) {
    width: 100px;
}

.history-table th:nth-child(4),
.history-table td:nth-child(4),
.history-table th:nth-child(5),
.history-table td:nth-child(5),
.history-table th:nth-child(6),
.history-table td:nth-child(6) {
    width: 80px;
}

.history-table th:nth-child(7),
.history-table td:nth-child(7) {
    width: 60px;
}

/* 基础样式变量 */
:root {
    --primary-color: #3B82F6;
    --primary-hover: #2563EB;
    --danger-color: #EF4444;
    --gray-100: #F8FAFC;
    --gray-200: #E2E8F0;
    --gray-500: #64748B;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1E293B;
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --transition: all 0.2s ease;
}
</style>