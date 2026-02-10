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
   * Generate enhanced autism-friendly image with advanced features
   */
  async generateEnhancedImage(params) {
    const {
      action,
      stylePreset = 'autism-friendly',
      qualityLevel = 'child-friendly',
      customStyle = '',
      size = '768x768',
      generateVariations = false
    } = params;

    console.log(`🎨 [Enhanced Service] generateEnhancedImage called with:`, params);

    const isAvailable = await this.isAvailable();
    console.log(`🎨 [Enhanced Service] Service available: ${isAvailable}`);

    if (!isAvailable) {
      console.log(`🎨 [Enhanced Service] Service not available`);
      return {
        success: false,
        error: 'Enhanced image generation service not configured',
        suggestion: 'Please configure Z AI SDK base URL and API key'
      };
    }

    if (!action) {
      return {
        success: false,
        error: 'Action description is required for enhanced image generation'
      };
    }

    try {
      if (generateVariations) {
        return await this.generateStyleVariations(action);
      } else {
        const enhancedPrompt = this.buildEnhancedPrompt(action, stylePreset, qualityLevel, customStyle);
        console.log(`🎨 [Enhanced Service] Generated enhanced prompt: ${enhancedPrompt.substring(0, 100)}...`);
        
        const response = await this.callImageGenerationAPI({
          prompt: enhancedPrompt,
          size,
          n: 1
        });

        if (response.success && response.image) {
          return {
            success: true,
            image: response.image,
            metadata: {
              action,
              stylePreset,
              qualityLevel,
              size,
              generatedAt: new Date().toISOString(),
              provider: 'Enhanced Z AI SDK',
              enhanced: true
            }
          };
        } else {
          return {
            success: false,
            error: response.error || 'Failed to generate enhanced image',
            details: response.details
          };
        }
      }
    } catch (error) {
      console.error('🎨 [Enhanced Service] Enhanced image generation error:', error);
      return {
        success: false,
        error: 'Enhanced image generation failed',
        details: error.message
      };
    }
  }

  /**
   * Build enhanced prompt with style presets and quality levels
   */
  buildEnhancedPrompt(action, stylePreset, qualityLevel, customStyle) {
    const stylePresets = {
      'autism-friendly': {
        baseStyle: 'Simple, clear illustration with soft pastel colors',
        colorPalette: 'muted blues, gentle greens, warm yellows, soft pinks',
        composition: 'uncluttered, centered subject, minimal background',
        lighting: 'soft, even lighting without harsh shadows',
        details: 'clear facial expressions, recognizable objects, no text overlays'
      },
      'visual-schedule': {
        baseStyle: 'Educational visual schedule card style',
        colorPalette: 'consistent color scheme, high contrast for clarity',
        composition: 'square format, child-centered, action clearly visible',
        lighting: 'bright, cheerful lighting',
        details: 'step-by-step friendly, sequential action representation'
      },
      'sensory-friendly': {
        baseStyle: 'Calming, sensory-friendly illustration',
        colorPalette: 'earth tones, avoiding overstimulating colors',
        composition: 'balanced, symmetrical when possible',
        lighting: 'gentle, natural lighting',
        details: 'smooth textures, avoiding busy patterns'
      },
      'social-story': {
        baseStyle: 'Social story illustration style',
        colorPalette: 'warm, inviting colors',
        composition: 'clear social context, multiple subjects when needed',
        lighting: 'natural, realistic lighting',
        details: 'clear emotions, social cues, contextual environment'
      }
    };

    const qualityEnhancements = {
      'child-friendly': 'cartoon-like, approachable, non-threatening appearance',
      'high-detail': 'highly detailed, crisp lines, professional illustration quality',
      'realistic': 'photorealistic style while maintaining simplicity',
      'minimalist': 'clean, minimal design with essential elements only',
      'inclusive': 'diverse representation, inclusive of different abilities and backgrounds'
    };

    const preset = stylePresets[stylePreset] || stylePresets['autism-friendly'];
    const quality = qualityEnhancements[qualityLevel] || qualityEnhancements['child-friendly'];

    const corePrompt = `A child performing this action: "${action}"`;
    
    const styleElements = [
      preset.baseStyle,
      `Color palette: ${preset.colorPalette}`,
      `Composition: ${preset.composition}`,
      `Lighting: ${preset.lighting}`,
      `Details: ${preset.details}`,
      `Quality: ${quality}`
    ];

    const enhancedPrompt = [
      corePrompt,
      ...styleElements,
      customStyle,
      'Professional illustration, suitable for educational use with autistic children',
      'No text, labels, or written words in the image'
    ].filter(Boolean).join('. ');

    return enhancedPrompt;
  }

  /**
   * Generate style variations
   */
  async generateStyleVariations(action, styles = ['autism-friendly', 'visual-schedule', 'sensory-friendly']) {
    console.log(`🎨 Generating style variations for: ${action}`);
    
    const variations = [];
    
    for (const style of styles) {
      try {
        const result = await this.generateEnhancedImage({
          action,
          stylePreset: style,
          qualityLevel: 'child-friendly'
        });
        
        variations.push({
          style,
          success: result.success,
          image: result.image,
          metadata: result.metadata,
          error: result.error
        });
      } catch (error) {
        console.error(`Error generating ${style} variation:`, error);
        variations.push({
          style,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = variations.filter(v => v.success).length;
    
    return {
      success: successCount > 0,
      variations,
      summary: {
        total: variations.length,
        successful: successCount,
        failed: variations.length - successCount
      }
    };
  }

  /**
   * Generate step-by-step images for an activity
   */
  async generateActivitySteps(activity, numSteps = 4, options = {}) {
    const {
      stylePreset = 'visual-schedule',
      qualityLevel = 'child-friendly',
      generateImages = true
    } = options;

    console.log(`🎨 Generating activity steps for: ${activity}`);

    // Generate step descriptions (simplified version)
    const stepDescriptions = this.generateStepDescriptions(activity, numSteps);
    
    if (!generateImages) {
      return {
        success: true,
        steps: stepDescriptions.map((desc, index) => ({
          id: index + 1,
          label: `Step ${index + 1}`,
          description: desc,
          order: index + 1
        }))
      };
    }

    // Generate images for each step
    const stepsWithImages = [];
    
    for (let i = 0; i < stepDescriptions.length; i++) {
      const stepDescription = stepDescriptions[i];
      
      try {
        const imageResult = await this.generateEnhancedImage({
          action: stepDescription,
          stylePreset,
          qualityLevel
        });

        stepsWithImages.push({
          id: i + 1,
          label: `Step ${i + 1}`,
          description: stepDescription,
          order: i + 1,
          image: imageResult.success ? imageResult.image : null,
          imageMetadata: imageResult.success ? imageResult.metadata : null,
          imageGenerated: imageResult.success
        });
      } catch (error) {
        console.error(`Error generating image for step ${i + 1}:`, error);
        stepsWithImages.push({
          id: i + 1,
          label: `Step ${i + 1}`,
          description: stepDescription,
          order: i + 1,
          image: null,
          imageGenerated: false
        });
      }
    }

    return {
      success: true,
      steps: stepsWithImages,
      metadata: {
        activity,
        numSteps: stepsWithImages.length,
        stylePreset,
        qualityLevel,
        imagesGenerated: generateImages,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate step descriptions for an activity (simplified)
   */
  generateStepDescriptions(activity, numSteps) {
    const commonActivities = {
      'brushing teeth': [
        'Get toothbrush and toothpaste',
        'Put toothpaste on toothbrush',
        'Brush teeth in circular motions',
        'Rinse mouth with water',
        'Put toothbrush away'
      ],
      'washing hands': [
        'Turn on the water faucet',
        'Put soap on hands',
        'Rub hands together with soap',
        'Rinse hands with water',
        'Dry hands with towel'
      ],
      'making a sandwich': [
        'Get bread and ingredients',
        'Put ingredients on one slice of bread',
        'Put the other slice of bread on top',
        'Cut the sandwich in half',
        'Clean up the workspace'
      ],
      'getting dressed': [
        'Choose clothes for the day',
        'Put on underwear and socks',
        'Put on shirt or top',
        'Put on pants or skirt',
        'Put on shoes'
      ],
      'how to pray': [
        'Find a quiet, clean place to pray',
        'Face the direction of prayer (if applicable)',
        'Begin with opening prayers or intentions',
        'Engage in the main prayer or meditation',
        'Close with gratitude and final prayers'
      ]
    };

    const activityKey = activity.toLowerCase();
    const predefinedSteps = commonActivities[activityKey];
    
    if (predefinedSteps) {
      return predefinedSteps.slice(0, numSteps);
    }

    // Generate generic steps if activity not found
    const genericSteps = [];
    for (let i = 1; i <= numSteps; i++) {
      genericSteps.push(`Step ${i} of ${activity}`);
    }
    
    return genericSteps;
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