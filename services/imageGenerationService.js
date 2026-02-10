/**
 * Image Generation Service
 * Integrates Z AI SDK for generating autism-friendly educational images
 */

import * as FileSystem from 'expo-file-system';

class ImageGenerationService {
  constructor() {
    // Configuration will be loaded asynchronously
    this.baseUrl = null;
    this.apiKey = null;
    this.configLoaded = false;
    
    // Load configuration on initialization
    this.loadConfiguration();
  }

  /**
   * Load configuration from .env.local file
   */
  async loadConfiguration() {
    try {
      // For React Native/Expo, we'll use environment variables or fallback values
      // In development, these should be set in your .env.local file
      this.baseUrl = process.env.ZAI_BASE_URL || process.env.SDK_BASE_URL;
      this.apiKey = process.env.ZAI_API_KEY || process.env.SDK_API_KEY;
      
      // If not available from process.env, use the configured values from your setup
      if (!this.baseUrl || !this.apiKey) {
        this.baseUrl = 'https://preview-chat-7ec86612-af1b-4382-aa85-6a00429c666b.space.z.ai/api/sdk';
        this.apiKey = 'zk_live_f55857a335d242a27fc16a43c3db505e2c8b40c246b93b5fbef62238443e5eab';
        console.log('✅ Using hardcoded Z AI SDK configuration');
      }
      
      // Also try to read from a local config file (for development)
      try {
        const configPath = `${FileSystem.documentDirectory}zai_config.json`;
        const configExists = await FileSystem.getInfoAsync(configPath);
        
        if (configExists.exists) {
          const configContent = await FileSystem.readAsStringAsync(configPath);
          const config = JSON.parse(configContent);
          this.baseUrl = this.baseUrl || config.baseUrl;
          this.apiKey = this.apiKey || config.apiKey;
          console.log('✅ Loaded additional config from local file');
        }
      } catch (error) {
        console.log('Could not read local config file:', error.message);
      }
      
      this.configLoaded = true;
      
      if (this.baseUrl && this.apiKey) {
        console.log('✅ Image generation service configured');
        console.log(`   Base URL: ${this.baseUrl}`);
        console.log(`   API Key: ${this.apiKey.substring(0, 20)}...`);
      } else {
        console.log('⚠️ Image generation service not configured');
      }
    } catch (error) {
      console.error('Failed to load image generation configuration:', error);
      this.configLoaded = true;
    }
  }

  /**
   * Set configuration programmatically (for development/testing)
   */
  async setConfiguration(baseUrl, apiKey) {
    try {
      this.baseUrl = baseUrl;
      this.apiKey = apiKey;
      
      // Save to local config file for persistence
      const configPath = `${FileSystem.documentDirectory}zai_config.json`;
      const config = { baseUrl, apiKey };
      await FileSystem.writeAsStringAsync(configPath, JSON.stringify(config));
      
      console.log('✅ Image generation configuration updated');
      return true;
    } catch (error) {
      console.error('Failed to set image generation configuration:', error);
      return false;
    }
  }

  /**
   * Check if image generation service is available
   */
  async isAvailable() {
    if (!this.configLoaded) {
      await this.loadConfiguration();
    }
    const available = !!(this.baseUrl && this.apiKey);
    console.log(`🔍 Image service available: ${available}`);
    console.log(`🔍 Base URL: ${this.baseUrl ? 'configured' : 'missing'}`);
    console.log(`🔍 API Key: ${this.apiKey ? 'configured' : 'missing'}`);
    return available;
  }

  /**
   * Generate autism-friendly educational image
   */
  async generateEducationalImage(params) {
    const { action, styleNote, size = "768x768" } = params;

    console.log(`🎨 [Service] generateEducationalImage called with:`, params);

    const isAvailable = await this.isAvailable();
    console.log(`🎨 [Service] Service available: ${isAvailable}`);

    if (!isAvailable) {
      console.log(`🎨 [Service] Service not available - baseUrl: ${this.baseUrl}, apiKey: ${this.apiKey ? 'set' : 'not set'}`);
      return {
        success: false,
        error: 'Image generation service not configured',
        suggestion: 'Please configure Z AI SDK base URL and API key'
      };
    }

    if (!action) {
      return {
        success: false,
        error: 'Action description is required for image generation'
      };
    }

    const validSizes = ["768x768", "1024x1024"];
    if (!validSizes.includes(size)) {
      return {
        success: false,
        error: `Invalid size. Must be one of: ${validSizes.join(", ")}`
      };
    }

    try {
      const prompt = this.buildAutismFriendlyPrompt(action, styleNote);
      console.log(`🎨 [Service] Generated prompt: ${prompt.substring(0, 100)}...`);
      
      console.log('🎨 [Service] Generating autism-friendly image for action:', action);
      
      const response = await this.callImageGenerationAPI({
        prompt,
        size,
        n: 1
      });

      console.log(`🎨 [Service] API response:`, response);

      if (response.success && response.image) {
        return {
          success: true,
          image: response.image,
          metadata: {
            action,
            size,
            generatedAt: new Date().toISOString(),
            provider: 'Z AI SDK'
          }
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to generate image',
          details: response.details
        };
      }
    } catch (error) {
      console.error('🎨 [Service] Image generation error:', error);
      return {
        success: false,
        error: 'Image generation failed',
        details: error.message
      };
    }
  }

