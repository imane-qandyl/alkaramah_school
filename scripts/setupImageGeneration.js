/**
 * Setup Script for Image Generation Service
 * Helps configure Z AI SDK credentials
 */

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Configuration file path
const CONFIG_FILE = path.join(__dirname, '..', '.env.local');

async function loadConfig() {
  try {
    const configExists = await fs.access(CONFIG_FILE).then(() => true).catch(() => false);
    if (!configExists) {
      return { baseUrl: null, apiKey: null };
    }
    
    const content = await fs.readFile(CONFIG_FILE, 'utf8');
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

async function saveConfig(baseUrl, apiKey) {
  try {
    let content = '';
    
    // Read existing content if file exists
    try {
      content = await fs.readFile(CONFIG_FILE, 'utf8');
    } catch (error) {
      // File doesn't exist, start with empty content
    }
    
    // Update or add the configuration
    const lines = content.split('\n');
    let baseUrlUpdated = false;
    let apiKeyUpdated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('ZAI_BASE_URL=')) {
        lines[i] = `ZAI_BASE_URL=${baseUrl}`;
        baseUrlUpdated = true;
      }
      if (lines[i].startsWith('ZAI_API_KEY=')) {
        lines[i] = `ZAI_API_KEY=${apiKey}`;
        apiKeyUpdated = true;
      }
    }
    
    // Add new entries if they weren't found
    if (!baseUrlUpdated) {
      lines.push(`ZAI_BASE_URL=${baseUrl}`);
    }
    if (!apiKeyUpdated) {
      lines.push(`ZAI_API_KEY=${apiKey}`);
    }
    
    // Write back to file
    await fs.writeFile(CONFIG_FILE, lines.join('\n'));
    return true;
  } catch (error) {
    console.error('Error saving config:', error.message);
    return false;
  }
}

async function clearConfig() {
  try {
    const configExists = await fs.access(CONFIG_FILE).then(() => true).catch(() => false);
    if (!configExists) {
      return true;
    }
    
    const content = await fs.readFile(CONFIG_FILE, 'utf8');
    const lines = content.split('\n').filter(line => 
      !line.startsWith('ZAI_BASE_URL=') && !line.startsWith('ZAI_API_KEY=')
    );
    
    await fs.writeFile(CONFIG_FILE, lines.join('\n'));
    return true;
  } catch (error) {
    console.error('Error clearing config:', error.message);
    return false;
  }
}

async function testConnection(baseUrl, apiKey) {
  try {
    const fetch = (await import('node-fetch')).default;
    
    // The baseUrl should already include /api/sdk, so we just append the endpoint
    const fullUrl = `${baseUrl}/image/generate`;
    
    console.log(`Testing connection to: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        prompt: 'Simple test image of a child waving hello',
        size: '768x768',
        n: 1
      })
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, message: 'Connection successful', data: result };
    } else {
      const errorText = await response.text();
      console.log(`Error response: ${errorText}`);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.log(`Connection error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function setupImageGeneration() {
  console.log('\n🎨 Image Generation Service Setup');
  console.log('=====================================\n');
  
  console.log('This script will help you configure the Z AI SDK for image generation.');
  console.log('You will need:');
  console.log('1. Z AI SDK Base URL (e.g., https://your-zai-instance.com)');
  console.log('2. Z AI SDK API Key\n');
  
  const proceed = await question('Do you want to continue? (y/n): ');
  
  if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
    console.log('Setup cancelled.');
    rl.close();
    return;
  }
  
  console.log('\n📝 Please enter your Z AI SDK configuration:\n');
  
  const baseUrl = await question('Base URL (e.g., https://your-zai-instance.com): ');
  
  if (!baseUrl || !baseUrl.startsWith('http')) {
    console.log('❌ Invalid base URL. Please provide a valid HTTP/HTTPS URL.');
    rl.close();
    return;
  }
  
  const apiKey = await question('API Key: ');
  
  if (!apiKey || apiKey.length < 10) {
    console.log('❌ Invalid API key. Please provide a valid API key.');
    rl.close();
    return;
  }
  
  console.log('\n💾 Saving configuration...');
  
  try {
    const success = await saveConfig(
      baseUrl.replace(/\/$/, ''), // Remove trailing slash
      apiKey
    );
    
    if (success) {
      console.log('✅ Configuration saved to .env.local');
      console.log('\n🧪 Testing connection...');
      
      const testResult = await testConnection(baseUrl.replace(/\/$/, ''), apiKey);
      
      if (testResult.success) {
        console.log('✅ Connection test successful!');
        console.log('🎉 Image generation service is ready to use.');
      } else {
        console.log('❌ Connection test failed:', testResult.error);
        console.log('💡 Please check your configuration and try again.');
      }
    } else {
      console.log('❌ Failed to save configuration.');
    }
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  }
  
  rl.close();
}

async function clearConfiguration() {
  console.log('\n🗑️  Clear Image Generation Configuration');
  console.log('=========================================\n');
  
  const confirm = await question('Are you sure you want to clear the stored configuration? (y/n): ');
  
  if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
    try {
      const success = await clearConfig();
      if (success) {
        console.log('✅ Configuration cleared successfully.');
      } else {
        console.log('❌ Failed to clear configuration.');
      }
    } catch (error) {
      console.error('❌ Error clearing configuration:', error.message);
    }
  } else {
    console.log('Operation cancelled.');
  }
  
  rl.close();
}

async function showStatus() {
  console.log('\n📊 Image Generation Service Status');
  console.log('===================================\n');
  
  try {
    const config = await loadConfig();
    
    console.log('Configuration Status:');
    console.log(`  Base URL: ${config.baseUrl ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`  API Key: ${config.apiKey ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`  Config File: ${CONFIG_FILE}`);
    
    if (config.baseUrl && config.apiKey) {
      console.log('\n🧪 Testing connection...');
      const testResult = await testConnection(config.baseUrl, config.apiKey);
      
      if (testResult.success) {
        console.log('✅ Connection test successful!');
        console.log('🎉 Image generation service is ready to use.');
      } else {
        console.log('❌ Connection test failed:', testResult.error);
        console.log('💡 Please check your configuration.');
      }
    } else {
      console.log('\n⚠️  Service not configured. Run "npm run setup-images" to configure.');
    }
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
  
  rl.close();
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'clear':
      await clearConfiguration();
      break;
    case 'status':
      await showStatus();
      break;
    case 'setup':
    default:
      await setupImageGeneration();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupImageGeneration,
  clearConfiguration,
  showStatus
};