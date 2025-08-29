import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const storagePath = getStoragePath()
  
  try {
    // 确保目录存在
    fs.mkdirSync(path.dirname(storagePath), { recursive: true })
    fs.writeFileSync(storagePath, JSON.stringify(body.data, null, 2))
    return { success: true }
  } catch (error) {
    console.error('保存存储数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '保存存储数据失败'
    })
  }
})

function getStoragePath() {
  return path.join(process.cwd(), 'storage', 'app_data.json')
}