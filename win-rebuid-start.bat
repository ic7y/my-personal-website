@echo off
echo 正在构建项目...

:: 删除 Nuxt 缓存（Windows 命令）
rmdir /s /q .nuxt
rmdir /s /q node_modules\.cache 2>nul

:: 构建项目
npm run build

echo.
echo 正在启动 PM2...
echo.

:: Windows 下用 PM2 启动
pm2 startOrRestart win-ecosystem.config.cjs

node .output/server/index.mjs
echo.
echo ✅ 部署完成！网站已运行
pause