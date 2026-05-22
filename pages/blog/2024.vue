<template>
  <div v-if="post">
    <h1 class="text-3xl font-bold mb-4">{{ post.title }}</h1>
    <p class="text-gray-600 mb-6">{{ post.date }}</p>
    
    <div class="prose prose-lg max-w-none">
      <!-- 在真实项目中，这里会渲染从 Markdown 解析后的内容 -->
      <p>{{ post.content }}</p>
      <p>这是文章的第二段内容...</p>
      <p>更多详细信息可以在这里展开。</p>
    </div>

    <hr class="my-8">
    <NuxtLink to="/blog" class="text-blue-600 hover:underline">&larr; 返回博客列表</NuxtLink>
  </div>
  <div v-else>
    <p>文章加载中...</p>
  </div>
</template>

<script setup>
const route = useRoute()
const post = ref(null)

// 模拟根据 slug 加载文章数据
const allPosts = [
  {
    slug: 'getting-started-with-nuxt3',
    title: 'Nuxt 3 入门指南',
    date: '2025年9月20日',
    content: '这是 Nuxt 3 入门指南的详细内容...'
  },
  // ... 其他文章
]

onMounted(() => {
  const found = allPosts.find(p => p.slug === route.params.slug)
  post.value = found || { title: '文章未找到', content: '抱歉，您查找的文章不存在。', date: '' }
})

useHead(() => ({
  title: post.value ? `${post.value.title} - 我的个人网站` : '文章 - 我的个人网站'
}))
</script>
