#!/usr/bin/env node

/**
 * Test Enhanced Image Generation Setup
 * Verifies that all enhanced image generation files are properly configured
 */

const fs = require('fs')
const path = require('path')

class SetupTester {
  constructor() {
    this.results = []
    this.startTime = Date.now()
  }

  testFileExists(filePath, description) {
    const fullPath = path.resolve(filePath)
    const exists = fs.existsSync(fullPath)
    
    this.results.push({
      test: description,
      status: exists ? 'PASS' : 'FAIL',
      details: exists ? `Found: ${fullPath}` : `Missing: ${fullPath}`
    })
    
    return exists
  }

  testFileContent(filePath, searchText, description) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const found = content.includes(searchText)
      
      this.results.push({
        test: description,
        status: found ? 'PASS' : 'FAIL',
        details: found ? `Found "${searchText}" in ${filePath}` : `Missing "${searchText}" in ${filePath}`
      })
      
      return found
    } catch (error) {
      this.results.push({
        test: description,
        status: 'ERROR',
        details: `Error reading ${filePath}: ${error.message}`
      })
      return false
    }
  }

  testJavaScriptSyntax(filePath, description) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Basic syntax checks
      const hasMatchingBraces = (content.match(/\{/g) || []).length === (content.match(/\}/g) || []).length
      const hasMatchingParens = (content.match(/\(/g) || []).length === (content.match(/\)/g) || []).length
      const hasMatchingBrackets = (content.match(/\[/g) || []).length === (content.match(/\]/g) || []).length
      
      const syntaxOk = hasMatchingBraces && hasMatchingParens && hasMatchingBrackets
      
      this.results.push({
        test: description,
        status: syntaxOk ? 'PASS' : 'FAIL',
        details: syntaxOk ? `Syntax looks good in ${filePath}` : `Potential syntax issues in ${filePath}`
      })
      
      return syntaxOk
    } catch (error) {
      this.results.push({
        test: description,
        status: 'ERROR',
        details: `Error checking syntax in ${filePath}: ${error.message}`
      })
      return false
    }
  }

  runAllTests() {
    console.log('🔍 Testing Enhanced Image Generation Setup')
    console.log('=' .repeat(60))
    
    // Test core files exist
    console.log('\n📁 Testing Core Files...')
    this.testFileExists('lib/zai.js', 'ZAI Client Library')
    this.testFileExists('lib/enhancedImageGeneration.js', 'Enhanced Image Generation Library')
    this.testFileExists('services/enhancedImageService.js', 'Enhanced Image Service')
    
    // Test API routes exist
    console.log('\n🛣️  Testing API Routes...')
    this.testFileExists('generate-image/route.ts', 'Enhanced Generate Image Route')
    this.testFileExists('generate-steps/route.ts', 'Enhanced Generate Steps Route')
    this.testFileExists('generate-social-story/route.ts', 'Social Story Route')
    this.testFileExists('generate-progressive-sequence/route.ts', 'Progressive Sequence Route')
    
    // Test documentation
    console.log('\n📚 Testing Documentation...')
    this.testFileExists('docs/enhanced-image-generation.md', 'Enhanced Image Generation Documentation')
    
    // Test file contents
    console.log('\n🔍 Testing File Contents...')
    this.testFileContent('lib/zai.js', 'createZaiClient', 'ZAI Client Export')
    this.testFileContent('lib/enhancedImageGeneration.js', 'EnhancedImageGenerator', 'Enhanced Generator Class')
    this.testFileContent('generate-image/route.ts', 'EnhancedImageGenerator', 'Enhanced Generator Import in Route')
    this.testFileContent('package.json', 'test-enhanced-images', 'NPM Script Added')
    
    // Test JavaScript syntax
    console.log('\n⚙️  Testing JavaScript Syntax...')
    this.testJavaScriptSyntax('lib/zai.js', 'ZAI Client Syntax')
    this.testJavaScriptSyntax('lib/enhancedImageGeneration.js', 'Enhanced Generator Syntax')
    this.testJavaScriptSyntax('services/enhancedImageService.js', 'Enhanced Service Syntax')
    
    // Test configuration
    console.log('\n⚙️  Testing Configuration...')
    this.testFileExists('config/imageGeneration.json', 'Image Generation Config')
    this.testFileContent('config/imageGeneration.json', 'baseUrl', 'Config Base URL')
    this.testFileContent('config/imageGeneration.json', 'apiKey', 'Config API Key')
    
    this.printSummary()
  }

  printSummary() {
    const totalTime = Date.now() - this.startTime
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const errors = this.results.filter(r => r.status === 'ERROR').length
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 SETUP TEST SUMMARY')
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
        .filter(r => r.status !== 'PASS')
        .forEach(result => {
          console.log(`   ${result.test}: ${result.details}`)
        })
    }
    
    console.log('\n' + '='.repeat(60))
    
    if (passed === this.results.length && this.results.length > 0) {
      console.log('🎉 All setup tests passed! Enhanced image generation is properly configured.')
      console.log('\n📋 Next Steps:')
      console.log('   1. Start your development server: npm run web')
      console.log('   2. Test the API endpoints: npm run test-enhanced-images')
      console.log('   3. Check the documentation: docs/enhanced-image-generation.md')
    } else {
      console.log('⚠️  Some setup tests failed. Please fix the issues above.')
      
      if (failed > 0) {
        console.log('\n💡 TIPS:')
        console.log('   - Make sure all files were created correctly')
        console.log('   - Check for any syntax errors in the JavaScript files')
        console.log('   - Verify the configuration files are properly formatted')
      }
    }
    
    console.log('\n🚀 Enhanced Image Generation Features:')
    console.log('   • Advanced style presets (autism-friendly, visual-schedule, etc.)')
    console.log('   • Quality enhancement levels')
    console.log('   • Style variations generation')
    console.log('   • Social story creation with images')
    console.log('   • Progressive learning sequences')
    console.log('   • Batch processing with quality control')
    console.log('   • Comprehensive testing framework')
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new SetupTester()
  tester.runAllTests()
}

module.exports = SetupTester