/**
 * Configuration helper for Image Generation Service
 * This can be imported and used in your React Native app
 */

import { imageGenerationService } from '../services/imageGenerationService';

// Configuration from your v2_AET setup
const DEFAULT_CONFIG = {
  baseUrl: 'https://preview-chat-7ec86612-af1b-4382-aa85-6a00429c666b.space.z.ai/api/sdk',
  apiKey: 'zk_live_f55857a335d242a27fc16a43c3db505e2c8b40c246b93b5fbef62238443e5eab'
};

/**
 * Configure the image generation service with your credentials
 */
export async function configureImageGeneration() {
  try {
    const success = await imageGenerationService.setConfiguration(
      DEFAULT_CONFIG.baseUrl,
      DEFAULT_CONFIG.apiKey
    );
    
    if (success) {
      console.log('✅ Image generation service configured successfully');
      
      // Test the connection
      const testResult = await imageGenerationService.testConnection();
      if (testResult.success) {
        console.log('✅ Connection test passed - service is ready!');
        return { success: true, message: 'Image generation service is ready' };
      } else {
        console.log('❌ Connection test failed:', testResult.error);
        return { success: false, error: testResult.error };
      }
    } else {
      return { success: false, error: 'Failed to save configuration' };
    }
  } catch (error) {
    console.error('Error configuring image generation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if image generation is properly configured
 */
export async function checkImageGenerationStatus() {
  try {
    const status = await imageGenerationService.getStatus();
    return status;
  } catch (error) {
    console.error('Error checking image generation status:', error);
    return { available: false, error: error.message };
  }
}

export default {
  configureImageGeneration,
  checkImageGenerationStatus
};