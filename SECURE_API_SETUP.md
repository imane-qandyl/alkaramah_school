# Secure API Key Setup

After removing the API key from version control for security, you need to set it up securely for local development.

## Option 1: Temporary Development Setup (Recommended for local development)

1. Open `config/azure.js`
2. Replace `'your-api-key-here'` with your actual Azure OpenAI API key:
   ```javascript
   const developmentKey = 'DjHnz08X38EqO7ujWuKDGNnDwAmYg7d8CAa0okXbc0QHXCb9bzFjJQQJ99CBACfhMk5XJ3w3AAABACOGiJCV';
   ```
3. **IMPORTANT**: Never commit this change to git. Keep it only for local development.

## Option 2: Using Secure Storage (Production-ready)

You can use the setup script to store the API key securely:

```javascript
import { setupApiKey } from './scripts/setupApiKey';

// Call this once to store your API key
await setupApiKey('DjHnz08X38EqO7ujWuKDGNnDwAmYg7d8CAa0okXbc0QHXCb9bzFjJQQJ99CBACfhMk5XJ3w3AAABACOGiJCV');
```

## What Changed

- ✅ Removed API key from `app.json` (was causing GitHub push protection)
- ✅ Removed API key from `.env` file
- ✅ Created secure configuration system using Expo SecureStore
- ✅ Updated AI service to load API key securely
- ✅ Added fallback to mock responses if API key is not available

## Testing the Setup

After setting up your API key, you can test the connection in the app:
1. Go to the Profile tab
2. Scroll down to "AI Services Status"
3. Tap "Test All Connections"
4. Check if Azure OpenAI shows as connected

## For Production Deployment

For production apps, consider:
- Using environment variables in your deployment platform
- Implementing server-side API key management
- Using Azure Key Vault or similar secure storage services
- Implementing API key rotation strategies

## Security Notes

- Never commit API keys to version control
- Use secure storage for sensitive configuration
- Implement proper error handling for missing keys
- Consider using server-side proxies for API calls in production