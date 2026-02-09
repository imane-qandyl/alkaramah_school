/**
 * Azure OpenAI Configuration
 * This file should not contain sensitive information like API keys
 * API keys should be loaded from secure storage or environment variables
 */

import * as SecureStore from 'expo-secure-store';

// For development, you can set the API key here temporarily
// For production, use secure environment variable loading
const getApiKey = async () => {
  try {
    // Try to get from secure store first
    const storedKey = await SecureStore.getItemAsync('azure_openai_api_key');
    if (storedKey) {
      return storedKey;
    }
    
    // For development only - you can temporarily set your key here
    // NEVER commit the actual key to version control
    const developmentKey = 'your-api-key-here'; // Replace with your actual key for local development
    
    if (developmentKey !== 'your-api-key-here') {
      // Store it securely for future use
      await SecureStore.setItemAsync('azure_openai_api_key', developmentKey);
      return developmentKey;
    }
    
    return null;
  } catch (error) {
    console.warn('Could not retrieve API key from secure storage:', error);
    return null;
  }
};

export const azureConfig = {
  endpoint: 'https://alkaramah-openai.openai.azure.com/',
  apiVersion: '2024-02-15-preview',
  deploymentName: 'chatbot',
  getApiKey
};

export default azureConfig;