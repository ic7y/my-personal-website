<template>
  <div class="app-layout">
    <header class="mobile-header">
      <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      <div class="mobile-title">个人主页</div>
    </header>

    <AppSidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />

    <main class="main-content">
      <NuxtPage />
    </main>
    <footer v-if="route.path === '/'" class="site-footer"><a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">陕ICP备2025062258号-1</a></footer>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '~/components/AppSidebar.vue'

const mobileOpen = ref(false)
const route = useRoute()

const DOCSIFY_PATHS = ['/docs']
if (process.client) {
  const updateBodyClass = () => {
    const isDocsify = DOCSIFY_PATHS.some(path => route.path.startsWith(path))
    if (isDocsify) {
      document.body.classList.remove('main-site-background')
    } else {
      document.body.classList.add('main-site-background')
    }
  }

  updateBodyClass()

  watch(
    () => route.path,
    () => updateBodyClass()
  )
}
</script>

<style>
@import '~/assets/css/tailwind.css';

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
  background: #ffffff;
  align-items: center;
  justify-content: flex-start;
  padding: 0 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  z-index: 50;
}

.hamburger {
  width: 38px;
  height: 38px;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 6px;
  cursor: pointer;
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background: #111827;
  border-radius: 2px;
}

.mobile-title {
  margin-left: 12px;
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  margin-left: 260px;
  box-sizing: border-box;
  min-height: 100vh;
  padding-bottom: 72px;
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .mobile-header {
    display: flex;
  }

  .main-content {
    margin-left: 0;
    padding: 80px 1rem 1rem;
  }
}

.site-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  color: #374151;
  font-size: 14px;
  z-index: 40;
}

@media (max-width: 768px) {
  .site-footer {
    left: 0;
  }
}
</style>
