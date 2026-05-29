<template>
  <div class="docs-page-layout">
    <aside class="docs-sidebar">
      <h2>{{ course.title }}</h2>
      <p class="course-description">{{ course.description }}</p>
      <nav>
        <ul>
          <li v-for="doc in course.docs" :key="doc.key">
            <NuxtLink :to="`/docs/${course.key}/${doc.key}`" class="doc-link">
              {{ doc.title }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <section class="docs-content">
      <div class="docs-intro">
        <h1>{{ course.title }}</h1>
        <p>请从左侧选择一个文档。每个文档都是一个独立的 Markdown 文件。</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getCourse } from '../../../utils/docs'

const route = useRoute()
const courseKey = route.params.course as string
const course = getCourse(courseKey)

if (!course) {
  throw createError({ statusCode: 404, statusMessage: '未找到课程' })
}
</script>

<style scoped>
.docs-page-layout {
  display: grid;
  grid-template-columns: minmax(260px, 280px) minmax(0, 1fr);
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.docs-sidebar {
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
}

.docs-sidebar h2 {
  margin-top: 0;
}

.course-description {
  color: #6b7280;
  margin-bottom: 1.25rem;
}

.docs-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.doc-link {
  display: block;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  color: #111827;
  background: #f8fafc;
  text-decoration: none;
  transition: background 0.2s ease;
}

.doc-link:hover {
  background: #e0f2fe;
}

.docs-content {
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
}

.docs-intro h1 {
  margin-top: 0;
}

@media (max-width: 960px) {
  .docs-page-layout {
    grid-template-columns: 1fr;
  }
}
</style>