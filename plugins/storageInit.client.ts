export default defineNuxtPlugin(async () => {
  // 只在客户端执行
  if (process.client) {
    try {
      const data = await $fetch('/api/storage')
      
      // 合并数据而不是直接替换
      for (const key in data) {
        if (!localStorage.getItem(key)) {
          if (typeof data[key] === 'object') {
            localStorage.setItem(key, JSON.stringify(data[key]))
          } else {
            localStorage.setItem(key, data[key])
          }
        }
      }
      
      console.log('从文件初始化存储数据成功')
    } catch (error) {
      console.error('从文件初始化存储数据失败:', error)
    }
  }
})