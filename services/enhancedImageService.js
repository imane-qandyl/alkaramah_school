/**
 * Enhanced Image Service
 * Comprehensive service for advanced image generation with autism-friendly features
 */

import { createZaiClient } from '../lib/zai.js'
import { EnhancedImageGenerator } from '../lib/enhancedImageGeneration.js'

class EnhancedImageService {
  constructor() {
    this.zaiClient = null
    this.enhancedGenerator = null
    this.initialized = false
  }

  /**
   * Initialize the service with ZAI client
   */
  async initialize() {
    if (this.initialized) return

    try {
      this.zaiClient = await createZaiClient()
      this.enhancedGenerator = new EnhancedImageGenerator(this.zaiClient)
      this.initialized = true
      console.log('✅ Enhanced Image Service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Image Service:', error)
      throw error
    }
  }

  /**
   * Ensure service is initialized
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  /**
   * Generate single enhanced image
   */
  async generateImage(params) {
    await this.ensureInitialized()
    return await this.enhancedGenerator.generateEnhancedImage(params)
  }

  /**
   * Generate multiple style variations
   */
  async generateStyleVariations(action, styles) {
    await this.ensureInitialized()
    return await this.enhancedGenerator.generateStyleVariations(action, styles)
  }

  /**
   * Generate progressive difficulty sequence
   */
  async generateProgressiveSequence(baseAction, difficultyLevels) {
    await this.ensureInitialized()
    return await this.enhancedGenerator.generateProgressiveSequence(baseAction, difficultyLevels)
  }

  /**
   * Generate social story images
   */
  async generateSocialStoryImages(scenario, contexts) {
    await this.ensureInitialized()
    return await this.enhancedGenerator.generateSocialStoryImages(scenario, contexts)
  }

  /**
   * Batch generate with quality control
   */
  async batchGenerate(actions, options) {
    await this.ensureInitialized()
    return await this.enhancedGenerator.batchGenerateWithQualityControl(actions, options)
  }

  /**
   * Generate complete visual schedule with images
   */
  async generateVisualSchedule(activities, options = {}) {
    await this.ensureInitialized()

    const {
      stylePreset = 'visual-schedule',
      includeTransitions = true,
      generateVariations = false,
      size = '768x768'
    } = options

    console.log(`🎨 Generating visual schedule for ${activities.length} activities`)

    // Add transition steps if requested
    let allActivities = [...activities]
    if (includeTransitions && activities.length > 1) {
      const transitionActivities = []
      for (let i = 0; i < activities.length - 1; i++) {
        transitionActivities.push(`Finish ${activities[i]} and prepare for ${activities[i + 1]}`)
      }
      
      // Interleave activities with transitions
      allActivities = []
      for (let i = 0; i < activities.length; i++) {
        allActivities.push(activities[i])
        if (i < transitionActivities.length) {
          allActivities.push(transitionActivities[i])
        }
      }
    }

    // Generate images for all activities
    const results = await this.batchGenerate(allActivities, {
      stylePreset,
      qualityLevel: 'child-friendly',
      maxRetries: 1
    })

    // Generate variations if requested
    let variations = null
    if (generateVariations) {
      const variationPromises = activities.slice(0, 3).map(activity => // Limit to first 3 for performance
        this.generateStyleVariations(activity, ['autism-friendly', 'sensory-friendly'])
      )
      
      try {
        const variationResults = await Promise.all(variationPromises)
        variations = variationResults.filter(v => v.success)
      } catch (error) {
        console.warn('Failed to generate variations:', error.message)
      }
    }

    return {
      success: results.success,
      schedule: {
        activities: allActivities,
        images: results.results,
        includeTransitions,
        totalSteps: allActivities.length
      },
      variations,
      metadata: {
        originalActivities: activities,
        stylePreset,
        generatedAt: new Date().toISOString(),
        summary: results.summary
      }
    }
  }

