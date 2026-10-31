@echo off
title 🛡️ BrandGuard AI - Live Gemini Terminal
color 0A
cls
echo =====================================================================
echo   🛡️  BrandGuard AI Engine - Live Gemini 3.8 Flash Logs
echo =====================================================================
echo.
echo [1/2] Checking and freeing port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
echo [2/2] Launching BrandGuard AI Server...
echo.
echo Ready for live judging demonstration!
echo.
npx tsx server/src/index.ts
pause

