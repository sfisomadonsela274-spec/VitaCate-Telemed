#!/bin/bash
# VitaCare Kivy App Launch Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== VitaCare App Setup ==="

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install --upgrade pip
pip install kivy kivymd requests stripe

# Set environment variable for API URL (optional - defaults to localhost:8000)
export VITACARE_API_URL="${VITACARE_API_URL:-http://127.0.0.1:8000}"

echo "Starting VitaCare app..."
echo "API URL: $VITACARE_API_URL"

# Launch the app
cd "$SCRIPT_DIR/Vitacare_kivy"
python main.py