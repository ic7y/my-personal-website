// tailwind.config.js
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './node_modules/@nuxt/ui/dist/ui.mjs'
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          500: '#10b981'
        },
	green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          900: '#166534',
        },
        cool: {
          50: '#f9fafb',
          100: '#f3f4f6',
          900: '#111827',
        }
      }
    }
  },
  plugins: []
}
