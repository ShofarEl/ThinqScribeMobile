@echo off
setlocal EnableDelayedExpansion

REM Enhanced Vercel Deployment Script for ThinqScribe Frontend
echo 🚀 Starting Vercel deployment for ThinqScribe Frontend...

REM Check if Vercel CLI is installed
echo [INFO] Checking Vercel CLI installation...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Vercel CLI is not installed. Installing now...
    npm install -g vercel
    if errorlevel 1 (
        echo [ERROR] Failed to install Vercel CLI
        pause
        exit /b 1
    )
)

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the frontend directory
    pause
    exit /b 1
)

REM Check Node.js version
echo [INFO] Checking Node.js version...
for /f "tokens=2 delims=v" %%a in ('node --version') do set NODE_VERSION=%%a
echo [INFO] Node.js version: %NODE_VERSION%

REM Clean previous build
if exist "dist" (
    echo [INFO] Cleaning previous build...
    rmdir /s /q "dist"
)

REM Install dependencies
echo [INFO] Installing dependencies...
npm ci --silent
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

REM Run linter
echo [INFO] Running linter...
npm run lint --silent
if errorlevel 1 (
    echo [WARNING] Linting issues found, but continuing deployment...
)

REM Build the project
echo [INFO] Building the project...
npm run build
if errorlevel 1 (
    echo [ERROR] Build failed. Please check for errors.
    pause
    exit /b 1
)

REM Check if build was successful
if not exist "dist" (
    echo [ERROR] Build directory not found. Build may have failed.
    pause
    exit /b 1
)

echo [SUCCESS] ✅ Build completed successfully!

REM Deploy to Vercel
echo [INFO] Deploying to Vercel...
vercel --prod --yes
if errorlevel 1 (
    echo [ERROR] Deployment failed
    pause
    exit /b 1
)

echo [SUCCESS] 🎉 Deployment completed successfully!
echo [INFO] 📱 Your app should be live at: https://thinqscribe.vercel.app
echo [INFO] 🌐 Custom domain: https://thinqscribe.com
echo [INFO] 🔗 Run 'vercel' to get the exact deployment URL
echo.
echo Press any key to continue...
pause >nul 