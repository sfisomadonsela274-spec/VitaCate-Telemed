@echo off
setlocal enabledelayedexpansion

title VitaCare Setup

echo ===============================================
echo  VitaCare Setup - Environment and Dependencies
echo ===============================================
echo.

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.7 or higher and add it to your PATH.
    pause
    exit /b 1
)

REM Check Python version (minimum 3.7 for Kivy)
for /f "tokens=2 delims= " %%a in ('python --version 2^>^&1') do set python_version=%%a
for /f "tokens=1,2,3 delims=." %%i in ("!python_version!") do (
    if %%i LSS 3 (
        echo [ERROR] Python 3.7 or higher is required. Found version !python_version!
        pause
        exit /b 1
    )
    if %%i EQU 3 if %%j LSS 7 (
        echo [ERROR] Python 3.7 or higher is required. Found version !python_version!
        pause
        exit /b 1
    )
)

echo [INFO] Python !python_version! is installed and compatible.

REM Create and activate virtual environment
if not exist .venv (
    echo [INFO] Creating virtual environment...
    python -m venv .venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

echo [INFO] Activating virtual environment...
call .venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to activate virtual environment.
    pause
    exit /b 1
)

REM Install/upgrade pip and setuptools
echo [INFO] Updating pip and setuptools...
python -m pip install --upgrade pip setuptools wheel
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to update pip and setuptools.
    pause
    exit /b 1
)

REM Install required packages
echo [INFO] Installing required packages...
pip install kivy[base] kivy-deps.angle kivy-deps.glew kivy-deps.sdl2 django djangorestframework django-cors-headers requests python-dotenv pillow
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install required packages.
    pause
    exit /b 1
)

REM Check if requirements.txt exists and install dependencies
if exist requirements.txt (
    echo [INFO] Installing requirements from requirements.txt...
    pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Some requirements failed to install. Continuing...
    )
)

REM Run Django migrations
echo [INFO] Setting up Django database...
cd vitacare
python manage.py migrate --noinput
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database setup completed with warnings.
) else (
    echo [SUCCESS] Database setup completed successfully.
)
cd ..

echo.
echo ===============================================
echo [SUCCESS] Setup completed successfully!
echo.
echo To start the server, run: server_launch.bat
echo To start the Kivy app, run: kivy_launch.bat
echo ===============================================
echo.
pause
