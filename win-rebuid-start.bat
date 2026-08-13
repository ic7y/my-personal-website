@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ========== 配置项 ==========
set PORT=8080
set NITRO_PORT=8080
set SERVER_PATH=.\.output\server\index.mjs
:: ============================

echo ==============================================
echo 正在重启 Nuxt 生产服务，端口：%PORT%
echo ==============================================

:: 1. 杀掉占用指定端口的旧进程
echo.
echo [1/4] 清理旧进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
    echo 杀掉占用端口%PORT%的进程 PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)
:: 额外清理一下默认8080端口的残留进程，避免旧进程干扰
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo 清理残留8080端口进程 PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

:: 2. 清理构建缓存
echo.
echo [2/4] 清理构建缓存...
if exist .nuxt (
    rmdir /s /q .nuxt
    echo 已删除 .nuxt 缓存
)
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo 已删除 node_modules 缓存
)

:: 3. 执行生产构建（必须加 call，否则脚本执行到这就终止）
echo.
echo [3/4] 执行生产构建...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
)
echo ✅ 构建完成

:: 4. 启动生产服务
echo.
echo [4/4] 启动服务，端口：%PORT%
echo 服务地址：http://localhost:%PORT%
echo 关闭此窗口即可停止服务
echo ==============================================

@REM set NODE_ENV=production
@REM set HOST=0.0.0.0

npm run dev -- --port 8080 --no-clear

pause
