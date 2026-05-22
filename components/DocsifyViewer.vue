<!-- components/DocsifyViewer.vue -->
<template>
  <div id="docsify-container" class="docsify-wrapper">
    <p v-if="!loaded">正在加载文档...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const loaded = ref(false)

onMounted(() => {
  console.log('🔍 DocsifyViewer onMounted triggered')

  // 防止重复加载
  if (document.getElementById('docsify-script')) {
    console.warn('⚠️ Docsify already loaded')
    return
  }

  // 加载 CSS
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdn.jsdelivr.net/npm/docsify/themes/vue.css'
  document.head.appendChild(link)

  // 配置
  window.$docsify = {
    basePath: '/docs/',
    homepage: 'README.md',
    loadSidebar: true,
    auto2top: true,
    name: ''
  }

  // 加载 JS
  const script = document.createElement('script')
  script.id = 'docsify-script'
  script.src = 'https://cdn.jsdelivr.net/npm/docsify/lib/docsify.min.js'
  script.onload = () => {
  console.log('✅ Docsify script loaded')

  // 轮询直到 #main 出现（最多 5 秒）
  const maxAttempts = 50
  let attempts = 0
  const checkMain = setInterval(() => {
    const mainEl = document.getElementById('main')
    const container = document.getElementById('docsify-container')

    if (mainEl && container) {
      clearInterval(checkMain)
      container.appendChild(mainEl)
      console.log('✅ Docsify content moved to container')
    } else if (attempts >= maxAttempts) {
      clearInterval(checkMain)
      console.error('❌ Timeout: #main or #docsify-container never appeared')
      console.log('mainEl:', mainEl, 'container:', container)
    } else {
      attempts++
    }
  }, 100) // 每 100ms 检查一次
}
  script.onerror = () => {
    console.error('❌ Failed to load Docsify script')
  }
  document.body.appendChild(script)
})

onBeforeUnmount(() => {
  delete window.$docsify
})
</script>
