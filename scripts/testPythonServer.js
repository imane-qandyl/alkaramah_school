/**
 * Test script for Python server connection
 * Run this to check if the trained chatbot server is working
 */

import { trainedChatbotService } from '../services/trainedChatbotService.js';

async function testPythonServer() {
  console.log('🧪 Testing Python Server Connection...\n');
  
  try {
    // Test basic connection
    console.log('1. Testing server connection...');
    const connectionTest = await trainedChatbotService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Connection successful!');
      console.log(`   Model: ${connectionTest.model}`);
      console.log(`   Provider: ${connectionTest.provider}`);
    } else {
      console.log('❌ Connection failed:');
      console.log(`   Error: ${connectionTest.error}`);
      console.log(`   Suggestion: ${connectionTest.suggestion}`);
      return;
    }
    
    console.log('\n2. Testing resource generation...');
    
    // Test resource generation
    const testParams = {
      studentAge: '8',
      abilityLevel: 'developing',
      aetTarget: 'Social communication and interaction',
      learningContext: 'classroom',
      format: 'worksheet',
      visualSupport: 'medium',
      textLevel: 'simple'
    };
    
    const generationResult = await trainedChatbotService.generateResource(testParams);
    
    if (generationResult.success) {
      console.log('✅ Resource generation successful!');
      console.log(`   Content length: ${generationResult.content?.length || 0} characters`);
      console.log(`   Provider: ${generationResult.metadata?.provider}`);
      
      // Show first 200 characters of content
      if (generationResult.content) {
        console.log('\n📄 Sample content:');
        console.log(generationResult.content.substring(0, 200) + '...');
      }
    } else {
      console.log('❌ Resource generation failed:');
      console.log(`   Error: ${generationResult.error}`);
      console.log(`   Reason: ${generationResult.fallbackReason}`);
    }
    
    console.log('\n3. Testing AET targets...');
    
    // Test AET targets
    const aetTargets = await trainedChatbotService.getAETTargets();
    console.log('✅ AET targets retrieved:');
    console.log(`   Communication targets: ${aetTargets.communication?.length || 0}`);
    console.log(`   Social targets: ${aetTargets.social?.length || 0}`);
    console.log(`   Independence targets: ${aetTargets.independence?.length || 0}`);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n💡 The trained chatbot server is working properly.');
    console.log('   You can now use it in the Teach Smart app.');
    
  } catch (error) {
    console.log('\n💥 Test failed with error:');
    console.log(`   ${error.message}`);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Make sure the Python server is running:');
    console.log('      cd python-server && python chatbot_server.py');
    console.log('   2. Check if the server is accessible at http://localhost:5001');
    console.log('   3. Verify the teach_smart_chatbot.pkl file exists');
    console.log('   4. Check server logs for any error messages');
  }
}

async function checkServerStatus() {
  console.log('📊 Checking server status...\n');
  
  const status = trainedChatbotService.getStatus();
  console.log(`Server URL: ${status.serverUrl}`);
  console.log(`Available: ${status.available ? '✅ Yes' : '❌ No'}`);
  console.log(`Provider: ${status.provider}`);
  
  if (!status.available) {
    console.log('\n💡 To start the server:');
    console.log('   cd python-server');
    console.log('   python chatbot_server.py');
  }
}

// Export functions for use in other scripts
export { testPythonServer, checkServerStatus };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--status')) {
    checkServerStatus();
  } else {
    testPythonServer();
  }
}