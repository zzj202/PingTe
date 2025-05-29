<template>
  <div class="import-export-container">
    <div class="odds-settings-container">
      <h3>默认赔率设置</h3>

      <div class="odds-input-group">
        <div class="odds-input">
          <label>平码赔率:</label>
          <var-counter :min="0" :max="5" v-model="pingMaInput"/>
        </div>
        <div class="odds-input">
          <label>特码赔率:</label>
          <var-counter :min="20" :max="60" v-model="teMaInput"/>
        </div>
        <var-button
            type="primary"
            size="small"
            @click="saveDefaultBeiLv"
            class="save-button"
        >
          保存
        </var-button>
      </div>
      <p class="hint-text">设置后，新创建的场次将使用这些默认赔率</p>
    </div>
    <!-- 导出所有场次 -->
    <div class="export-section">
      <h3>导出所有场次数据</h3>
      <div class="export-actions">
        <button class="export-button" @click="copyToClipboard">
          <span class="button-icon">📋</span> 复制到剪贴板
        </button>
        <button class="export-button" @click="showExportData">
          <span class="button-icon">👀</span> 查看数据
        </button>
      </div>
      <textarea
          v-if="showExport"
          v-model="exportData"
          readonly
          class="data-preview"
      ></textarea>
    </div>
    <!-- 导入场次数据 -->
    <div class="import-section">
      <h3>导入场次数据</h3>
      <div class="import-options">
        <label>
          <input type="radio" v-model="importStrategy" value="new"> 创建新场次
        </label>
        <label>
          <input type="radio" v-model="importStrategy" value="overwrite"> 覆盖现有场次
        </label>
        <label>
          <input type="radio" v-model="importStrategy" value="merge"> 合并数据
        </label>
      </div>

      <textarea
          v-model="importData"
          placeholder="请粘贴JSON数据"
          class="import-input"
      ></textarea>

      <button
          class="import-button"
          @click="importChangCi"
          :disabled="!importData.trim()"
      >
        <span class="button-icon">📥</span> 导入
      </button>
    </div>
    <!-- 新增的清空所有场次按钮 -->
    <div class="danger-section">
      <h3>危险操作区域</h3>
      <button class="clear-button" @click="confirmClearAll">
        <span class="button-icon">⚠️</span> 清空所有场次
      </button>
      <p class="danger-hint">此操作不可撤销，请谨慎操作！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useMainStore} from '@/stores/mainStore'
import {Snackbar, Dialog} from '@varlet/ui'

const store = useMainStore()
const importStrategy = ref<'new' | 'overwrite' | 'merge'>('new')
const importData = ref('')
const exportData = ref('')
const showExport = ref(false)


// 输入框绑定的值
const pingMaInput = ref(store.morenPingMaBeiLv)
const teMaInput = ref(store.morenTeMaBeiLv)
// 获取导出的JSON数据
const getExportData = () => {
  return JSON.stringify(store.changCiList, null, 2)
}

// 复制到剪贴板
const copyToClipboard = () => {
  const data = getExportData()
  fallbackCopy(data)
}

// 显示导出数据
const showExportData = () => {
  exportData.value = getExportData()
  showExport.value = !showExport.value
}

// 导入场次数据
const importChangCi = () => {
  try {
    const data = JSON.parse(importData.value)

    if (!Array.isArray(data) && typeof data !== 'object') {
      throw new Error('数据格式不正确')
    }

    const importOptions = {
      overwrite: importStrategy.value === 'overwrite',
      merge: importStrategy.value === 'merge'
    }

    if (Array.isArray(data)) {
      // 批量导入
      let successCount = 0
      data.forEach(item => {
        if (store.importChangCi(item, importOptions)) {
          successCount++
        }
      })
      Snackbar.success(`成功导入 ${successCount}/${data.length} 个场次`)
    } else {
      // 单个导入
      if (store.importChangCi(data, importOptions)) {
        Snackbar.success('导入成功')
      }
    }

    importData.value = ''
  } catch (error) {
    console.error('导入失败:', error)
    Snackbar.error('导入失败: ' + error.message)
  }
}

// 清空所有场次
const clearAllChangCi = () => {
  store.clearAllChangCi()
  Snackbar.success('已清空所有场次数据')
}
// 确认清空操作
const confirmClearAll = async () => {

  const action = await Dialog({
    title: '确认清空',
    message: `确定要清空所有场次数据吗？此操作不可恢复！`,
    confirmButtonText: '确定清空',
    cancelButtonText: '取消',

    confirmButtonTextColor: 'var(--color-danger)',
  })
  if (action !== 'confirm') return
  clearAllChangCi()
}

const saveDefaultBeiLv = () => {
  store.updateDefaultBeiLv(pingMaInput.value, teMaInput.value)
  Snackbar.success('保存成功')
}

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
.import-export-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.export-section, .import-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.export-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.import-options {
  margin: 15px 0;
  display: flex;
  gap: 15px;
}

label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

textarea {
  width: 100%;
  min-height: 150px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: monospace;
  margin-bottom: 10px;
}

.data-preview {
  background-color: #f5f5f5;
  font-size: 0.9em;
}

.import-input {
  margin-bottom: 15px;
}

button {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  border: none;
  outline: none;
}

.button-icon {
  margin-right: 6px;
  font-weight: bold;
}

.export-button {
  background-color: #4caf50;
  color: white;
}

.export-button:hover {
  background-color: #3d8b40;
}

.import-button {
  background-color: #2196f3;
  color: white;
}

.import-button:hover:not(:disabled) {
  background-color: #1976d2;
}

.import-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 新增的危险区域样式 */
.danger-section {
  background-color: #fff8f8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #ffebee;
}

.danger-section h3 {
  color: #d32f2f;
  border-bottom: 1px solid #ffcdd2;
}

.danger-hint {
  font-size: 0.8em;
  color: #d32f2f;
  margin-top: 8px;
  text-align: center;
}

.clear-button {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: none;
  outline: none;
  background-color: #ffebee;
  color: #d32f2f;
}

.clear-button:hover {
  background-color: #ffcdd2;
}

.odds-settings-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.odds-input-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.odds-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.odds-input label {
  min-width: 80px;
  font-weight: 500;
}

.odds-input-field {
  flex: 1;
  max-width: 120px;
}

.odds-suffix {
  color: #666;
}

.save-button {
  margin-left: 10px;
}

.hint-text {
  font-size: 0.85em;
  color: #666;
  margin-top: 15px;
  text-align: center;
}
</style>