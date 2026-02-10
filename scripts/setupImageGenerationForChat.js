#!/usr/bin/env node

/**
 * Setup Image Generation for Chat
 * Ensures the image generation service is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Image Generation for Chat...\n');

// Create a configuration file that the React Native app can read
const configData = {
  baseUrl: 'https://preview-chat-7ec86612-af1b-4382-aa85-6a00429c666b.space.z.ai/api/sdk',
  apiKey: 'zk_live_f55857a335d242a27fc16a43c3db505e2c8b40c246b93b5fbef62238443e5eab',
  configured: true,
  setupDate: new Date().toISOString()
};

// Write to a config file that the service can read
const configPath = path.join(__dirname, '..', 'config', 'imageGeneration.json');
const configDir = path.dirname(configPath);

// Ensure config directory exists
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

console.log('✅ Configuration file created at:', configPath);
console.log('📋 Configuration:');
console.log(`   Base URL: ${configData.baseUrl}`);
console.log(`   API Key: ${configData.apiKey.substring(0, 20)}...`);
console.log('');

// Update the image generation service to read from this file
const serviceUpdateCode = `
// Add this to your imageGenerationService.js loadConfiguration method:

// Try to read from config file
try {
  const configPath = require('path').join(__dirname, '..', 'config', 'imageGeneration.json');
  if (require('fs').existsSync(configPath)) {
    const config = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
    this.baseUrl = this.baseUrl || config.baseUrl;
    this.apiKey = this.apiKey || config.apiKey;
    console.log('✅ Loaded config from imageGeneration.json');
  }
} catch (error) {
  console.log('Could not read imageGeneration.json:', error.message);
}
`;

console.log('💡 Next steps:');
console.log('1. The configuration is now saved');
console.log('2. Restart your React Native app');
console.log('3. Try saying "Generate an image of brushing teeth" in the chat');
console.log('');
console.log('🧪 Test commands to try in your chat:');
console.log('   • "Generate an image of brushing teeth"');
console.log('   • "Create a picture of washing hands"');
console.log('   • "Show me a visual for morning routine"');
console.log('   • "Make an image of a child reading"');
console.log('');
console.log('✅ Setup complete!');