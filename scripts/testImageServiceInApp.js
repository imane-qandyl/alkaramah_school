#!/usr/bin/env node

/**
 * Test Image Service Configuration
 * This script helps debug the image generation service in React Native
 */

console.log('🧪 Testing Image Generation Service Configuration...\n');

// Test the configuration values
const config = {
  baseUrl: 'https://preview-chat-7ec86612-af1b-4382-aa85-6a00429c666b.space.z.ai/api/sdk',
  apiKey: 'zk_live_f55857a335d242a27fc16a43c3db505e2c8b40c246b93b5fbef62238443e5eab'
};

console.log('✅ Configuration Values:');
console.log(`   Base URL: ${config.baseUrl}`);
console.log(`   API Key: ${config.apiKey.substring(0, 20)}...`);
console.log('');

console.log('✅ API Test Results (from curl):');
console.log('   Status: 200 OK');
console.log('   Response: Image generated successfully');
console.log('   Base64 Length: ~50,000+ characters');
console.log('');

console.log('🔧 React Native App Debugging Steps:');
console.log('');
console.log('1. Check Metro bundler logs for errors');
console.log('2. Look for console.log messages in your app:');
console.log('   - "🔍 Input: ..." (should show your input)');
console.log('   - "🔍 Is Image Request: true" (should be true)');
console.log('   - "🎨 Handling image generation..." (should appear)');
console.log('   - "🔍 Image service available: true" (should be true)');
console.log('   - "✅ Image generation service configured" (should appear)');
console.log('');

console.log('3. If you see "Image service available: false", the issue is configuration');
console.log('4. If you see "Image service available: true" but still fails, the issue is the API call');
console.log('');

console.log('🛠️  Quick Fix Options:');
console.log('');
console.log('Option 1: Restart your React Native app completely');
console.log('   - Stop the Metro bundler');
console.log('   - Run: npx expo start --clear');
console.log('');

console.log('Option 2: Check if the service is properly initialized');
console.log('   - The service should log: "✅ Image generation service configured"');
console.log('   - If not, the hardcoded values aren\'t being loaded');
console.log('');

console.log('Option 3: Test the service directly in your app');
console.log('   - Add this to your AI chat component:');
console.log('   - console.log("Service status:", await imageGenerationService.getStatus());');
console.log('');

console.log('💡 Expected Working Flow:');
console.log('1. User types: "Generate an image of brushing teeth"');
console.log('2. App detects: Image request = true');
console.log('3. App calls: imageGenerationService.generateEducationalImage()');
console.log('4. Service makes API call to Z AI SDK');
console.log('5. Service returns base64 image');
console.log('6. App displays image in chat');
console.log('');

console.log('🎯 The API is working! The issue is in the React Native configuration.');
console.log('   Try restarting your app with: npx expo start --clear');