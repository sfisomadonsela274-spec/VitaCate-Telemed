#!/bin/bash
# VitaCare Server Launch Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/vitacare"

echo "=== VitaCare Server Setup ==="

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/update requirements
echo "Installing requirements..."
pip install --upgrade pip
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt requests

# Run migrations
echo "Running migrations..."
cd "$PROJECT_DIR"
python manage.py migrate --run-syncdb

# Start server
echo "Starting VitaCare server on http://0.0.0.0:8000..."
python manage.py runserver 0.0.0.0:8000