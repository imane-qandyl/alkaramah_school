#!/bin/bash
# TeachSmart Chatbot Server Startup Script
# Run this from the project root directory

echo "🤖 Starting TeachSmart Chatbot Server..."

# Check if we're in the right directory
if [ ! -d "python-server" ]; then
    echo "❌ Error: python-server directory not found."
    echo "   Please run this script from the project root directory."
    exit 1
fi

# Change to python-server directory
cd python-server

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing/updating requirements..."
pip install -r requirements.txt

echo "🚀 Starting chatbot server on http://localhost:5001"
echo "📱 React Native app can now connect to your trained model!"
echo ""
echo "💡 To stop the server, press Ctrl+C"
echo "🌐 Server will be available at:"
echo "   - http://localhost:5001"
echo "   - http://127.0.0.1:5001"
echo ""

python chatbot_server.py