@echo off
echo ============================================
echo DocMachina Setup Script
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo Download the LTS version and run the installer.
    echo.
    pause
    exit /b 1
)

echo Node.js is installed.
echo.

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available!
    echo Please reinstall Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo npm is available.
echo.

REM Install dependencies
echo Installing dependencies...
echo This may take a few minutes...
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo You can now run DocMachina with one of these commands:
echo.
echo   npm start           - Run the application in development mode
echo   npm run build:win   - Build a Windows installer
echo.
echo The built application will be in the 'dist' folder.
echo.
pause
