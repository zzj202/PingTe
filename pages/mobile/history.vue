<template>
  <div class="page-container">
    <!-- 卡片列表 -->
    <div class="card-container">
      <div
          v-for="(item, index) in sortedChangciList"
          :key="index"
          class="betting-card"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <h2 class="card-title">{{ item.name }}</h2>
          <div class="card-date">{{ dayjs(item.createdAt).format('MM-DD HH:mm') }}</div>
        </div>

        <!-- 金额信息 -->
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">💰 总下注</span>
            <span class="info-value">¥{{ item.total || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">💵 总赔付</span>
            <span class="info-value">¥{{ item.peiTotal || 0 }}</span>
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

        <!-- 号码列表 -->
        <div class="numbers-section">
          <div class="numbers-group">
            <span class="numbers-label">平码:</span>
            <div class="numbers-list">
              <span v-for="(num, i) in item.pingMaList" :key="i" class="number-badge">
                {{ num }}
              </span>
            </div>
          </div>
          <div class="numbers-group">
            <span class="numbers-label">特码:</span>
            <span class="special-number">{{ item.teMa }}</span>
          </div>
        </div>

        <!-- 卡片操作按钮 -->
        <div class="card-actions">
          <button class="card-export-button" @click.stop="exportChangCi(item)">
            <span class="button-icon">📤</span> 导出
          </button>
          <button class="card-edit-button" @click.stop="editChangCi(item.id)">
            <span class="button-icon">✏️</span> 编辑
          </button>
          <button class="card-delete-button" @click.stop="deleteChangCi(item.id)">
            <span class="button-icon">×</span> 删除
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

// 按时间降序排序（最新的在最前面）
const sortedChangciList = computed(() => {
  return [...changciList.value].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});


// 编辑场次
const editChangCi = (id: number) => {
  store.setCurrentChangCi(id)
  navigateTo('/mobile/main')
};
// 导出场次数据
const exportChangCi = (item) => {
  // 1. 复制到剪贴板
  // const {copy} = useClipboard()
  const textData = JSON.stringify(item, null, 2)
  // copy(textData)
  fallbackCopy(textData)
  Snackbar.success('数据已复制到剪贴板')
}

// 删除特定场次
const deleteChangCi = async (id: number) => {
  const action = await Dialog({
    title: `操作提醒`,
    message: `确定要删除该场次吗？`,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
  if (action !== 'confirm') return
  store.deleteChangCi(id);
  changciList.value = store.changCiList;
  Snackbar.success(`删除成功`)
};

function fallbackCopy(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed' // 避免滚动
  document.body.appendChild(textarea)
  textarea.select()
  try {
    const successful = document.execCommand('copy')
    if (successful) {
    } else {
      throw new Error('复制失败')
    }
  } catch (err) {
    console.error('复制失败:', err)
    // 终极方案：提示用户手动复制
    prompt('请手动复制以下文本', text)
  } finally {
    document.body.removeChild(textarea)
  }
}
</script>

<style scoped>
/* 页面容器 */
.page-container {
  padding: 16px;
}


/* 按钮基础样式 */
button {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  border: none;
  outline: none;
}

.button-icon {
  margin-right: 6px;
  font-weight: bold;
}

/* 卡片容器 */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

/* 卡片样式 */
.betting-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 12px;
  transition: transform 0.2s ease;
  position: relative;
  padding-bottom: 50px; /* 为操作按钮留空间 */
}

.betting-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 卡片操作按钮区域 */
.card-actions {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

/* 卡片编辑按钮 */
.card-edit-button {
  padding: 6px 12px;
  font-size: 0.8rem;
  background-color: #e3f2fd;
  color: #1976d2;
  border: 1px solid #90caf9;
}

/* 新增导出按钮样式 */
.card-export-button {
  padding: 6px 12px;
  font-size: 0.8rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.card-edit-button:hover {
  background-color: #bbdefb;
}

/* 卡片删除按钮 */
.card-delete-button {
  padding: 6px 12px;
  font-size: 0.8rem;
  background-color: #ffebee;
  color: #d32f2f;
  border: 1px solid #ef9a9a;
}

.card-delete-button:hover {
  background-color: #ffcdd2;
}

/* 头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.card-date {
  font-size: 0.8rem;
  color: #666;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 6px;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.info-label {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 2px;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

/* 号码区域 */
.numbers-section {
  margin-top: 8px;
}

.numbers-group {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.numbers-label {
  font-size: 0.8rem;
  color: #666;
  margin-right: 8px;
  min-width: 40px;
}

.numbers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.number-badge {
  font-size: 0.8rem;
  padding: 2px 6px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
}

.special-number {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 2px 8px;
  background-color: #ffebee;
  color: #d32f2f;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .card-container {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }


}
</style>