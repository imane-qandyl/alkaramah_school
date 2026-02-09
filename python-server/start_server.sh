#!/bin/bash
# Teach Smart Chatbot Server Startup Script

echo "🤖 Starting Teach Smart Chatbot Server..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install requirements if they don't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing requirements..."
pip install -r requirements.txt

echo "🚀 Starting chatbot server on http://localhost:5000"
python chatbot_server.py