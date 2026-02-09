# Python Server Setup Guide

## Overview
The Teach Smart app can use a local Python server with a trained chatbot model for generating educational resources. This is optional - the app will work with mock data or Azure OpenAI if the Python server is not available.

## Quick Start

### 1. Navigate to Python Server Directory
```bash
cd python-server
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the Server
```bash
python chatbot_server.py
```

The server will start on `http://localhost:5001`

## Server Status
When the server is running, you'll see:
- ✅ Trained chatbot server is available
- The app will use the trained model for resource generation

When the server is not running:
- ℹ️ Trained chatbot server not available (this is normal if not running)
- The app will fall back to Azure OpenAI or mock responses

## Server Endpoints

### Health Check
```
GET /health
```
Returns server status and model availability.

### Generate Resource
```
POST /generate-resource
```
Generates educational resources using the trained model.

### Test Connection
```
GET /test-connection
```
Tests the connection to the server.

### Get AET Targets
```
GET /get-aet-targets
```
Returns available Autism Education Trust targets.

## Troubleshooting

### Server Won't Start
1. Check if Python is installed: `python --version`
2. Install dependencies: `pip install -r requirements.txt`
3. Check if port 5001 is available
4. Look for error messages in the terminal

### App Can't Connect
1. Ensure server is running on localhost:5001
2. Check firewall settings
3. Verify the server URL in `trainedChatbotService.js`

### Model Not Loading
1. Ensure `teach_smart_chatbot.pkl` exists in the project root
2. Check server logs for model loading errors
3. Verify the model file is not corrupted

## Development Notes

### Server Configuration
The server URL is configured in `services/trainedChatbotService.js`:
```javascript
this.serverUrl = 'http://localhost:5001';
```

### Error Handling
The app gracefully handles server unavailability:
1. Tries trained chatbot first
2. Falls back to Azure OpenAI if configured
3. Uses mock responses as final fallback

### Logging
- Server availability is checked on startup
- Errors are logged but don't break the app
- Status messages help with debugging

## Production Deployment

For production deployment, you would:
1. Deploy the Python server to a cloud service
2. Update the server URL in the configuration
3. Ensure proper security and authentication
4. Set up monitoring and logging

## Optional: Azure OpenAI Setup

If you want to use Azure OpenAI instead of or in addition to the trained model:
1. Follow the guide in `AZURE_OPENAI_SETUP.md`
2. Configure your API keys
3. The app will automatically use Azure OpenAI if the trained model is unavailable

## Mock Responses

If neither the trained model nor Azure OpenAI is available, the app uses mock responses that demonstrate the expected format and structure of generated resources.