<template>
  <div class="app-layout">
    <AppSidebar />
    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
const route = useRoute()

// Docsify 路径列表（请根据实际情况修改）
const DOCSIFY_PATHS = ['/docs']
// 仅在客户端执行
if (process.client) {
  const updateBodyClass = () => {
    const isDocsify = DOCSIFY_PATHS.some(path => route.path.startsWith(path))
    if (isDocsify) {
      document.body.classList.remove('main-site-background')
    } else {
      document.body.classList.add('main-site-background')
    }
  }

  // 初始执行
  updateBodyClass()

  // 监听路由变化（Nuxt 3 中 route 是响应式的）
  watch(
    () => route.path,
    () => updateBodyClass()
  )
}
</script>

<style>
/* 定义主站背景样式（请替换为您实际的 404 背景）*/
@import '~/assets/css/tailwind.css';
body.main-site-background {
  /* background-color: #e6f7ee;  浅绿色背景 */
  background: radial-gradient(circle at 10% 20%, #f0f5ff 0%, #e6f7ee 90%) !important;
  background-attachment: fixed !important;
}


html, body {
  height: 100%;
  margin: 0;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-left: 220px; /* 确保内容区从侧边栏右侧开始 */
  max-width: calc(100% - 220px); /* 根据侧边栏宽度调整 */
  box-sizing: border-box;
}

/* 移除 body 上的背景，改用 class 控制 */
body {
  margin: 0;
  background: transparent !important;
}

/* 主站背景样式（从原 404 页面复制过来）*/
.with-main-bg {
  background: radial-gradient(circle at 10% 20%, #f0f5ff 0%, #e6f0ff 90%) !important;
  background-attachment: fixed !important;
  min-height: 100vh;
}

</style>
