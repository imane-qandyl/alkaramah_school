/**
 * Test script for manual resource creation
 */

import { enhancedResourceService } from '../services/enhancedResourceService.js';

async function testResourceCreation() {
  console.log('🧪 Testing manual resource creation...');
  
  try {
    // Test creating a manual resource
    const testResource = {
      title: 'Test Manual Resource',
      content: `# Test Resource

This is a test resource created manually to verify the system works correctly.

## Features:
• Manual creation
• Proper metadata
• Unique ID generation
• Timestamp tracking

## Usage:
This resource demonstrates that teachers can create their own resources directly in the app.`,
      format: 'guide',
      aetTarget: 'Test the manual resource creation system',
      studentAge: '5-12 years',
      topic: 'System Testing'
    };

    const result = await enhancedResourceService.createManualResource(testResource);
    
    if (result.success) {
      console.log('✅ Resource created successfully!');
      console.log('Resource ID:', result.resourceId);
      
      // Test retrieving all resources
      const allResources = await enhancedResourceService.getAllResources();
      console.log(`📚 Total resources in library: ${allResources.length}`);
      
      // Find our test resource
      const createdResource = allResources.find(r => r.id === result.resourceId);
      if (createdResource) {
        console.log('✅ Test resource found in library');
        console.log('Resource details:', {
          title: createdResource.title,
          format: createdResource.format,
          source: createdResource.source,
          createdAt: createdResource.createdAt
        });
      } else {
        console.log('❌ Test resource not found in library');
      }
      
      // Test resource stats
      const stats = await enhancedResourceService.getResourceStats();
      console.log('📊 Resource statistics:', stats);
      
    } else {
      console.log('❌ Failed to create resource:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testResourceCreation();