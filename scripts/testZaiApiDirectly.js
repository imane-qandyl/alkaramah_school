#!/usr/bin/env node

/**
 * Test Z AI API Directly
 * Direct test of the Z AI SDK image generation endpoint
 */

const fetch = require('node-fetch');

const testZaiApi = async () => {
  console.log('🧪 Testing Z AI SDK API directly...\n');

  const config = {
    baseUrl: 'https://preview-chat-7ec86612-af1b-4382-aa85-6a00429c666b.space.z.ai/api/sdk',
    apiKey: 'zk_live_f55857a335d242a27fc16a43c3db505e2c8b40c246b93b5fbef62238443e5eab'
  };

  const payload = {
    prompt: 'Simple autism-friendly illustration of a child performing this action: "brushing teeth". Style: educational visual schedule, clear action, soft colors, plain background, no text or labels anywhere.',
    size: '768x768',
    n: 1
  };

  console.log('📋 Configuration:');
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   API Key: ${config.apiKey.substring(0, 20)}...`);
  console.log('');

  console.log('📤 Request Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');

  try {
    const requestUrl = `${config.baseUrl}/image/generate`;
    console.log(`🌐 Making request to: ${requestUrl}`);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-API-Key': config.apiKey,
      },
      body: JSON.stringify(payload),
    });

    console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Response received successfully!');
    console.log('📊 Response structure:');
    console.log('   Keys:', Object.keys(result || {}));
    
    if (result.data) {
      console.log('   Data keys:', Object.keys(result.data || {}));
      if (Array.isArray(result.data)) {
        console.log('   Data is array with length:', result.data.length);
        if (result.data[0]) {
          console.log('   First item keys:', Object.keys(result.data[0] || {}));
          if (result.data[0].base64) {
            console.log('   ✅ Base64 image found, length:', result.data[0].base64.length);
          } else {
            console.log('   ❌ No base64 field in first item');
          }
        }
      }
    }

    // Try to save a sample of the response (without the full base64)
    const sampleResponse = JSON.parse(JSON.stringify(result));
    if (sampleResponse.data && Array.isArray(sampleResponse.data) && sampleResponse.data[0] && sampleResponse.data[0].base64) {
      sampleResponse.data[0].base64 = sampleResponse.data[0].base64.substring(0, 100) + '...[truncated]';
    }
    
    console.log('📄 Sample Response:');
    console.log(JSON.stringify(sampleResponse, null, 2));

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('❌ Error details:', error);
  }
};

// Check if node-fetch is available
try {
  require('node-fetch');
} catch (error) {
  console.log('⚠️  node-fetch not available, using basic test');
  console.log('💡 The API endpoint should be: https://preview-chat-7ec86612-af1b-4382-aa85-6a00429c666b.space.z.ai/api/sdk/image/generate');
  console.log('💡 With Authorization: Bearer zk_live_f55857a335d242a27fc16a43c3db505e2c8b40c246b93b5fbef62238443e5eab');
  process.exit(0);
}

testZaiApi().catch(console.error);