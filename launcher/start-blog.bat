@echo off
setlocal
if not "%~1"=="" set "DESK_SEED_DIR=%~f1"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required.
  pause
  exit /b 1
)
node "%~dp0bootstrap.mjs" blog
set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" pause
exit /b %EXIT_CODE%
