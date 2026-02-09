# 🤖 Trained Chatbot Integration Setup

Your trained model `teach_smart_chatbot.pkl` has been integrated into the Teach Smart app! Here's how to set it up and use it.

## 🚀 Quick Start

### 1. Start the Python Server
```bash
cd python-server
./start_server.sh
```

### 2. Test the Integration
- Open the Teach Smart app
- Go to **Profile** tab
- Tap **"Test Trained Chatbot Model"**
- Should show: "Trained Chatbot Connected! 🤖"

### 3. Create Resources
- Go to **Home** screen
- Tap **"Create Resource"**
- The app will automatically use your trained model first!

## 📋 Detailed Setup

### Prerequisites
- Python 3.7+ installed
- Your trained model file: `teach_smart_chatbot.pkl`

### Installation Steps

1. **Navigate to Python Server Directory**
   ```bash
   cd python-server
   ```

2. **Make Start Script Executable**
   ```bash
   chmod +x start_server.sh
   ```

3. **Start the Server**
   ```bash
   ./start_server.sh
   ```

   This will:
   - Create a Python virtual environment
   - Install required packages (Flask, Flask-CORS, etc.)
   - Load your trained model
   - Start the server on http://localhost:5000

### Manual Setup (Alternative)

If the script doesn't work, you can set up manually:

```bash
cd python-server

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start server
python chatbot_server.py
```

## 🔧 How It Works

### AI Service Priority
The app uses AI services in this order:
1. **🤖 Trained Chatbot** (Your custom model - BEST)
2. **☁️ Azure OpenAI** (Cloud service)
3. **🎭 Mock Responses** (Fallback)

### API Endpoints
Your Python server provides these endpoints:
- `GET /health` - Check server status
- `POST /generate-resource` - Generate educational resources
- `GET /test-connection` - Test the connection
- `GET /get-aet-targets` - Get available AET targets

### Integration Flow
1. User creates a resource in the app
2. App tries your trained chatbot first
3. If successful, uses your model's response
4. If not available, falls back to Azure OpenAI or mock

## 🧪 Testing

### Test Individual Services
- **Trained Chatbot**: Profile → "Test Trained Chatbot Model"
- **Azure OpenAI**: Profile → "Test Azure OpenAI Connection"
- **All Services**: Profile → "Test All AI Services"

### Expected Results
- ✅ **Trained Chatbot Connected**: Your model is working
- ❌ **Not Available**: Python server not running

## 🛠️ Troubleshooting

### Server Won't Start
```bash
# Check Python version
python3 --version

# Check if port 5000 is free
lsof -i :5000

# Kill any process using port 5000
kill -9 $(lsof -t -i:5000)
```

### Model Loading Issues
- Ensure `teach_smart_chatbot.pkl` is in the project root
- Check Python version compatibility
- Verify all required packages are installed

### Connection Issues
- Make sure server is running on http://localhost:5000
- Check firewall settings
- Ensure React Native app can access localhost

## 📱 Using in the App

### Creating Resources
1. Open Teach Smart app
2. Go to Home → "Create Resource"
3. Fill in student details and AET targets
4. Tap "Generate Resource"
5. Your trained model will generate the content!

### Checking Status
- Profile tab shows AI service status
- Green checkmarks = working
- Red X = not available

## 🔄 Server Management

### Start Server
```bash
cd python-server && ./start_server.sh
```

### Stop Server
Press `Ctrl+C` in the terminal running the server

### Restart Server
```bash
# Stop with Ctrl+C, then:
./start_server.sh
```

## 📊 Model Requirements

Your `teach_smart_chatbot.pkl` model should have these methods:
- `generate_learning_resource(student_age, aet_target, context, ...)`
- `format_resource(resource_data)`
- `get_aet_targets()` (optional)

## 🎯 Benefits

### Why Use Your Trained Model?
- **🎯 Specialized**: Trained specifically for autism education
- **🚀 Fast**: Local processing, no internet required
- **🔒 Private**: Data stays on your device
- **💰 Free**: No API costs
- **🎨 Customized**: Tailored to your teaching style

### Fallback System
- If your model isn't available, app still works
- Seamless switching between AI services
- Always functional, never breaks

## 🆘 Support

### Common Issues
1. **"Server not available"** → Start the Python server
2. **"Port already in use"** → Kill existing process on port 5000
3. **"Model not found"** → Check `teach_smart_chatbot.pkl` location
4. **"Import errors"** → Install missing Python packages

### Getting Help
- Check server logs in terminal
- Test individual components
- Verify model file integrity

---

**🎉 Your trained chatbot is now integrated and ready to generate amazing autism-friendly educational resources!**