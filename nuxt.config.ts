// nuxt.config.ts 顶部加上这一行
import { defineNuxtConfig } from 'nuxt/config'



export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/ui'
  ],

  ui: {
    icons: ['heroicons', 'simple-icons'],
    primary: 'emerald',
    gray: 'slate'
  },

  tailwindcss: {
    // 确保Tailwind配置被正确加载
    configPath: 'tailwind.config.js',
    exposeConfig: true, // 暴露Tailwind配置给Nuxt
    exposeLevel: 2 // 暴露完整配置
  },

  devServer: {
    port: 3000
  },

  // 关闭 app manifest，避免 Nuxt 3.12 内置 manifest-route-rule 中间件被自动扫描+显式注册两次而告警
  // （本站未使用 routeRules 客户端重定向，关闭无影响）
  experimental: {
    appManifest: false
  },

  // 全局应用头部 meta（移动端适配）
  app: {
    head: {
      meta: [
        // 确保移动端正确缩放
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  compatibilityDate: '2026-06-21'
})

