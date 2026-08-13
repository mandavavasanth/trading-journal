@echo off
echo Starting Trading Journal Development Server...
cd /d "%~dp0"

:: Check if node_modules exists, if not run npm install
if not exist node_modules (
    echo Installing dependencies for the first time...
    npm ci
)

echo Opening browser...
start http://localhost:5173

echo Starting Vite server...
npm run dev

pause
