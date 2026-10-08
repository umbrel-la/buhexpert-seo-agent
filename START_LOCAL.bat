@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js не найден. Установите Node.js с сайта:
  echo https://nodejs.org/
  goto :error
)

where npm >nul 2>&1
if errorlevel 1 (
  echo npm не найден. Установите Node.js с сайта:
  echo https://nodejs.org/
  goto :error
)

if not exist "node_modules\" (
  echo Установка зависимостей...
  call npm install
  if errorlevel 1 goto :error
)

echo Открываю БухЭксперт AI MVP...
start "" "http://localhost:3000"
call npm run dev
if errorlevel 1 goto :error
goto :end

:error
echo.
echo Не удалось запустить приложение. Окно останется открытым для просмотра ошибки.
pause
exit /b 1

:end
echo.
echo Сервер остановлен.
pause
