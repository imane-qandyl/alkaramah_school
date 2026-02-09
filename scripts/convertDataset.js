/**
 * Dataset Conversion Script
 * Converts the Excel autism diagnosis dataset to app-ready format
 */

// This script would need to be run with Node.js to convert your Excel file
// You'll need to install: npm install xlsx

const XLSX = require('xlsx');
const fs = require('fs');

async function convertAutismDataset() {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile('../Dataset for Autism Diagnosis.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('📊 Dataset loaded:', jsonData.length, 'records');
    console.log('📋 Sample record:', jsonData[0]);
    
    // Transform to app format
    const profiles = jsonData.map((row, index) => {
      return {
        id: `dataset_${index + 1}`,
        studentName: `Student ${index + 1}`,
        age: row.age || row.Age || 8,
        source: 'dataset',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Map your dataset fields to support levels
        supportLevels: {
          communication: mapScore(row.communication || row.Communication),
          social: mapScore(row.social_interaction || row['Social Interaction']),
          behavioral: mapScore(row.repetitive_behaviors || row['Repetitive Behaviors']),
          sensory: mapScore(row.sensory_sensitivity || row['Sensory Sensitivity']),
          overall: calculateOverallSupport(row)
        },
        
        // Extract learning profile
        learningProfile: {
          attentionSpan: mapAttentionSpan(row.attention_span || row['Attention Span']),
          processingSpeed: mapProcessingSpeed(row),
          learningModalities: inferLearningModalities(row),
          supportNeeds: identifySupportNeeds(row),
          strengths: identifyStrengths(row),
          challenges: identifyChallenges(row)
        },
        
        // Add other profiles...
        communicationProfile: createCommunicationProfile(row),
        socialProfile: createSocialProfile(row),
        sensoryProfile: createSensoryProfile(row),
        educationalRecommendations: generateRecommendations(row)
      };
    });
    
    // Save converted data
    fs.writeFileSync('../services/realDatasetProfiles.json', JSON.stringify(profiles, null, 2));
    console.log('✅ Converted', profiles.length, 'profiles to app format');
    
    return profiles;
    
  } catch (error) {
    console.error('❌ Error converting dataset:', error);
  }
}

// Helper functions to map your dataset values
function mapScore(score) {
  if (score === undefined || score === null) return 'medium';
  if (score <= 2) return 'low';
  if (score <= 4) return 'medium';
  return 'high';
}

function calculateOverallSupport(row) {
  const scores = [
    row.communication,
    row.social_interaction,
    row.repetitive_behaviors,
    row.sensory_sensitivity
  ].filter(s => s !== undefined && s !== null);
  
  if (scores.length === 0) return 'medium';
  
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  if (avg <= 2) return 'low';
  if (avg <= 4) return 'medium';
  return 'high';
}

function mapAttentionSpan(score) {
  if (score === undefined || score === null) return 'moderate';
  if (score <= 2) return 'short';
  if (score <= 4) return 'moderate';
  return 'extended';
}

// Add more mapping functions based on your actual dataset structure...

// Run the conversion
if (require.main === module) {
  convertAutismDataset();
}

module.exports = { convertAutismDataset };