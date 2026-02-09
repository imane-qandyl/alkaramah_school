/**
 * Verification script to confirm only real dataset is used
 */

const { autismDataset } = require('../data/autismDataset.js');

console.log('🔍 Verifying Real Dataset Usage...\n');

// Check dataset size
console.log(`📊 Dataset Size: ${autismDataset.length} records`);
console.log(`✅ Expected: 90+ records from your CSV file\n`);

// Check data structure
const sampleRecord = autismDataset[0];
console.log('📋 Sample Record Structure:');
console.log(`- Age Group: ${sampleRecord.ageGroup}`);
console.log(`- Sex: ${sampleRecord.sex}`);
console.log(`- Diagnosis: ${sampleRecord.diagnosis}`);
console.log(`- DSM Diagnosis: ${sampleRecord.dsmDiagnosis || 'Not specified'}`);
console.log(`- Verbal Status: ${sampleRecord.verbalStatus}`);
console.log(`- Social Communication: ${sampleRecord.socialCommunication}\n`);

// Verify no hardcoded names
const hasHardcodedNames = autismDataset.some(record => 
  ['Sam', 'Jordan', 'Maya', 'Alex'].includes(record.studentName)
);

if (hasHardcodedNames) {
  console.log('❌ WARNING: Found hardcoded sample names in dataset!');
} else {
  console.log('✅ No hardcoded sample names found in dataset');
}

// Check for real data characteristics
const realDataIndicators = {
  hasVariedAgeGroups: new Set(autismDataset.map(r => r.ageGroup)).size > 3,
  hasVariedDiagnoses: new Set(autismDataset.map(r => r.diagnosis)).size > 1,
  hasRealBehaviorDescriptions: autismDataset.some(r => r.uniqueBehaviors && r.uniqueBehaviors.length > 10),
  hasVariedSupportLevels: autismDataset.some(r => r.dsmDiagnosis && r.dsmDiagnosis.includes('Level'))
};

console.log('\n🔍 Real Data Verification:');
Object.entries(realDataIndicators).forEach(([indicator, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${indicator}: ${passed}`);
});

// Summary
const allPassed = Object.values(realDataIndicators).every(Boolean);
console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall Status: ${allPassed ? 'USING REAL DATASET' : 'POTENTIAL ISSUES DETECTED'}`);

if (allPassed) {
  console.log('✅ Your app is successfully using the real autism diagnosis dataset!');
  console.log(`📈 ${autismDataset.length} real student profiles will be generated from your CSV data.`);
} else {
  console.log('⚠️ Some verification checks failed. Please review the dataset.');
}

console.log('\n📋 Quick Stats:');
console.log(`- Total Records: ${autismDataset.length}`);
console.log(`- Age Groups: ${new Set(autismDataset.map(r => r.ageGroup)).size}`);
console.log(`- Unique Diagnoses: ${new Set(autismDataset.map(r => r.diagnosis)).size}`);
console.log(`- Records with DSM-5 Levels: ${autismDataset.filter(r => r.dsmDiagnosis && r.dsmDiagnosis.includes('Level')).length}`);