  /**
   * Build autism-friendly prompt for image generation
   */
  buildAutismFriendlyPrompt(action, styleNote = '') {
    const basePrompt = `Simple autism-friendly illustration of a child performing this action: "${action}". 
Style: educational visual schedule, clear action, soft colors, plain background, no text or labels anywhere.`;
    
    const autismFriendlyGuidelines = `
Additional requirements:
- Clear, uncluttered composition
- Soft, calming colors (pastels preferred)
- Simple, recognizable shapes and forms
- Child should be clearly visible and engaged in the action
- Minimal distracting background elements
- Appropriate for educational visual schedules
- Suitable for children with autism spectrum conditions`;

    return `${basePrompt} ${styleNote || ''} ${autismFriendlyGuidelines}`;
  }

  /**
   * Call the Z AI SDK image generation API
   */
  async callImageGenerationAPI(payload) {
    const requestId = Math.random().toString(36).slice(2, 9);
    console.log(`[${requestId}] Image generation request started`);
    console.log(`[${requestId}] Payload:`, JSON.stringify(payload, null, 2));
    console.log(`[${requestId}] Base URL: ${this.baseUrl}`);
    console.log(`[${requestId}] API Key: ${this.apiKey ? this.apiKey.substring(0, 20) + '...' : 'missing'}`);

    try {
      const controller = new AbortController();
      const timeoutMs = 60000; // 60 second timeout for image generation
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const requestUrl = `${this.baseUrl}/image/generate`;
      console.log(`[${requestId}] Making request to: ${requestUrl}`);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[${requestId}] Response status:`, response.status);
      console.log(`[${requestId}] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[${requestId}] API error:`, response.status, errorText);
        throw new Error(`API request failed (${response.status}): ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log(`[${requestId}] Response received, keys:`, Object.keys(result || {}));

      // Handle SDK envelope format
      const data = result.data || result;
      
      if (!data) {
        console.error(`[${requestId}] No data in response:`, result);
        throw new Error('No data in API response');
      }

      // Handle nested data structure
      let imageArray = null;
      if (data.data && Array.isArray(data.data)) {
        imageArray = data.data;
      } else if (Array.isArray(data)) {
        imageArray = data;
      }

      if (!imageArray) {
        console.error(`[${requestId}] Response data is not in expected format:`, data);
        throw new Error('Response data is not in expected format');
      }

      if (!imageArray[0]) {
        console.error(`[${requestId}] No image in response data:`, imageArray);
        throw new Error('No image in response data');
      }

      const imageBase64 = imageArray[0].base64;
      
      if (!imageBase64) {
        console.error(`[${requestId}] No base64 image data in response:`, imageArray[0]);
        throw new Error('No base64 image data in response');
      }

      const dataUrl = `data:image/png;base64,${imageBase64}`;
      console.log(`[${requestId}] Image generated successfully, base64 length:`, imageBase64.length);
      
      return {
        success: true,
        image: dataUrl
      };
    } catch (error) {
      console.error(`[${requestId}] Image generation error:`, error);
      console.error(`[${requestId}] Error stack:`, error.stack);
      return {
        success: false,
        error: 'Failed to generate image',
        details: error.message
      };
    }
  }

  /**
   * Generate multiple images for a sequence of actions
   */
  async generateImageSequence(actions, options = {}) {
    const { size = "768x768", styleNote = '', maxConcurrent = 3 } = options;
    
    if (!Array.isArray(actions) || actions.length === 0) {
      return {
        success: false,
        error: 'Actions array is required and must not be empty'
      };
    }

    console.log(`🎨 Generating image sequence for ${actions.length} actions`);
    
    const results = [];
    const errors = [];

    // Process actions in batches to avoid overwhelming the API
    for (let i = 0; i < actions.length; i += maxConcurrent) {
      const batch = actions.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (action, batchIndex) => {
        const globalIndex = i + batchIndex;
        try {
          const result = await this.generateEducationalImage({
            action,
            styleNote,
            size
          });
          
          return {
            index: globalIndex,
            action,
            ...result
          };
        } catch (error) {
          console.error(`Error generating image for action ${globalIndex + 1}:`, error);
          return {
            index: globalIndex,
            action,
            success: false,
            error: error.message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Track errors
      batchResults.forEach(result => {
        if (!result.success) {
          errors.push({
            index: result.index,
            action: result.action,
            error: result.error
          });
        }
      });

      // Small delay between batches to be respectful to the API
      if (i + maxConcurrent < actions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return {
      success: errors.length === 0,
      results,
      summary: {
        total: actions.length,
        successful: successCount,
        failed: errors.length,
        errors
      }
    };
  }

  /**
   * Test the image generation service connection
   */
  async testConnection() {
    if (!(await this.isAvailable())) {
      return {
        success: false,
        error: 'Image generation service not configured',
        suggestion: 'Configure Z AI SDK base URL and API key'
      };
    }

    try {
      const testResult = await this.generateEducationalImage({
        action: 'waving hello',
        size: '768x768'
      });

      if (testResult.success) {
        return {
          success: true,
          message: 'Image generation service is working correctly',
          testImage: testResult.image
        };
      } else {
        return {
          success: false,
          error: testResult.error,
          details: testResult.details
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Connection test failed',
        details: error.message
      };
    }
  }

  /**
   * Get service configuration status
   */
  async getStatus() {
    if (!this.configLoaded) {
      await this.loadConfiguration();
    }
    
    return {
      available: await this.isAvailable(),
      baseUrl: this.baseUrl ? '***configured***' : 'not configured',
      apiKey: this.apiKey ? '***configured***' : 'not configured',
      provider: 'Z AI SDK'
    };
  }
}

// Export singleton instance
export const imageGenerationService = new ImageGenerationService();
export default imageGenerationService;