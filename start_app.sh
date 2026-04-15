#!/bin/bash
# VitaCare Angular App Launch Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NG_DIR="$SCRIPT_DIR/vitacare-ng"

echo "=== VitaCare Angular App Setup ==="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "$NG_DIR/node_modules" ]; then
    echo "Installing Angular dependencies..."
    cd "$NG_DIR"
    npm install
fi

# Set API URL environment variable
export VITACARE_API_URL="${VITACARE_API_URL:-http://localhost:8000}"

echo "Starting VitaCare Angular app..."
echo "API URL: $VITACARE_API_URL"

# Launch the Angular dev server
cd "$NG_DIR"
npm start