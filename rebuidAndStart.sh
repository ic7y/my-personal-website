#!/bin/bash
cd /home/ubuntu/amigo/my-personal-website
echo "正在构建..."

# 删除所有缓存
rm -rf .nuxt
rm -rf node_modules/.cache
npm run build

echo "正在部署（启动或重启 PM2）..."
pm2 startOrRestart ecosystem.config.cjs
