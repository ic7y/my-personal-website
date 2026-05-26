<template>
  <div>
    <div v-if="mobileOpen" class="sidebar-overlay" @click="$emit('close')"></div>
    <nav :class="['main-sidebar', { open: mobileOpen }]">
    <ul class="sidebar-menu">

      <!-- 课程（可展开） -->
      <li class="menu-item has-children" >
        <button
          class="menu-toggle"
          @click="toggleSubmenu('courses')"
          :class="{ active: openSubmenus.courses }"
        >
          课程
          <span class="arrow">▶</span>
        </button>
        <ul v-show="openSubmenus.courses" class="submenu">
          <li><a href="/docs#/company-road" class="submenu-link" active-class="active" >互联网公司职场之路</a></li>
          <li><a href="/docs/" class="submenu-link" active-class="active" >大数据分析项目实践</a></li>
          <li><a href="/docs#/software" class="submenu-link" active-class="active">软件工程</a></li>
          <li><a href="/docs#/c++" class="submenu-link" active-class="active" >面向对象程序设计</a></li>
          <li><a href="/docs#/competitions" class="submenu-link" active-class="active" >比赛</a></li>
          <!-- 可继续添加 -->
        </ul>
      </li>

      <!-- 随感（可展开） -->
      <li class="menu-item has-children" active-class="active" > 
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
      <!-- 关于我（无子项） -->
      <li>
        <NuxtLink to="/about" class="menu-link" active-class="active" >关于我</NuxtLink>
      </li>
    </ul>
  </nav>

  </div>
</template>

<script setup>
import { ref, reactive, toRef } from 'vue'
const props = defineProps({
  mobileOpen: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

// 控制哪些子菜单展开
const openSubmenus = reactive({
  courses: false,
  thoughts: false
})

// 切换子菜单展开状态
const toggleSubmenu = (key) => {
  openSubmenus[key] = !openSubmenus[key]
}

// expose mobileOpen as reactive ref
const mobileOpen = toRef(props, 'mobileOpen')
</script>

<style scoped>
.main-sidebar {
  width: 240px;
  background: #f8f9fa;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  border-right: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-shadow: 2px 0 6px rgba(0,0,0,0.05);
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

/* 主菜单按钮样式 */
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

/* 悬停示廓效果（高亮右侧边框 + 背景微变）*/
.menu-toggle:hover,
.menu-link:hover {
  background-color: #e6f7ee; /* 浅绿色背景 */
  color: #2a9d8f;            /* 稍深的绿色文字（可选）*/
  /* 移除蓝色边框/阴影 */
  box-shadow: none;
}

/* 子菜单容器 */
.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fff;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

/* 子菜单项 */
.submenu-link {
  display: block;
  padding: 12px 20px 12px 40px;
  color: #555;
  text-decoration: none;
  font-weight: 400;
  transition: all 0.2s;
  border-radius: 0 30px 30px 0;
}

.submenu-link:hover {
  color: #42b983 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

/* 箭头旋转动画 */
.arrow {
  transition: transform 0.3s ease;
  font-size: 12px;
  color: #888;
}

.menu-toggle.active .arrow {
  transform: rotate(90deg);
}
/* 选中高亮：绿色 #42b983 */
.menu-link.active {
  color: #42b983 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
/* 响应式（可选） */
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
  /* 减小桌面样式在移动端的间距 */
  .menu-toggle,
  .menu-link {
    padding: 12px 16px;
    font-size: 15px;
  }
}
</style>
