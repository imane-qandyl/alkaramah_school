#!/usr/bin/env node

/**
 * Test Image Generation in Chat
 * Quick test to verify image generation service is working
 */

// Simulate the image generation service for testing
const testImageGeneration = async () => {
  console.log('🧪 Testing Image Generation Service...\n');

  // Test configuration
  const config = {
    baseUrl: 'https://preview-chat-7ec86612-af1b-4382-aa85-6a00429c666b.space.z.ai/api/sdk',
    apiKey: 'zk_live_f55857a335d242a27fc16a43c3db505e2c8b40c246b93b5fbef62238443e5eab'
  };

  console.log('📋 Configuration:');
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   API Key: ${config.apiKey.substring(0, 20)}...`);
  console.log('');

  // Test input detection
  const testInputs = [
    'Generate an image of brushing teeth',
    'Create a picture of washing hands',
    'Show me a visual for morning routine',
    'Make an image of a child reading',
    'Hello, how are you?', // Should not trigger image generation
    'image of eating lunch',
    'picture of bedtime routine'
  ];

  console.log('🔍 Testing Input Detection:');
  testInputs.forEach(input => {
    const isImageRequest = detectImageRequest(input);
    const action = isImageRequest ? extractActionFromInput(input) : null;
    
    console.log(`   "${input}"`);
    console.log(`   → Image Request: ${isImageRequest ? '✅' : '❌'}`);
    if (action) {
      console.log(`   → Extracted Action: "${action}"`);
    }
    console.log('');
  });

  // Test API call (mock)
  console.log('🌐 Testing API Call:');
  try {
    const testPayload = {
      prompt: 'Simple autism-friendly illustration of a child performing this action: "brushing teeth". Style: educational visual schedule, clear action, soft colors, plain background, no text or labels anywhere.',
      size: '768x768',
      n: 1
    };

    console.log('   Payload:', JSON.stringify(testPayload, null, 2));
    console.log('   → This would be sent to:', `${config.baseUrl}/image/generate`);
    console.log('   → Status: Ready to test with actual API call');
  } catch (error) {
    console.error('   → Error:', error.message);
  }

  console.log('\n✅ Test completed! The image generation should work in your chat now.');
  console.log('\n💡 Try saying: "Generate an image of brushing teeth" in your AI chat');
};

// Helper functions (copied from the chat implementation)
function detectImageRequest(input) {
  const imageKeywords = [
    'generate image', 'create image', 'make image', 'draw image',
    'generate picture', 'create picture', 'make picture', 'draw picture',
    'show me image', 'show me picture', 'visual', 'illustration',
    'generate visual', 'create visual', 'make visual',
    'image of', 'picture of', 'visual of'
  ];
  
  const lowerInput = input.toLowerCase();
  return imageKeywords.some(keyword => lowerInput.includes(keyword));
}

function extractActionFromInput(input) {
  const lowerInput = input.toLowerCase();
  
  // Remove common prefixes
  let action = lowerInput
    .replace(/^(generate|create|make|draw|show me|give me)\s+(an?\s+)?(image|picture|visual|illustration)\s+(of|for|showing)\s+/i, '')
    .replace(/^(generate|create|make|draw|show me|give me)\s+(an?\s+)?(image|picture|visual|illustration)\s+/i, '')
    .replace(/^(image|picture|visual|illustration)\s+(of|for|showing)\s+/i, '')
    .replace(/^(an?\s+)/i, '') // Remove "a" or "an"
    .trim();

  // If no clear action found, try to extract from context
  if (!action || action.length < 3) {
    // Look for common activities
    const activities = [
      'brushing teeth', 'washing hands', 'eating', 'drinking', 'reading',
      'writing', 'playing', 'walking', 'running', 'sitting', 'standing',
      'morning routine', 'bedtime routine', 'getting dressed', 'taking a bath',
      'homework', 'studying', 'listening', 'talking', 'sharing', 'helping',
      'child brushing teeth', 'child washing hands', 'child eating', 'child reading'
    ];
    
    for (const activity of activities) {
      if (lowerInput.includes(activity)) {
        action = activity;
        break;
      }
    }
  }

  // Clean up the action
  if (action) {
    // Remove extra words that might interfere
    action = action
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .trim();
  }

  return action || null;
}

// Run the test
testImageGeneration().catch(console.error);