@echo off
echo ================================
echo   NovelForge 公网部署
echo ================================
echo.

echo [1/2] 启动后端 (端口 3001)...
start "NovelForge-Backend" cmd /c "cd /d D:\AInovelweb\backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] 启动前端 (端口 3000)...
start "NovelForge-Frontend" cmd /c "cd /d D:\AInovelweb\frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo 正在启动 Cloudflare 隧道...
echo.
D:\AInovelweb\tools\cloudflared.exe tunnel --url http://localhost:3000
