@echo off
title Harvey Autonomous 24h Sales Engine
cd /d "%~dp0"
echo ======================================================
echo   Starting Harvey Daemon on http://127.0.0.1:5555
echo ======================================================
npm run daemon
pause
