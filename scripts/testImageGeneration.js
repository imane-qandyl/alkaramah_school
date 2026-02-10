/**
 * Test script for Image Generation Service
 * Tests the integration without requiring the full React Native environment
 */

const fs = require('fs').promises;
const path = require('path');

// Load configuration
async function loadConfig() {
  try {
    const configFile = path.join(__dirname, '..', '.env.local');
    const content = await fs.readFile(configFile, 'utf8');
    const lines = content.split('\n');
    
    let baseUrl = null;
    let apiKey = null;
    
    for (const line of lines) {
      if (line.startsWith('ZAI_BASE_URL=')) {
        baseUrl = line.split('=')[1]?.trim();
      }
      if (line.startsWith('ZAI_API_KEY=')) {
        apiKey = line.split('=')[1]?.trim();
      }
    }
    
    return { baseUrl, apiKey };
  } catch (error) {
    console.error('Error loading config:', error.message);
    return { baseUrl: null, apiKey: null };
  }
}

// Test image generation
async function testImageGeneration() {
  console.log('🧪 Testing Image Generation Service');
  console.log('===================================\n');
  
  try {
    const config = await loadConfig();
    
    if (!config.baseUrl || !config.apiKey) {
      console.log('❌ Configuration not found. Please run "npm run setup-images" first.');
      return;
    }
    
    console.log('✅ Configuration loaded');
    console.log(`📍 Base URL: ${config.baseUrl}`);
    console.log(`🔑 API Key: ${config.apiKey.substring(0, 20)}...`);
    
    // Test 1: Simple image generation
    console.log('\n🎨 Test 1: Generating a simple educational image...');
    
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`${config.baseUrl}/image/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-API-Key': config.apiKey,
      },
      body: JSON.stringify({
        prompt: 'Simple autism-friendly illustration of a child brushing teeth. Style: educational visual schedule, clear action, soft colors, plain background, no text or labels anywhere.',
        size: '768x768',
        n: 1
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Image generation successful!');
      console.log('📊 Response structure:', JSON.stringify(result, null, 2));
      
      // Check different possible response formats
      let imageData = null;
      
      if (result.data && result.data.data && result.data.data[0] && result.data.data[0].base64) {
        imageData = result.data.data[0].base64;
      } else if (result.data && result.data[0] && result.data[0].base64) {
        imageData = result.data[0].base64;
      } else if (result.data && result.data.base64) {
        imageData = result.data.base64;
      } else if (result.base64) {
        imageData = result.base64;
      } else if (result.image) {
        imageData = result.image;
      }
      
      if (imageData) {
        const imageSize = imageData.length;
        console.log(`📊 Generated image size: ${Math.round(imageSize / 1024)} KB`);
        console.log('🎉 Test completed successfully!');
        
        const dataUrl = imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`;
        console.log(`💾 Image data URL length: ${dataUrl.length} characters`);
        
        return {
          success: true,
          imageData: dataUrl,
          size: imageSize
        };
      } else {
        console.log('⚠️  Image generated but no base64 data found in expected locations');
        console.log('🔍 Available keys:', Object.keys(result));
        return { success: false, error: 'No image data in response' };
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Image generation failed: ${response.status} - ${errorText}`);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test multiple image generation
async function testBatchGeneration() {
  console.log('\n🎨 Test 2: Batch image generation...');
  
  const actions = [
    'child washing hands',
    'child eating breakfast',
    'child getting dressed'
  ];
  
  try {
    const config = await loadConfig();
    const fetch = (await import('node-fetch')).default;
    
    const results = [];
    
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      console.log(`  Generating image ${i + 1}/${actions.length}: ${action}...`);
      
      const response = await fetch(`${config.baseUrl}/image/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'X-API-Key': config.apiKey,
        },
        body: JSON.stringify({
          prompt: `Simple autism-friendly illustration of a ${action}. Style: educational visual schedule, clear action, soft colors, plain background, no text or labels anywhere.`,
          size: '768x768',
          n: 1
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        results.push({ action, success: true, data: result });
        console.log(`  ✅ Generated image for: ${action}`);
      } else {
        const errorText = await response.text();
        results.push({ action, success: false, error: errorText });
        console.log(`  ❌ Failed to generate image for: ${action}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 Batch generation results: ${successCount}/${actions.length} successful`);
    
    return {
      success: successCount > 0,
      results,
      summary: { total: actions.length, successful: successCount }
    };
    
  } catch (error) {
    console.error('❌ Batch test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Image Generation Tests\n');
  
  // Test 1: Single image generation
  const test1 = await testImageGeneration();
  
  if (test1.success) {
    // Test 2: Batch generation
    const test2 = await testBatchGeneration();
    
    console.log('\n📋 Test Summary:');
    console.log('================');
    console.log(`Single Image Generation: ${test1.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Batch Image Generation: ${test2.success ? '✅ PASS' : '❌ FAIL'}`);
    
    if (test1.success && test2.success) {
      console.log('\n🎉 All tests passed! Image generation service is working correctly.');
      console.log('\n💡 Next steps:');
      console.log('   1. Start your Expo app: npm start');
      console.log('   2. Navigate to the Test tab');
      console.log('   3. Try the "Generate Images" feature');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
    }
  } else {
    console.log('\n❌ Basic image generation test failed. Please check your configuration.');
  }
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testImageGeneration,
  testBatchGeneration,
  runTests
};