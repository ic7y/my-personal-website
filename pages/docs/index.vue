<template>
  <div class="docs-overview-page">
    <h1>课程文档</h1>
    <p class="subtitle">按课程组织文档，点击课程即可查看该课程下的全部文档。</p>

    <div class="course-grid">
      <NuxtLink
        v-for="course in docsCourses"
        :key="course.key"
        :to="`/docs/${course.key}`"
        class="course-card"
      >
        <h2>{{ course.title }}</h2>
        <p>{{ course.description }}</p>
        <span class="course-link">查看文档 →</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { docsCourses } from '../../utils/docs'
</script>

<style scoped>
.docs-overview-page {
  max-width: 980px;
  margin: 0 auto;
}

.subtitle {
  color: #166534;
  margin-top: 0.5rem;
  margin-bottom: 1.25rem;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.85rem;
}

.course-card {
  display: block;
  padding: 1.4rem;
  border: 1px solid #bbf7d0;
  border-radius: 18px;
  background: #f0fdf4;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  color: #164e2f;
  text-decoration: none;
}

.course-card:hover {
  border-color: #86efac;
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(16, 185, 129, 0.08);
}

.course-card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
}

.course-card p {
  margin: 0 0 1rem;
  color: #166534;
}

.course-link {
  color: #166534;
  font-weight: 700;
}
</style>