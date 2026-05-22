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

  compatibilityDate: '2025-10-07'
})

