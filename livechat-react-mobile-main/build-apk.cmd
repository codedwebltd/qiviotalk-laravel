@echo off
REM Livechat Mobile - APK Build & Deploy Script (Windows)
REM Run this script to build and deploy your app to Expo

echo.
echo ======================================
echo   Livechat Mobile APK Build Process
echo ======================================
echo.

REM Check if eas-cli is installed
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] EAS CLI is not installed.
    echo [INFO] Installing EAS CLI globally...
    call npm install -g eas-cli
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install EAS CLI
        pause
        exit /b 1
    )
    echo [SUCCESS] EAS CLI installed successfully!
    echo.
)

REM Login to Expo
echo [INFO] Checking Expo authentication...
eas whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Please login to your Expo account:
    call eas login
) else (
    for /f "delims=" %%i in ('eas whoami') do set EXPO_USER=%%i
    echo [SUCCESS] Logged in as: %EXPO_USER%
)
echo.

REM Build the APK
echo ======================================
echo   Building Android APK (Production)
echo ======================================
echo.
echo This will take several minutes.
echo You can close this window and check status on Expo.
echo.

call eas build --platform android --profile production --non-interactive

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================
    echo   Build Request Submitted!
    echo ======================================
    echo.
    echo Next Steps:
    echo 1. Wait for the build to complete ^(you'll get an email^)
    echo 2. Download the APK from the Expo dashboard
    echo 3. Install it on your Android device for testing
    echo.
    echo View build status at: https://expo.dev
    echo.
    echo [SUCCESS] Done!
) else (
    echo.
    echo [ERROR] Build failed. Please check the error messages above.
)

echo.
pause
