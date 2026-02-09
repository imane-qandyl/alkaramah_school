/**
 * Example: Autism Dataset Integration with TeachSmart
 * Demonstrates how to use the dataset to enhance resource generation
 */

import { datasetIntegrationService } from '../services/datasetIntegrationService';
import { studentProfileService } from '../services/studentProfileService';
import { aiService } from '../services/aiService';

/**
 * Example 1: Processing a CSV dataset
 */
async function processAutismDataset() {
  // Example CSV data (would come from uploaded file)
  const csvData = `
age,communication,social_interaction,sensory_sensitivity,attention_span,routines
8,2,3,4,2,5
10,4,3,2,4,3
7,1,2,5,1,6
12,5,4,1,5,2
  `;

  try {
    // Process the dataset
    const result = await datasetIntegrationService.processDatasetFile(csvData, 'csv');
    
    if (result.success) {
      console.log(`✅ Successfully created ${result.profilesCreated} student profiles`);
      console.log('Dataset Summary:', result.summary);
      
      // The profiles are now available in the app
      const allProfiles = await studentProfileService.getAllProfiles();
      console.log(`📊 Total profiles in system: ${allProfiles.length}`);
      
      return result.profiles;
    } else {
      console.error('❌ Dataset processing failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error processing dataset:', error);
  }
}

/**
 * Example 2: Creating a manual student profile
 */
async function createManualProfile() {
  const studentData = {
    studentName: 'Adaeze', // Using Nigerian name like in your dataset
    age: 9,
    communicationLevel: 'medium',
    socialLevel: 'low',
    sensoryLevel: 'high',
    attentionSpan: 'short',
    overallSupport: 'medium',
    learningModalities: ['visual', 'kinesthetic'],
    strengths: ['routine-following', 'visual-processing'],
    challenges: ['social-interaction', 'auditory-processing'],
    communicationModes: ['visual', 'verbal'],
    groupPreference: 'individual'
  };

  try {
    const result = await studentProfileService.createProfile(studentData, 'manual');
    
    if (result.success) {
      console.log('✅ Manual profile created:', result.profile.studentName);
      
      // Set as active profile
      await studentProfileService.setActiveProfile(result.profile.id);
      console.log('📌 Set as active profile for resource generation');
      
      return result.profile;
    }
  } catch (error) {
    console.error('❌ Error creating manual profile:', error);
  }
}

/**
 * Example 3: Generating personalized resources using profile data
 */
async function generatePersonalizedResource() {
  try {
    // Get the active student profile
    const activeProfile = await studentProfileService.getActiveProfile();
    
    if (!activeProfile) {
      console.log('⚠️ No active profile set. Creating example profile...');
      await createManualProfile();
      activeProfile = await studentProfileService.getActiveProfile();
    }

    // Base resource parameters
    const resourceParams = {
      studentAge: activeProfile.age || 8,
      abilityLevel: 'developing',
      aetTarget: 'Can identify and name basic emotions in self and others',
      learningContext: 'smallgroup',
      format: 'cards',
      visualSupport: true,
      textLevel: 'simple'
    };

    // Enhance with profile data
    const enhancedParams = studentProfileService.generateResourceContext(
      activeProfile, 
      resourceParams
    );

    console.log('🎯 Generating resource with profile enhancements:');
    console.log('- Support Level:', enhancedParams.autismProfile.supportLevel);
    console.log('- Communication Style:', enhancedParams.autismProfile.communicationStyle);
    console.log('- Attention Span:', enhancedParams.autismProfile.attentionSpan);
    console.log('- Adaptations:', enhancedParams.autismProfile.adaptations.length);

    // Generate the resource
    const resource = await aiService.generateResource(enhancedParams);

    if (resource.success) {
      console.log('✅ Personalized resource generated successfully!');
      console.log('📄 Content preview:', resource.content.substring(0, 200) + '...');
      
      return resource;
    } else {
      console.error('❌ Resource generation failed:', resource.error);
    }
  } catch (error) {
    console.error('❌ Error generating personalized resource:', error);
  }
}

/**
 * Example 4: Chatbot interaction with autism context
 */
async function chatbotWithAutismContext() {
  try {
    const activeProfile = await studentProfileService.getActiveProfile();
    
    if (!activeProfile) {
      console.log('⚠️ No active profile for chatbot context');
      return;
    }

    // Teacher question
    const teacherQuestion = "How can I help my student focus better during math lessons?";

    // Create autism-informed chatbot response
    const chatParams = {
      studentAge: activeProfile.age,
      abilityLevel: 'developing',
      aetTarget: `Teacher consultation: ${teacherQuestion}`,
      learningContext: 'consultation',
      format: 'advice',
      visualSupport: false,
      textLevel: 'professional'
    };

    // Add autism profile context
    const enhancedChatParams = studentProfileService.generateResourceContext(
      activeProfile,
      chatParams
    );

    console.log('💬 Generating autism-informed response for:', teacherQuestion);
    console.log('👤 Using profile context for:', activeProfile.studentName || 'Student');

    const response = await aiService.generateResource(enhancedChatParams);

    if (response.success) {
      console.log('✅ Autism-informed advice generated:');
      console.log(response.content);
      
      return response.content;
    }
  } catch (error) {
    console.error('❌ Error generating chatbot response:', error);
  }
}

/**
 * Example 5: Profile-based resource matching
 */
async function matchResourcestoProfile() {
  try {
    // Get existing resources (from storage service)
    const { enhancedStorageService } = await import('../services/databaseService');
    const allResources = await enhancedStorageService.getAllResources();
    
    if (allResources.length === 0) {
      console.log('⚠️ No resources found to match');
      return;
    }

    const activeProfile = await studentProfileService.getActiveProfile();
    
    if (!activeProfile) {
      console.log('⚠️ No active profile for matching');
      return;
    }

    // Use autism support service to match resources
    const { autismSupportService } = await import('../services/autismSupportService');
    const matchedResources = autismSupportService.matchResourcesToProfile(
      allResources, 
      activeProfile
    );

    console.log('🎯 Resource matching results:');
    matchedResources.slice(0, 3).forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title || 'Untitled'}`);
      console.log(`   Match Score: ${resource.matchScore}`);
      console.log(`   Adaptations: ${resource.adaptationSuggestions.length}`);
      console.log('');
    });

    return matchedResources;
  } catch (error) {
    console.error('❌ Error matching resources:', error);
  }
}

/**
 * Example 6: Complete workflow demonstration
 */
async function completeWorkflowDemo() {
  console.log('🚀 Starting complete autism dataset integration demo...\n');

  try {
    // Step 1: Process dataset
    console.log('📊 Step 1: Processing autism dataset...');
    const profiles = await processAutismDataset();
    
    if (profiles && profiles.length > 0) {
      // Step 2: Set active profile
      console.log('\n👤 Step 2: Setting active profile...');
      await studentProfileService.setActiveProfile(profiles[0].id);
      
      // Step 3: Generate personalized resource
      console.log('\n📝 Step 3: Generating personalized resource...');
      await generatePersonalizedResource();
      
      // Step 4: Chatbot consultation
      console.log('\n💬 Step 4: Autism-informed chatbot consultation...');
      await chatbotWithAutismContext();
      
      // Step 5: Resource matching
      console.log('\n🎯 Step 5: Profile-based resource matching...');
      await matchResourcestoProfile();
      
      console.log('\n✅ Complete workflow demonstration finished!');
    }
  } catch (error) {
    console.error('❌ Workflow demo error:', error);
  }
}

/**
 * Example usage patterns for different scenarios
 */
const usageExamples = {
  // New teacher with dataset
  newTeacherWithDataset: async () => {
    const csvData = await loadDatasetFile(); // User uploads file
    const result = await datasetIntegrationService.processDatasetFile(csvData, 'csv');
    
    if (result.success) {
      // Show profile selection UI
      const profiles = result.profiles;
      // Teacher selects profile for current student
      await studentProfileService.setActiveProfile(profiles[0].id);
      // Generate first resource
      return await generatePersonalizedResource();
    }
  },

  // Experienced teacher creating manual profile
  experiencedTeacher: async () => {
    const profile = await createManualProfile();
    await studentProfileService.setActiveProfile(profile.id);
    return await generatePersonalizedResource();
  },

  // Teacher seeking advice
  teacherConsultation: async (question) => {
    // Use active profile context for personalized advice
    return await chatbotWithAutismContext();
  },

  // Resource library management
  resourceManagement: async () => {
    const matchedResources = await matchResourcestoProfile();
    // Show matched resources in UI with adaptation suggestions
    return matchedResources;
  }
};

// Export examples for use in app
export {
  processAutismDataset,
  createManualProfile,
  generatePersonalizedResource,
  chatbotWithAutismContext,
  matchResourcestoProfile,
  completeWorkflowDemo,
  usageExamples
};

// Helper function (would be implemented based on file upload method)
async function loadDatasetFile() {
  // Placeholder for file loading logic
  // In practice, this would use file picker or drag-and-drop
  return `age,communication,social_interaction,sensory_sensitivity
8,2,3,4
10,4,3,2
7,1,2,5`;
}