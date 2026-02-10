/**
 * Image Generation Configuration
 * Configuration for Z AI SDK image generation service
 */

import * as SecureStore from 'expo-secure-store';

// For development, you can set these values here temporarily
// For production, use secure environment variable loading
const getImageGenerationConfig = async () => {
  try {
    // Try to get from secure store first
    const storedBaseUrl = await SecureStore.getItemAsync('zai_base_url');
    const storedApiKey = await SecureStore.getItemAsync('zai_api_key');
    
    if (storedBaseUrl && storedApiKey) {
      return {
        baseUrl: storedBaseUrl,
        apiKey: storedApiKey
      };
    }
    
    // For development only - you can temporarily set your values here
    // NEVER commit the actual keys to version control
    const developmentConfig = {
      baseUrl: 'your-zai-base-url-here', // Replace with your Z AI SDK base URL
      apiKey: 'your-zai-api-key-here'    // Replace with your Z AI SDK API key
    };
    
    if (developmentConfig.baseUrl !== 'your-zai-base-url-here' && 
        developmentConfig.apiKey !== 'your-zai-api-key-here') {
      // Store them securely for future use
      await SecureStore.setItemAsync('zai_base_url', developmentConfig.baseUrl);
      await SecureStore.setItemAsync('zai_api_key', developmentConfig.apiKey);
      return developmentConfig;
    }
    
    return {
      baseUrl: null,
      apiKey: null
    };
  } catch (error) {
    console.warn('Could not retrieve image generation config from secure storage:', error);
    return {
      baseUrl: null,
      apiKey: null
    };
  }
};

export const imageGenerationConfig = {
  getConfig: getImageGenerationConfig,
  
  // Set configuration programmatically
  setConfig: async (baseUrl, apiKey) => {
    try {
      await SecureStore.setItemAsync('zai_base_url', baseUrl);
      await SecureStore.setItemAsync('zai_api_key', apiKey);
      return true;
    } catch (error) {
      console.error('Failed to store image generation config:', error);
      return false;
    }
  },
  
  // Clear stored configuration
  clearConfig: async () => {
    try {
      await SecureStore.deleteItemAsync('zai_base_url');
      await SecureStore.deleteItemAsync('zai_api_key');
      return true;
    } catch (error) {
      console.error('Failed to clear image generation config:', error);
      return false;
    }
  }
};

export default imageGenerationConfig;