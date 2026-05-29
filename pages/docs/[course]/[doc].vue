<template>
  <div class="docs-page-layout">
    <aside class="docs-sidebar">
      <h2>{{ course.title }}</h2>
      <p class="course-description">{{ course.description }}</p>
      <nav>
        <ul>
          <li v-for="item in course.docs" :key="item.key">
            <NuxtLink :to="`/docs/${course.key}/${item.key}`" class="doc-link" :class="{ active: item.key === doc.key }">
              {{ item.title }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <section class="docs-content">
      <div class="doc-header">
        <h1>{{ doc.title }}</h1>
      </div>
      <div class="doc-body" v-html="htmlContent"></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getCourse, getDoc } from '../../../utils/docs'

const route = useRoute()
const courseKey = route.params.course as string
const docKey = route.params.doc as string
const course = getCourse(courseKey)

if (!course) {
  throw createError({ statusCode: 404, statusMessage: '未找到课程' })
}

const doc = getDoc(courseKey, docKey)
if (!doc) {
  throw createError({ statusCode: 404, statusMessage: '未找到文档' })
}

const rawMarkdown = ref('')

const docDir = doc.file.includes('/') ? doc.file.replace(/\/[^/]*$/, '') : ''

const resolveRelativeToDoc = (href = '') => {
  if (!href) return href
  if (/^(?:https?:\/\/|\/|#)/.test(href)) return href

  const docParts = docDir ? docDir.split('/').filter(Boolean) : []
  const hrefParts = href.split('/').filter(Boolean)
  // Support Markdown that accidentally repeats the current doc directory prefix
  // or includes an extra leading "docs" segment (e.g. './docs/competitions/..').
  if (hrefParts[0] === 'docs') {
    hrefParts.shift()
  }
  if (docParts.length && hrefParts[0] === docParts[0]) {
    hrefParts.shift()
  }

  const stack = [...docParts]

  for (const part of hrefParts) {
    if (part === '.') continue
    if (part === '..') stack.pop()
    else stack.push(part)
  }

  return '/docs/' + stack.join('/')
}

const normalizeDocsUrls = (markdown = '') => {
  // 1) Markdown links/images: ![alt](path) or [link](path)
  markdown = markdown.replace(/(!?\[[^\]]*\]\()([^)"]+)(\))/g, (m, prefix, url, suffix) => {
    const clean = url.trim()
    if (/^(?:https?:\/\/|\/|#)/.test(clean)) return m
    return `${prefix}${resolveRelativeToDoc(clean)}${suffix}`
  })

  // 2) HTML attributes like src="..." or poster='...'
  markdown = markdown.replace(/(\b(?:src|poster|href)=["'])([^"']+)(["'])/g, (m, p1, url, p3) => {
    const clean = url.trim()
    if (/^(?:https?:\/\/|\/|#)/.test(clean)) return m
    return `${p1}${resolveRelativeToDoc(clean)}${p3}`
  })

  return markdown
}

onMounted(async () => {
  const res = await $fetch(`/docs/${doc.file}`)
  const source = typeof res === 'string' ? res : String(res)
  rawMarkdown.value = normalizeDocsUrls(source)
})

const htmlContent = computed(() => {
  if (!rawMarkdown.value) {
    return '<p>正在加载文档...</p>'
  }
  return marked.parse(rawMarkdown.value)
})
</script>

<style scoped>
.docs-page-layout {
  display: grid;
  grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
  gap: 1rem;
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
}

.docs-sidebar {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: #f8fbff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
}

.docs-sidebar h2 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
}

.course-description {
  color: #4b5563;
  margin-bottom: 1rem;
  line-height: 1.65;
}

.docs-sidebar nav {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.docs-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.35rem;
}

.doc-link {
  display: block;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  color: #111827;
  background: #f4f7fb;
  text-decoration: none;
  transition: all 0.2s ease;
}

.doc-link:hover {
  background: #e2efff;
}

.doc-link.active {
  background: #dbeafe;
  color: #42b983;
  font-weight: 700;
  border-left: 4px solid #42b983;
}

.docs-content {
  padding: 1.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  background: #ffffff;
}

.doc-header h1 {
  margin-top: 0;
  font-size: 2rem;
  letter-spacing: -0.02em;
}

.doc-body {
  margin-top: 1.5rem;
  line-height: 1.85;
  color: #1f2937;
}

.doc-body p {
  color: #4b5563;
}

.doc-body img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
  border-radius: 12px;
}

.doc-body h1,
.doc-body h2,
.doc-body h3,
.doc-body h4 {
  margin-top: 1.5rem;
}

.doc-body pre {
  background: #111827;
  color: #fff;
  padding: 1rem;
  border-radius: 12px;
  overflow-x: auto;
}

.doc-body code {
  background: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
}

.doc-body a {
  color: #42b983;
  text-decoration: underline;
}

@media (max-width: 960px) {
  .docs-page-layout {
    grid-template-columns: 1fr;
  }
}
</style>
