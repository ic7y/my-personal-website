<!-- pages/about.vue -->
<template>
  <div class="py-12 px-6 max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold text-center mb-12">关于我</h1>

    <!-- 三栏布局 -->
    <div class="flex flex-row space-x-10">

      <!-- 第一栏：照片（固定宽度） -->
      <div class="flex-shrink-0 w-96">
        <div class="aspect-[3/4] overflow-hidden rounded-xl shadow-lg border border-gray-200">
          <img
            src="/images/baidu-profile2.jpg"
            alt="Amigo"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <!-- 第二栏 + 第三栏 容器 -->
      <div class="flex-1 grid grid-cols-2 gap-8">

        <!-- 第二栏：前半部分内容 -->
        <div class="space-y-6 text-lg">
          <div>
            <h2 class="text-xl font-semibold text-emerald-500 mb-1">姓名</h2>
            <p>吴涛</p>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-emerald-500 mb-1">学历</h2>
            <p>计算机科学硕士</p>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-emerald-500 mb-1">履历</h2>
            <p>百度、阿里巴巴</p>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-emerald-500 mb-1">兴趣</h2>
            <p>马拉松、越野、爬山</p>
          </div>
        </div>

        <!-- 第三栏：后半部分内容 -->
        <div class="space-y-6 text-lg">
          <div>
            <h2 class="text-xl font-semibold text-emerald-500 mb-1">职位</h2>
            <p>高级算法工程师</p>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-emerald-500 mb-1">研究领域</h2>
            <p>信息安全、机器人</p>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-emerald-500 mb-1">技能</h2>
            <ul class="space-y-1">
              <li>Java / Spring Boot</li>
              <li>Python / PyTorch</li>
              <li>Scala / Spark</li>
              <li>Go</li>
              <li>Node.js</li>
            </ul>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-emerald-500 mb-1">联系方式</h2>
            <ul class="space-y-1">
              <li>
                Email:
                <a href="mailto:wutao25@163.com" class="text-blue-600 hover:underline">
                  wutao25@163.com
                </a>
              </li>
              <li>
                GitHub:
                <a href="https://github.com/ic7y" target="_blank" rel="noopener" class="text-blue-600 hover:underline">
                  github.com/ic7y
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
