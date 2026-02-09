/**
 * Setup script to securely store Azure OpenAI API key
 * Run this once to store your API key securely
 */

import * as SecureStore from 'expo-secure-store';

export const setupApiKey = async (apiKey) => {
  try {
    if (!apiKey || apiKey === 'your-api-key-here') {
      throw new Error('Please provide a valid API key');
    }
    
    await SecureStore.setItemAsync('azure_openai_api_key', apiKey);
    console.log('✅ API key stored securely');
    return { success: true, message: 'API key stored securely' };
  } catch (error) {
    console.error('❌ Failed to store API key:', error);
    return { success: false, error: error.message };
  }
};

export const getStoredApiKey = async () => {
  try {
    const apiKey = await SecureStore.getItemAsync('azure_openai_api_key');
    return apiKey;
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    return null;
  }
};

export const clearStoredApiKey = async () => {
  try {
    await SecureStore.deleteItemAsync('azure_openai_api_key');
    console.log('✅ API key cleared');
    return { success: true, message: 'API key cleared' };
  } catch (error) {
    console.error('❌ Failed to clear API key:', error);
    return { success: false, error: error.message };
  }
};