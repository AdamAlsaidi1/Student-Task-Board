#!/bin/bash

# Student Task Board - Backend Start Script (Always Running)
# This script ensures the backend stays running and restarts automatically

cd "$(dirname "$0")"

echo "🚀 Starting Student Task Board Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run: python3 -m venv venv"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import flask" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Function to start backend
start_backend() {
    echo "🔧 Starting backend server on http://localhost:5001..."
    python app.py >> backend.log 2>&1
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -ne 0 ] && [ $EXIT_CODE -ne 130 ]; then
        echo "⚠️  Backend crashed with exit code $EXIT_CODE"
        echo "🔄 Restarting in 3 seconds..."
        sleep 3
        start_backend
    fi
}

# Trap Ctrl+C
trap 'echo ""; echo "🛑 Stopping backend server..."; exit 0' SIGINT SIGTERM

# Start backend (will auto-restart on crash)
start_backend
