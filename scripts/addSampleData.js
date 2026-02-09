/**
 * Simple script to add sample resources to the library
 * This can be run from the React Native app or as a standalone script
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'teach_smart_resources';

const sampleResources = [
  {
    id: Date.now().toString() + '_1',
    title: "Social Stories: Making Friends",
    content: "# Making Friends - A Social Story\n\n## What is a friend?\nA friend is someone who likes to spend time with you, is kind and caring, shares toys and activities, and listens when you talk.\n\n## How to make friends:\n1. Say hello - Look at the person and smile\n2. Ask to join - 'Can I play with you?'\n3. Share - Offer to share your toys or snacks\n4. Be kind - Use nice words and gentle touches\n5. Take turns - Let others have a turn too",
    format: "worksheet",
    aetTarget: "Social communication and interaction",
    studentAge: "7-11",
    abilityLevel: "developing",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: Date.now().toString() + '_2',
    title: "Sensory Break Activity Cards",
    content: "# Sensory Break Activity Cards\n\n## Card 1: Deep Breathing\nWhen feeling overwhelmed, sit comfortably and breathe in for 4 counts, hold for 4, breathe out for 4. Repeat 5 times.\n\n## Card 2: Wall Push-Ups\nStand arm's length from wall, place palms flat, push and release 10 times.\n\n## Card 3: Fidget Time\nUse stress ball, fidget spinner, textured fabric, or thinking putty.",
    format: "cards",
    aetTarget: "Sensory processing and self-regulation",
    studentAge: "5-16",
    abilityLevel: "extending",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: Date.now().toString() + '_3',
    title: "Daily Schedule Visual Checklist",
    content: "# My Daily Schedule Checklist\n\n## Morning Routine ☀️\n□ Wake up and stretch\n□ Brush teeth\n□ Get dressed\n□ Eat breakfast\n□ Pack school bag\n\n## School Day 🏫\n□ Arrive at school\n□ Morning circle time\n□ Lessons\n□ Break time\n□ Lunch time",
    format: "checklist",
    aetTarget: "Executive functioning and daily living skills",
    studentAge: "5-12",
    abilityLevel: "developing",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: Date.now().toString() + '_4',
    title: "Emotions Recognition Slides",
    content: "# Understanding Emotions\n\n## Slide 1: What are Emotions?\nEmotions are feelings we have inside. Everyone has emotions - they are normal and important!\n\n## Slide 2: Happy 😊\nSmiling face, bright eyes, relaxed body. Feels light and warm inside.\n\n## Slide 3: Sad 😢\nFrowning, droopy eyes, slumped shoulders. Feels heavy inside.",
    format: "slides",
    aetTarget: "Emotional literacy and self-awareness",
    studentAge: "4-10",
    abilityLevel: "emerging",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: Date.now().toString() + '_5',
    title: "Communication Choice Board",
    content: "# My Communication Choice Board\n\n## I Want Section 🙋‍♀️\n□ Water □ Food □ Toy □ Book □ Music □ Break\n\n## I Feel Section 😊\n□ Happy □ Sad □ Angry □ Tired □ Excited\n\n## I Need Section 🆘\n□ Bathroom □ Quiet space □ Help □ Hug",
    format: "cards",
    aetTarget: "Communication and language development",
    studentAge: "3-12",
    abilityLevel: "emerging",
    createdAt: new Date().toISOString(), // Today
    lastModified: new Date().toISOString()
  }
];

export async function addSampleResources() {
  try {
    console.log('📚 Adding sample resources to library...');
    
    // Get existing resources
    const existingResourcesJson = await AsyncStorage.getItem(STORAGE_KEY);
    const existingResources = existingResourcesJson ? JSON.parse(existingResourcesJson) : [];
    
    // Check if sample resources already exist
    const hasSampleData = existingResources.some(resource => 
      resource.title === "Social Stories: Making Friends"
    );
    
    if (hasSampleData) {
      console.log('ℹ️  Sample resources already exist, skipping...');
      return { success: true, message: 'Sample resources already exist' };
    }
    
    // Add sample resources
    const updatedResources = [...sampleResources, ...existingResources];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResources));
    
    console.log(`✅ Successfully added ${sampleResources.length} sample resources!`);
    console.log('📊 Resource types added:');
    console.log('   - 2 Activity Cards');
    console.log('   - 1 Worksheet');
    console.log('   - 1 Checklist');
    console.log('   - 1 Slides');
    
    return { 
      success: true, 
      message: `Added ${sampleResources.length} sample resources`,
      count: sampleResources.length 
    };
    
  } catch (error) {
    console.error('❌ Error adding sample resources:', error);
    return { success: false, error: error.message };
  }
}

// Function to clear all resources (for testing)
export async function clearAllResources() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('🗑️  All resources cleared');
    return { success: true, message: 'All resources cleared' };
  } catch (error) {
    console.error('❌ Error clearing resources:', error);
    return { success: false, error: error.message };
  }
}