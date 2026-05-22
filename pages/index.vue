<!-- pages/index.vue -->
<template>
  <div class="home-page">
    <h1>Welcome ~  </h1>
    <p>这里记录我的思考、课程与生活点滴。</p>
    <p>👈 请从左侧导航开始浏览。</p>
  </div>
</template>

<script setup>
// 设置页面标题和 meta
useHead({
  title: 'Amigo 的个人主页', // ← 浏览器 Tab 显示的标题
  meta: [
    { name: 'description', content: '记录我的学习、课程与生活思考。' }
  ]
})
</script>

<style scoped>
.home-page {
  max-width: 600px;
  line-height: 1.7;
  color: #4a5568;
}
.home-page h1 {
  font-size: 2.2rem;
  margin-bottom: 1.2rem;
  color: #2d3748;
}
</style>
