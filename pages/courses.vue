<template>
  <div id="docsify-container" style="margin-left: 220px; padding: 20px;">
    <!-- Docsify will render here -->
  </div>
</template>

<script setup>
if (process.client) {
  
  await new Promise(resolve => setTimeout(resolve, 100))
 
  const script = document.createElement('script')
  script.textContent = `
    (function() {
      'use strict';
      
      var container = document.getElementById('docsify-container');
      if (!container || container.children.length > 0) {
        console.log('Docsify already initialized or container missing');
        return;
      }

      window.$docsify = {
        el: '#docsify-container',     // ← 指定挂载点
        basePath: '/docs/',
        homepage: 'README.md',
        loadSidebar: true,
        auto2top: true,
        name: '',
        debug: true                   // 现在应该有日志了！
      };

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/docsify/themes/vue.css';
      document.head.appendChild(link);

      // Load Docsify
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/docsify@4.13.1/lib/docsify.min.js';
      s.onload = () => console.log('[Inline] Docsify loaded');
      document.body.appendChild(s);
    })();
  `

  document.head.appendChild(script)
}
</script>
