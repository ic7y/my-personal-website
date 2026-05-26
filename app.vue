<template>
  <div class="min-h-screen flex">
    <!-- 移动顶部栏（仅小屏显示） -->
    <header class="w-full md:hidden flex items-center justify-between p-3 bg-white shadow-sm">
      <button aria-label="Toggle menu" @click="mobileOpen = !mobileOpen" class="p-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <div class="text-lg font-medium">网站标题</div>
      <div style="width:36px"></div>
    </header>

    <!-- 传入 mobileOpen 并监听 close 事件 -->
    <AppSidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />

    <main class="flex-1">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppSidebar from '~/components/AppSidebar.vue'
const mobileOpen = ref(false)
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

.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: white;
  align-items: center;
  padding: 0 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  z-index: 30;
}

.hamburger {
  width: 40px;
  height: 40px;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
}
.hamburger-line {
  display: block;
  height: 2px;
  background: #333;
  border-radius: 2px;
}
.mobile-title {
  margin-left: 12px;
  font-weight: 600;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-left: 220px; /* 确保内容区从侧边栏右侧开始 */
  max-width: calc(100% - 220px); /* 根据侧边栏宽度调整 */
  box-sizing: border-box;
}

/* 当移动端侧边栏打开时，避免页面内容与顶部 header 重叠 */
.with-overlay-padding {
  padding-top: 64px;
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

/* 响应式：小屏幕时隐藏侧边栏，显示移动头部 */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
  .main-content {
    margin-left: 0;
    max-width: 100%;
    padding: 1rem;
  }
}

</style>
