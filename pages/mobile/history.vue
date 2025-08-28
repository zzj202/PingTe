<template>
  <div class="page-container">
    <!-- 卡片列表 -->
    <div class="card-container">
      <div
        v-for="(item, index) in sortedChangciList"
        :key="index"
        class="betting-card"
        :class="{
          'profit-card': hasResult(item) && calculateProfit(item) > 0, 
          'loss-card': hasResult(item) && calculateProfit(item) < 0,
          'neutral-card': hasResult(item) && calculateProfit(item) === 0,
          'no-result-card': !hasResult(item)
        }"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="card-title-wrapper">
            <h2 class="card-title">{{ item.name }}</h2>
            <div class="profit-badge" v-if="hasResult(item) && calculateProfit(item) !== 0">
              {{ calculateProfit(item) > 0 ? '盈利' : '亏损' }} ¥{{ Math.abs(calculateProfit(item)) }}
            </div>
            <div class="profit-badge neutral" v-else-if="hasResult(item)">
              收支平衡
            </div>
            <div class="profit-badge no-result" v-else>
              未开奖
            </div>
          </div>
          <div class="card-date">{{ dayjs(item.createdAt).format('MM-DD HH:mm') }}</div>
        </div>

        <!-- 金额信息 -->
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">💰 总下注</span>
            <span class="info-value">¥{{ formatNumber(item.total || 0) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">💵 总赔付</span>
            <span class="info-value">¥{{ formatNumber(item.peiTotal || 0) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">📊 平码赔率</span>
            <span class="info-value">x{{ item.pingMaBeilv }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">📈 特码赔率</span>
            <span class="info-value">x{{ item.teMaBeilv }}</span>
          </div>
        </div>

        <!-- 号码列表（只在有结果时显示） -->
        <div class="numbers-section" v-if="hasResult(item)">
          <div class="numbers-group">
            <span class="numbers-label">平码:</span>
            <div class="numbers-list">
              <span 
                v-for="(num, i) in item.pingMaList" 
                :key="i" 
                class="number-badge pingma"
              >
                {{ num }}
              </span>
            </div>
          </div>
          <div class="numbers-group">
            <span class="numbers-label">特码:</span>
            <span class="special-number" v-if="item.teMa">{{ item.teMa }}</span>
          </div>
        </div>

        <!-- 卡片操作按钮 -->
        <div class="card-actions">
          <button class="card-export-button" @click.stop="exportChangCi(item)">
            <span class="button-icon">📤</span> 
            <span class="button-text">导出</span>
          </button>
          <button class="card-edit-button" @click.stop="editChangCi(item.id)">
            <span class="button-icon">✏️</span> 
            <span class="button-text">编辑</span>
          </button>
          <button class="card-delete-button" @click.stop="deleteChangCi(item.id)">
            <span class="button-icon">🗑️</span> 
            <span class="button-text">删除</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useMainStore} from "@/stores/mainStore";
import dayjs from "dayjs";
import {ref, computed} from "vue";
import {Dialog, Snackbar} from "@varlet/ui";

const store = useMainStore();
const changciList = ref(store.changCiList);

// 检查是否有开奖结果
const hasResult = (item) => {
  return (item.pingMaList && item.pingMaList.length > 0) || item.teMa;
};

// 按时间降序排序（最新的在最前面）
const sortedChangciList = computed(() => {
  return [...changciList.value].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

// 计算盈利/亏损
const calculateProfit = (item) => {
  return (item.total || 0) - (item.peiTotal || 0);
};

// 数字格式化
const formatNumber = (num) => {
  return Number(num).toLocaleString();
};

// 编辑场次
const editChangCi = (id: number) => {
  store.setCurrentChangCi(id);
  navigateTo('/mobile/main');
};

// 导出场次数据
const exportChangCi = async (item) => {
  try {
    const textData = JSON.stringify(item, null, 2);
    await navigator.clipboard.writeText(textData);
    Snackbar.success('数据已复制到剪贴板');
  } catch (err) {
    console.error('复制失败:', err);
    fallbackCopy(JSON.stringify(item, null, 2));
  }
};

// 删除特定场次
const deleteChangCi = async (id: number) => {
  const action = await Dialog({
    title: '操作确认',
    message: '确定要删除该场次吗？此操作不可撤销！',
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    confirmButtonColor: 'var(--danger-color)',

  });
  
  if (action !== 'confirm') return;
  
  try {
    store.deleteChangCi(id);
    changciList.value = store.changCiList;
    Snackbar.success('场次已删除');
  } catch (error) {
    Snackbar.error('删除失败，请重试');
  }
};

// 兼容性复制方法
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      Snackbar.success('数据已复制到剪贴板');
    } else {
      throw new Error('复制失败');
    }
  } catch (err) {
    console.error('复制失败:', err);
  } finally {
    document.body.removeChild(textarea);
  }
}
</script>

<style scoped>
/* CSS 变量定义 */
:root {
  --primary-color: #4361ee;
  --success-color: #2ecc71;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --neutral-color: #95a5a6;
  --no-result-color: #7f8c8d;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --bg-card: #ffffff;
  --border-radius: 12px;
  --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 页面容器 */
.page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 卡片容器 */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* 卡片样式 */
.betting-card {
  background: var(--bg-card);
  border-radius: var(--border-radius);
  box-shadow: 
    0 3px 10px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-left: 5px solid transparent;
  padding-bottom: 60px;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%);
  border: none;
  backdrop-filter: blur(2px);
}

.betting-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

/* 盈利/亏损卡片样式 */
.profit-card {
  border-left-color: var(--success-color);
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.05) 0%, rgba(255,255,255,0.9) 100%);
}

.loss-card {
  border-left-color: var(--danger-color);
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.05) 0%, rgba(255,255,255,0.9) 100%);
}

