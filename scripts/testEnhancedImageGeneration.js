#!/usr/bin/env node

/**
 * Test Enhanced Image Generation Features
 * Comprehensive testing of all enhanced image generation capabilities
 */

// Configuration
const BASE_URL = 'http://localhost:3000' // Adjust if your server runs on different port
const TEST_TIMEOUT = 30000 // 30 seconds per test

class EnhancedImageTester {
  constructor() {
    this.results = []
    this.startTime = Date.now()
    this.fetch = null
  }

  async initialize() {
    // Import fetch dynamically for node-fetch v3
    try {
      const { default: fetch } = await import('node-fetch')
      this.fetch = fetch
      console.log('✅ node-fetch initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize node-fetch:', error.message)
      throw error
    }
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Testing: ${testName}`)
    console.log('─'.repeat(50))
    
    const testStart = Date.now()
    
    try {
      const result = await Promise.race([
        testFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), TEST_TIMEOUT)
        )
      ])
      
      const duration = Date.now() - testStart
      
      if (result.success || result.ok) {
        console.log(`✅ ${testName} - PASSED (${duration}ms)`)
        this.results.push({ name: testName, status: 'PASSED', duration, details: result })
      } else {
        console.log(`❌ ${testName} - FAILED (${duration}ms)`)
        console.log(`   Error: ${result.error || result.message || 'Unknown error'}`)
        this.results.push({ name: testName, status: 'FAILED', duration, error: result.error })
      }
    } catch (error) {
      const duration = Date.now() - testStart
      console.log(`❌ ${testName} - ERROR (${duration}ms)`)
      console.log(`   Error: ${error.message}`)
      this.results.push({ name: testName, status: 'ERROR', duration, error: error.message })
    }
  }

  async testBasicEnhancedImage() {
    const response = await this.fetch(`${BASE_URL}/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'brushing teeth',
        stylePreset: 'autism-friendly',
        qualityLevel: 'child-friendly',
        size: '768x768'
      })
    })

    const result = await response.json()
    
    if (result.success && result.image) {
      console.log(`   ✓ Image generated successfully`)
      console.log(`   ✓ Style preset: ${result.metadata?.stylePreset || 'N/A'}`)
      console.log(`   ✓ Image size: ${result.image.length} characters`)
      return { success: true, details: result }
    } else {
      return { success: false, error: result.error || 'No image generated' }
    }
  }

  async testStyleVariations() {
    const response = await this.fetch(`${BASE_URL}/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'washing hands',
        generateVariations: true
      })
    })

    const result = await response.json()
    
    if (result.success && result.variations) {
      console.log(`   ✓ Generated ${result.variations.length} style variations`)
      console.log(`   ✓ Successful variations: ${result.summary.successful}`)
      return { success: true, details: result }
    } else {
      return { success: false, error: result.error || 'No variations generated' }
    }
  }

  async testEnhancedSteps() {
    const response = await this.fetch(`${BASE_URL}/generate-steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity: 'making a sandwich',
        numSteps: 5,
        generateImages: true,
        stylePreset: 'visual-schedule',
        difficultyLevel: 'simple',
        includeContext: true
      })
    })

    const result = await response.json()
    
    if (result.success && result.steps) {
      console.log(`   ✓ Generated ${result.steps.length} steps`)
      const withImages = result.steps.filter(s => s.imageGenerated).length
      console.log(`   ✓ Steps with images: ${withImages}/${result.steps.length}`)
      console.log(`   ✓ Difficulty level: ${result.metadata.difficultyLevel}`)
      return { success: true, details: result }
    } else {
      return { success: false, error: result.error || 'No steps generated' }
    }
  }

  async testSocialStory() {
    const response = await this.fetch(`${BASE_URL}/generate-social-story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario: 'going to the grocery store',
        contexts: ['home', 'community'],
        includeEmotions: true,
        includeSocialCues: true,
        generateImages: true,
        targetAge: 'elementary'
      })
    })

    const result = await response.json()
    
    if (result.success && result.socialStory) {
      console.log(`   ✓ Social story created: "${result.socialStory.title}"`)
      console.log(`   ✓ Situations: ${result.socialStory.situations?.length || 0}`)
      const withImages = result.socialStory.situations?.filter(s => s.imageGenerated).length || 0
      console.log(`   ✓ Situations with images: ${withImages}`)
      return { success: true, details: result }
    } else {
      return { success: false, error: result.error || 'No social story generated' }
    }
  }

  async testProgressiveSequence() {
    const response = await this.fetch(`${BASE_URL}/generate-progressive-sequence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseActivity: 'tying shoes',
        difficultyLevels: ['simple', 'intermediate', 'complex'],
        generateImages: true,
        includePrerequisites: true,
        targetSkillLevel: 'beginner'
      })
    })

    const result = await response.json()
    
    if (result.success && result.progressiveSequence) {
      console.log(`   ✓ Progressive sequence created`)
      console.log(`   ✓ Levels: ${result.statistics.totalLevels}`)
      console.log(`   ✓ Total steps: ${result.statistics.totalSteps}`)
      console.log(`   ✓ Images generated: ${result.statistics.imagesGenerated}`)
      return { success: true, details: result }
    } else {
      return { success: false, error: result.error || 'No progressive sequence generated' }
    }
  }

  async testServerConnection() {
    try {
      const response = await this.fetch(`${BASE_URL}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test connection' })
      })
      
      // Even if the request fails, if we get a response, the server is running
      return { success: true, status: response.status }
    } catch (error) {
      return { success: false, error: `Server not reachable: ${error.message}` }
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Enhanced Image Generation Tests')
    console.log('=' .repeat(60))
    
    try {
      // Initialize fetch
      await this.initialize()
      
      // Test server connection first
      await this.runTest('Server Connection', () => this.testServerConnection())
      
      // Run all feature tests
      await this.runTest('Basic Enhanced Image', () => this.testBasicEnhancedImage())
      await this.runTest('Style Variations', () => this.testStyleVariations())
      await this.runTest('Enhanced Steps with Images', () => this.testEnhancedSteps())
      await this.runTest('Social Story Generation', () => this.testSocialStory())
      await this.runTest('Progressive Sequence', () => this.testProgressiveSequence())
      
    } catch (error) {
      console.error('💥 Failed to initialize test runner:', error.message)
      this.results.push({ 
        name: 'Initialization', 
        status: 'ERROR', 
        duration: 0, 
        error: error.message 
      })
    }
    
    this.printSummary()
  }

  printSummary() {
    const totalTime = Date.now() - this.startTime
    const passed = this.results.filter(r => r.status === 'PASSED').length
    const failed = this.results.filter(r => r.status === 'FAILED').length
    const errors = this.results.filter(r => r.status === 'ERROR').length
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Tests: ${this.results.length}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`💥 Errors: ${errors}`)
    console.log(`⏱️  Total Time: ${totalTime}ms`)
    console.log(`📈 Success Rate: ${this.results.length > 0 ? ((passed / this.results.length) * 100).toFixed(1) : 0}%`)
    
    if (failed > 0 || errors > 0) {
      console.log('\n🔍 FAILED/ERROR DETAILS:')
      this.results
        .filter(r => r.status !== 'PASSED')
        .forEach(result => {
          console.log(`   ${result.name}: ${result.error}`)
        })
    }
    
    console.log('\n' + '='.repeat(60))
    
    if (passed === this.results.length && this.results.length > 0) {
      console.log('🎉 All tests passed! Enhanced image generation is working correctly.')
    } else {
      console.log('⚠️  Some tests failed. Check the details above.')
      
      // Don't exit with error code if it's just server connection issues
      const serverConnectionFailed = this.results.some(r => r.name === 'Server Connection' && r.status !== 'PASSED')
      if (serverConnectionFailed) {
        console.log('\n💡 TIP: Make sure your development server is running on http://localhost:3000')
        console.log('   You can start it with: npm run web')
      }
      
      process.exit(1)
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new EnhancedImageTester()
  tester.runAllTests().catch(error => {
    console.error('💥 Test runner failed:', error)
    process.exit(1)
  })
}

module.exports = EnhancedImageTester