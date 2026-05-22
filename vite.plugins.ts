// vite.plugins.ts
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

export default function tailwindConfigFallback() {
  return {
    name: 'tailwind-config-fallback',
    resolveId(id: string) {
      if (id === '#tailwind-config' || id.startsWith('#tailwind-config/')) {
        return id // 捕获所有 #tailwind-config 开头的导入
      }
      return null
    },
    load(id: string) {
      if (id === '#tailwind-config' || id.startsWith('#tailwind-config/')) {
        // 返回一个空的 colors 对象，防止运行时错误
        return `
          export default {}
        `
      }
      return null
    }
  }
}