  /**
   * Generate sensory-friendly image set
   */
  async generateSensoryFriendlySet(activities, sensoryConsiderations = {}) {
    await this.ensureInitialized()

    const {
      avoidBrightColors = true,
      minimizeClutter = true,
      softTextures = true,
      calmingElements = true
    } = sensoryConsiderations

    const sensoryPrompt = [
      avoidBrightColors ? 'muted, calming colors' : '',
      minimizeClutter ? 'clean, uncluttered composition' : '',
      softTextures ? 'soft, gentle textures' : '',
      calmingElements ? 'peaceful, calming atmosphere' : ''
    ].filter(Boolean).join(', ')

    const results = await this.batchGenerate(activities, {
      stylePreset: 'sensory-friendly',
      qualityLevel: 'child-friendly',
      customStyle: sensoryPrompt
    })

    return {
      success: results.success,
      sensoryFriendlyImages: results.results,
      sensoryConsiderations,
      metadata: {
        activities,
        sensoryPrompt,
        generatedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Generate emotion regulation visual aids
   */
  async generateEmotionRegulationAids(emotions = ['happy', 'sad', 'angry', 'calm', 'excited', 'worried']) {
    await this.ensureInitialized()

    const emotionActivities = emotions.map(emotion => 
      `A child showing ${emotion} emotion in a clear, recognizable way`
    )

    const results = await this.batchGenerate(emotionActivities, {
      stylePreset: 'autism-friendly',
      qualityLevel: 'child-friendly',
      customStyle: 'clear facial expressions, simple background, educational emotion chart style'
    })

    // Also generate coping strategies for each emotion
    const copingStrategies = {
      'happy': 'sharing happiness with others',
      'sad': 'taking deep breaths and asking for help',
      'angry': 'counting to ten and using calm down strategies',
      'calm': 'maintaining peaceful feelings',
      'excited': 'using appropriate excitement levels',
      'worried': 'talking about worries and finding solutions'
    }

    const copingImages = await this.batchGenerate(
      emotions.map(emotion => `A child ${copingStrategies[emotion] || 'managing emotions'}`),
      {
        stylePreset: 'social-story',
        qualityLevel: 'child-friendly'
      }
    )

    return {
      success: results.success && copingImages.success,
      emotionChart: results.results.map((result, index) => ({
        emotion: emotions[index],
        image: result.image,
        copingStrategy: copingStrategies[emotions[index]],
        copingImage: copingImages.results[index]?.image
      })),
      metadata: {
        emotions,
        generatedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Get available enhancement options
   */
  async getEnhancementOptions() {
    await this.ensureInitialized()
    
    return {
      stylePresets: this.enhancedGenerator.getAvailableStyles(),
      qualityLevels: this.enhancedGenerator.getAvailableQualityLevels(),
      specialFeatures: [
        {
          name: 'visual-schedule',
          description: 'Complete visual schedule generation with transitions'
        },
        {
          name: 'sensory-friendly',
          description: 'Images optimized for sensory sensitivities'
        },
        {
          name: 'emotion-regulation',
          description: 'Emotion recognition and coping strategy visuals'
        },
        {
          name: 'progressive-learning',
          description: 'Skill-building sequences with increasing complexity'
        },
        {
          name: 'social-stories',
          description: 'Context-aware social situation illustrations'
        }
      ]
    }
  }

  /**
   * Test all enhancement features
   */
  async testEnhancements() {
    await this.ensureInitialized()

    const tests = [
      {
        name: 'Basic Enhanced Image',
        test: () => this.generateImage({
          action: 'brushing teeth',
          stylePreset: 'autism-friendly'
        })
      },
      {
        name: 'Style Variations',
        test: () => this.generateStyleVariations('washing hands', ['autism-friendly', 'visual-schedule'])
      },
      {
        name: 'Progressive Sequence',
        test: () => this.generateProgressiveSequence('getting dressed')
      },
      {
        name: 'Visual Schedule',
        test: () => this.generateVisualSchedule(['wake up', 'brush teeth', 'eat breakfast'])
      }
    ]

    const results = []
    for (const test of tests) {
      try {
        console.log(`🧪 Testing ${test.name}...`)
        const result = await test.test()
        results.push({
          name: test.name,
          success: result.success,
          details: result.success ? 'Test passed' : result.error
        })
        console.log(`✅ ${test.name}: ${result.success ? 'PASSED' : 'FAILED'}`)
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          details: error.message
        })
        console.log(`❌ ${test.name}: FAILED - ${error.message}`)
      }
    }

    return {
      success: results.every(r => r.success),
      results,
      summary: {
        total: tests.length,
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    }
  }
}

// Export singleton instance
export const enhancedImageService = new EnhancedImageService()
export default enhancedImageService