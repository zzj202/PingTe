import fs from 'fs'
import path from 'path'

export default defineEventHandler(async () => {
  const storagePath = getStoragePath()
  
  try {
    if (fs.existsSync(storagePath)) {
      const data = fs.readFileSync(storagePath, 'utf-8')
      return JSON.parse(data)
    }
    return {}
  } catch (error) {
    console.error('读取存储数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '读取存储数据失败'
    })
  }
})

function getStoragePath() {
  return path.join(process.cwd(), 'storage', 'app_data.json')
}