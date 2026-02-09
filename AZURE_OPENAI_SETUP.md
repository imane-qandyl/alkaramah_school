# Azure OpenAI Setup Instructions

## Quick Setup

1. **Create your `.env` file** in the root directory of your project (same level as `package.json`)

2. **Add your Azure OpenAI API key** to the `.env` file:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://alkaramah-openai.openai.azure.com/
AZURE_OPENAI_API_KEY=your-actual-api-key-here
AZURE_OPENAI_API_VERSION=2025-09-01
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
```

3. **Replace `your-actual-api-key-here`** with your real Azure OpenAI API key

4. **Test the connection** by going to the Profile tab and tapping "Test Azure OpenAI Connection"

## Where to Find Your API Key

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure OpenAI resource: `alkaramah-openai`
3. Go to "Keys and Endpoint" in the left sidebar
4. Copy either "KEY 1" or "KEY 2"
5. Paste it into your `.env` file

## Configuration Details

Your Azure OpenAI resource is already configured with:
- **Endpoint**: `https://alkaramah-openai.openai.azure.com/`
- **Location**: Sweden Central
- **API Version**: `2025-09-01`
- **Deployment Name**: `gpt-4o` (you may need to verify this in Azure Portal)

## Troubleshooting

### If the connection test fails:

1. **Check your API key** - Make sure it's copied correctly without extra spaces
2. **Verify deployment name** - In Azure Portal, go to your OpenAI resource → Model deployments, and check the deployment name
3. **Check API version** - Ensure you're using a supported API version
4. **Restart the app** - After creating/modifying the `.env` file, restart your Expo development server

### Common Issues:

- **"API key not found"** - Make sure your `.env` file is in the root directory
- **"Deployment not found"** - Check the deployment name in Azure Portal
- **"Rate limit exceeded"** - Your Azure OpenAI resource has usage limits, wait a moment and try again

## Security Note

⚠️ **Never commit your `.env` file to version control!** 

The `.env` file is already included in `.gitignore` to prevent accidental commits of your API key.

## Testing

Once configured, you can:
1. Go to the Profile tab
2. Tap "Test Azure OpenAI Connection" 
3. If successful, try creating a resource to test the full AI integration

## Need Help?

If you continue to have issues:
1. Check the Azure Portal for your resource status
2. Verify your API key is active and has the correct permissions
3. Ensure your Azure subscription has available credits