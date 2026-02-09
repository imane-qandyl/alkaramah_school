# How to Find Your Azure OpenAI Deployment Name

The **404 Resource not found** error means the deployment name `gpt-4` doesn't exist in your Azure OpenAI resource.

## Steps to Find Your Deployment Name:

### 1. Go to Azure Portal
- Visit [portal.azure.com](https://portal.azure.com)
- Navigate to your Azure OpenAI resource: **alkaramah-openai**

### 2. Check Model Deployments
- In the left sidebar, click **"Model deployments"**
- You'll see a list of your deployed models

### 3. Find the Deployment Name
Look for deployments with these model types:
- **gpt-4** (any version)
- **gpt-4-turbo**
- **gpt-4o**
- **gpt-35-turbo**

### 4. Copy the Deployment Name
- The **"Deployment name"** column shows what you need
- Common examples:
  - `gpt-4`
  - `gpt-4-turbo`
  - `gpt-4o-mini`
  - `gpt-35-turbo`

### 5. Update the Configuration
Once you find your deployment name, update `app.json`:

```json
"deploymentName": "your-actual-deployment-name-here"
```

## If You Don't Have Any Deployments:

### Create a New Deployment:
1. In Azure Portal → Your OpenAI resource → Model deployments
2. Click **"Create new deployment"**
3. Choose a model (recommended: **gpt-4o-mini** for cost efficiency)
4. Give it a deployment name (e.g., `gpt-4o-mini`)
5. Click **"Create"**

## Common Deployment Names to Try:
- `gpt-4o-mini`
- `gpt-4-turbo`
- `gpt-35-turbo`
- `gpt-4`

## Test After Update:
1. Update the deployment name in `app.json`
2. Go to Profile tab in the app
3. Tap "Test Azure OpenAI Connection"
4. Should now work! ✅

---

**Current Error**: `404 Resource not found` means deployment `gpt-4` doesn't exist in your Azure resource.
**Solution**: Find your actual deployment name and update the configuration.