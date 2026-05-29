<template>
  <div>
    <div v-if="mobileOpen" class="sidebar-overlay" @click="emitClose"></div>
    <nav :class="['main-sidebar', { open: mobileOpen }]">
      <ul class="sidebar-menu">
        <li class="menu-item has-children">
          <button
            class="menu-toggle"
            @click="toggleSubmenu('courses')"
            :class="{ active: openSubmenus.courses }"
          >
            课程
            <span class="arrow">▶</span>
          </button>
          <ul v-show="openSubmenus.courses" class="submenu">
            <li><NuxtLink to="/docs/company-road" class="submenu-link">互联网公司职场之路</NuxtLink></li>
            <li><NuxtLink to="/docs/bigdata-apply" class="submenu-link">大数据技术及应用</NuxtLink></li>
            <li><NuxtLink to="/docs/bigdata-project" class="submenu-link">大数据分析项目实践</NuxtLink></li>
            <li><NuxtLink to="/docs/software-data-engineering" class="submenu-link">软件工程</NuxtLink></li>
            <li><NuxtLink to="/docs/c++" class="submenu-link">面向对象程序设计</NuxtLink></li>
            <li><NuxtLink to="/docs/competitions" class="submenu-link">比赛</NuxtLink></li>
          </ul>
        </li>

        <li class="menu-item has-children">
          <button
            class="menu-toggle"
            @click="toggleSubmenu('thoughts')"
            :class="{ active: openSubmenus.thoughts }"
          >
            随感
            <span class="arrow">▶</span>
          </button>
          <ul v-show="openSubmenus.thoughts" class="submenu">
            <li><NuxtLink to="/blog/2024" class="submenu-link">2024 年随笔</NuxtLink></li>
            <li><NuxtLink to="/blog/tech" class="submenu-link">技术杂谈</NuxtLink></li>
          </ul>
        </li>

        <li>
          <NuxtLink to="/about" class="menu-link">关于我</NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { reactive, toRef } from 'vue'

const props = defineProps({
  mobileOpen: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const mobileOpen = toRef(props, 'mobileOpen')

const openSubmenus = reactive({
  courses: false,
  thoughts: false
})

const toggleSubmenu = (key) => {
  openSubmenus[key] = !openSubmenus[key]
}

const emitClose = () => emit('close')
</script>

<style scoped>
.main-sidebar {
  width: 260px;
  background: #ecfdf5;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  border-right: 1px solid #bbf7d0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-shadow: 2px 0 14px rgba(16, 185, 129, 0.08);
  z-index: 60;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  position: relative;
}

.menu-toggle,
.menu-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 14px 20px;
  background: none;
  border: none;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0 40px 40px 0;
}

.menu-toggle:hover,
.menu-link:hover {
  background-color: #d1fae5;
  color: #166534;
  box-shadow: none;
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fff;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.submenu-link {
  display: block;
  padding: 12px 20px 12px 28px;
  color: #555;
  text-decoration: none;
  font-weight: 400;
  transition: all 0.2s;
  border-radius: 0 28px 28px 0;
}
.submenu-link:hover {
  color: #166534 !important;
  background: #dcfce7 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

.menu-toggle.active .arrow {
  color: #166534;
}

.menu-link.active {
  color: #166534 !important;
  background: #d1fae5 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

.arrow {
  transition: transform 0.3s ease;
  font-size: 12px;
  color: #888;
}

.menu-toggle.active .arrow {
  transform: rotate(90deg);
}

.menu-link.active {
  color: #42b983 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

@media (max-width: 768px) {
  .main-sidebar {
    width: 80%;
    max-width: 320px;
    transform: translateX(-100%);
    transition: transform 0.28s ease;
    height: 100vh;
  }
  .main-sidebar.open {
    transform: translateX(0);
  }
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 50;
  }
  .menu-toggle,
  .menu-link {
    padding: 12px 16px;
    font-size: 15px;
  }
}
</style>
