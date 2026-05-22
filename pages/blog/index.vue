<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">我的博客</h1>
    
    <!-- 假设我们有几篇示例文章 -->
    <div class="space-y-8">
      <article v-for="post in posts" :key="post.slug" class="border-b pb-8 last:border-b-0">
        <NuxtLink :to="`/blog/${post.slug}`" class="group">
          <h2 class="text-2xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
            {{ post.title }}
          </h2>
          <p class="text-gray-600 mt-2">{{ post.excerpt }}</p>
          <p class="text-sm text-gray-500 mt-4">{{ post.date }}</p>
        </NuxtLink>
      </article>
    </div>
  </div>
</template>

<script setup>
// 此处模拟从 CMS 或 Markdown 文件读取的文章数据
const posts = ref([
  {
    slug: 'getting-started-with-nuxt3',
    title: 'Nuxt 3 入门指南',
    excerpt: '本文详细介绍如何使用 Nuxt 3 搭建一个现代化的 Web 应用。',
    date: '2025年9月20日'
  },
  {
    slug: 'tailwind-css-tips',
    title: 'Tailwind CSS 实用技巧',
    excerpt: '分享一些在实际项目中提升效率的 Tailwind CSS 使用技巧。',
    date: '2025年9月15日'
  },
  {
    slug: 'personal-website-design',
    title: '打造漂亮的个人网站',
    excerpt: '探讨个人网站的设计原则和优秀案例。',
    date: '2025年9月10日'
  }
])

useHead({
  title: '博客 - 我的个人网站',
  meta: [
    { name: 'description', content: '阅读我的技术文章、学习笔记和思考。' }
  ]
})
</script>
