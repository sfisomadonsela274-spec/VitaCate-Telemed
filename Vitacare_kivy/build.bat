@echo off
echo Installing PyInstaller...
python -m pip install pyinstaller
echo.
echo Building VitaCare Application...
python -m PyInstaller main.py --name VitaCare --onefile --windowed --icon=assets/icon.ico --add-data "kv;kv" --add-data "assets;assets"
echo.
echo Build complete! Check the 'dist' folder.
pause