.neutral-card {
  border-left-color: var(--neutral-color);
  background: linear-gradient(135deg, rgba(149, 165, 166, 0.05) 0%, rgba(255,255,255,0.9) 100%);
}

.no-result-card {
  border-left-color: var(--no-result-color);
  background: linear-gradient(135deg, rgba(127, 140, 141, 0.05) 0%, rgba(255,255,255,0.9) 100%);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 12px;
}

.card-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.profit-badge {
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 12px;
  font-weight: 600;
  align-self: flex-start;
}

.profit-card .profit-badge {
  background-color: rgba(46, 204, 113, 0.15);
  color: var(--success-color);
}

.loss-card .profit-badge {
  background-color: rgba(231, 76, 60, 0.15);
  color: var(--danger-color);
}

.neutral-card .profit-badge.neutral {
  background-color: rgba(149, 165, 166, 0.15);
  color: var(--neutral-color);
}

.no-result-card .profit-badge.no-result {
  background-color: rgba(127, 140, 141, 0.15);
  color: var(--no-result-color);
}

.card-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
  padding-top: 4px;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(248, 249, 250, 0.7);
  transition: var(--transition);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item:hover {
  background-color: rgba(241, 243, 245, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.info-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.info-value {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 号码区域 */
.numbers-section {
  margin: 20px 0;
}

.numbers-group {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.numbers-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-right: 12px;
  min-width: 50px;
  font-weight: 500;
}

.numbers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.number-badge {
  font-size: 0.9rem;
  padding: 6px 8px;
  color: white;
  border-radius: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pingma {
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
}

.special-number {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff7675 0%, #d63031 100%);
  color: white;
  border-radius: 14px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
  display: inline-block;
  min-width: 40px;
  text-align: center;
}

/* 卡片操作按钮 */
.card-actions {
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  gap: 12px;
}

button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  border: none;
  outline: none;
  min-width: 90px;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.button-icon {
  margin-right: 8px;
  font-size: 1rem;
}

/* 导出按钮 */
.card-export-button {
  background: linear-gradient(135deg, #00b894 0%, #55efc4 100%);
  color: white;
}

.card-export-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 184, 148, 0.3);
}

/* 编辑按钮 */
.card-edit-button {
  background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
  color: white;
}

.card-edit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(9, 132, 227, 0.3);
}

/* 删除按钮 */
.card-delete-button {
  background: linear-gradient(135deg, #d63031 0%, #ff7675 100%);
  color: white;
}

.card-delete-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(214, 48, 49, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-container {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    position: static;
    margin-top: 24px;
    justify-content: flex-end;
  }
  
  button {
    padding: 8px 12px;
    min-width: auto;
  }
  
  .button-text {
    display: none;
  }
  
  .button-icon {
    margin-right: 0;
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .betting-card {
    padding: 20px;
  }
}
</style>