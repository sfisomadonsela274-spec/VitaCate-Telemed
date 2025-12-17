@echo off
setlocal enabledelayedexpansion

title VitaCare Django Server

echo ===============================================
echo  Starting VitaCare Django Server
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

REM Change to Django project directory
cd vitacare

REM Check Django settings
echo [INFO] Checking Django configuration...
python manage.py check
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Django configuration check failed.
    pause
    exit /b 1
)

REM Run migrations
echo [INFO] Running database migrations...
python manage.py migrate --noinput
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database migrations failed. The server might not work correctly.
    pause
)

echo.
echo ===============================================
echo [SUCCESS] Starting Django development server...
echo [INFO] Server will be available at: http://127.0.0.1:8000/
echo ===============================================
echo.

REM Start Django development server
python manage.py runserver

REM Keep the window open if there's an error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] The server has stopped. Press any key to exit...
    pause >nul
)

exit /b 0
