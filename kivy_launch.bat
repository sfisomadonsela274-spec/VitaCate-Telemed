@echo off
setlocal enabledelayedexpansion

title VitaCare Kivy Application

echo ===============================================
echo  Starting VitaCare Kivy Application
echo ===============================================
echo.

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.7 or higher and try again.
    pause
    exit /b 1
)

REM Activate virtual environment
if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
) else (
    echo [ERROR] Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

REM Change to Kivy app directory
cd Vitacare_kivy

echo.
echo ===============================================
echo [SUCCESS] Starting VitaCare Kivy Application...
echo ===============================================
echo.

REM Start the Kivy application
python main.py

REM Keep the window open if there's an error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] The application has stopped. Press any key to exit...
    pause >nul
)

exit /b 0
