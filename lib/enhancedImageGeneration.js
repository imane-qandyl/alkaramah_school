/**
 * Enhanced Image Generation Library
 * Advanced prompting, style control, and quality improvements for autism-friendly educational images
 */

export class EnhancedImageGenerator {
  constructor(zaiClient) {
    this.zai = zaiClient;
    this.stylePresets = this.initializeStylePresets();
    this.qualityEnhancements = this.initializeQualityEnhancements();
  }

  initializeStylePresets() {
    return {
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
  }

  initializeQualityEnhancements() {
    return {
      'high-detail': 'highly detailed, crisp lines, professional illustration quality',
      'child-friendly': 'cartoon-like, approachable, non-threatening appearance',
      'realistic': 'photorealistic style while maintaining simplicity',
      'minimalist': 'clean, minimal design with essential elements only',
      'inclusive': 'diverse representation, inclusive of different abilities and backgrounds'
    };
  }

  /**
   * Generate enhanced autism-friendly image with advanced prompting
   */
  async generateEnhancedImage(params) {
    const {
      action,
      stylePreset = 'autism-friendly',
      qualityLevel = 'child-friendly',
      customStyle = '',
      size = '768x768',
      negativePrompt = '',
      seed = null,
      steps = 20
    } = params;

    const enhancedPrompt = this.buildEnhancedPrompt({
      action,
      stylePreset,
      qualityLevel,
      customStyle
    });

    const generationParams = {
      prompt: enhancedPrompt,
      size,
      n: 1,
      ...(negativePrompt && { negative_prompt: negativePrompt }),
      ...(seed && { seed }),
      ...(steps && { steps })
    };

    try {
      const response = await this.zai.images.generations.create(generationParams);
      
      return {
        success: true,
        image: response.data[0].base64 ? `data:image/png;base64,${response.data[0].base64}` : response.data[0].url,
        metadata: {
          action,
          stylePreset,
          qualityLevel,
          prompt: enhancedPrompt,
          generatedAt: new Date().toISOString(),
          parameters: generationParams
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: 'Enhanced image generation failed'
      };
    }
  }

  /**
   * Build enhanced prompt with style presets and quality enhancements
   */
  buildEnhancedPrompt({ action, stylePreset, qualityLevel, customStyle }) {
    const preset = this.stylePresets[stylePreset] || this.stylePresets['autism-friendly'];
    const quality = this.qualityEnhancements[qualityLevel] || this.qualityEnhancements['child-friendly'];

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
   * Generate image variations with different styles
   */
  async generateStyleVariations(action, styles = ['autism-friendly', 'visual-schedule', 'sensory-friendly']) {
    const variations = await Promise.all(
      styles.map(async (style) => {
        const result = await this.generateEnhancedImage({
          action,
          stylePreset: style
        });
        return {
          style,
          ...result
        };
      })
    );

    return {
      success: variations.every(v => v.success),
      variations,
      summary: {
        total: variations.length,
        successful: variations.filter(v => v.success).length,
        failed: variations.filter(v => !v.success).length
      }
    };
  }

  /**
   * Generate progressive difficulty images for skill building
   */
  async generateProgressiveSequence(baseAction, difficultyLevels = ['simple', 'intermediate', 'complex']) {
    const progressiveActions = difficultyLevels.map(level => {
      switch (level) {
        case 'simple':
          return `${baseAction} (simple version, basic steps)`;
        case 'intermediate':
          return `${baseAction} (with additional details and context)`;
        case 'complex':
          return `${baseAction} (complete sequence with environmental context)`;
        default:
          return baseAction;
      }
    });

    const sequence = await Promise.all(
      progressiveActions.map(async (action, index) => {
        const result = await this.generateEnhancedImage({
          action,
          stylePreset: 'visual-schedule',
          qualityLevel: 'child-friendly'
        });
        return {
          level: difficultyLevels[index],
          action,
          ...result
        };
      })
    );

    return {
      success: sequence.every(s => s.success),
      sequence,
      baseAction,
      summary: {
        levels: difficultyLevels.length,
        successful: sequence.filter(s => s.success).length
      }
    };
  }

  /**
   * Generate contextual images for social stories
   */
  async generateSocialStoryImages(scenario, contexts = ['home', 'school', 'community']) {
    const contextualImages = await Promise.all(
      contexts.map(async (context) => {
        const contextualAction = `${scenario} in ${context} setting`;
        const result = await this.generateEnhancedImage({
          action: contextualAction,
          stylePreset: 'social-story',
          qualityLevel: 'realistic'
        });
        return {
          context,
          scenario: contextualAction,
          ...result
        };
      })
    );

    return {
      success: contextualImages.every(img => img.success),
      images: contextualImages,
      scenario,
      summary: {
        contexts: contexts.length,
        successful: contextualImages.filter(img => img.success).length
      }
    };
  }

  /**
   * Batch generate images with quality control
   */
  async batchGenerateWithQualityControl(actions, options = {}) {
    const {
      stylePreset = 'autism-friendly',
      qualityLevel = 'child-friendly',
      maxRetries = 2,
      qualityThreshold = 0.8
    } = options;

    const results = [];

    for (const action of actions) {
      let attempts = 0;
      let bestResult = null;

      while (attempts <= maxRetries) {
        const result = await this.generateEnhancedImage({
          action,
          stylePreset,
          qualityLevel,
          seed: attempts > 0 ? Math.floor(Math.random() * 1000000) : null
        });

        if (result.success) {
          // Simple quality check based on response completeness
          const qualityScore = this.assessImageQuality(result);
          
          if (qualityScore >= qualityThreshold || attempts === maxRetries) {
            bestResult = { ...result, qualityScore, attempts: attempts + 1 };
            break;
          }
        }

        attempts++;
      }

      results.push({
        action,
        ...bestResult,
        finalAttempt: attempts + 1
      });
    }

    return {
      success: results.every(r => r.success),
      results,
      summary: {
        total: actions.length,
        successful: results.filter(r => r.success).length,
        averageAttempts: results.reduce((sum, r) => sum + (r.finalAttempt || 1), 0) / results.length
      }
    };
  }

  /**
   * Simple quality assessment for generated images
   */
  assessImageQuality(result) {
    let score = 0.5; // Base score

    // Check if image was generated successfully
    if (result.success && result.image) {
      score += 0.3;
    }

    // Check metadata completeness
    if (result.metadata && result.metadata.prompt) {
      score += 0.1;
    }

    // Check if base64 data seems reasonable (rough size check)
    if (result.image && result.image.includes('base64,') && result.image.length > 1000) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Get available style presets
   */
  getAvailableStyles() {
    return Object.keys(this.stylePresets).map(key => ({
      name: key,
      description: this.stylePresets[key].baseStyle,
      colorPalette: this.stylePresets[key].colorPalette
    }));
  }

  /**
   * Get available quality levels
   */
  getAvailableQualityLevels() {
    return Object.keys(this.qualityEnhancements).map(key => ({
      name: key,
      description: this.qualityEnhancements[key]
    }));
  }
}

export default EnhancedImageGenerator;