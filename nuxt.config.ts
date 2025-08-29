// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: {enabled: false},
    modules: ['@varlet/nuxt', 'dayjs-nuxt', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', '@vueuse/nuxt',],

    devServer: {
        host: '0.0.0.0', // 监听所有网络接口
        port: 3000 ,// 或其他你想要的端口
    }
})