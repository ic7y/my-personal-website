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

  // 全局应用头部 meta（移动端适配）
  app: {
    head: {
      meta: [
        // 确保移动端正确缩放
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  compatibilityDate: '2025-10-07'
})

