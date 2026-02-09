/**
 * Test script to verify dataset loading
 */

const { autismDataset } = require('../data/autismDataset.js');

console.log('🧪 Testing dataset load...');
console.log(`📊 Total records in dataset: ${autismDataset.length}`);

// Sample first few records
console.log('\n📋 Sample records:');
autismDataset.slice(0, 3).forEach((record, index) => {
  console.log(`${index + 1}. Age: ${record.ageGroup}, Sex: ${record.sex}, Diagnosis: ${record.diagnosis}, Support: ${record.dsmDiagnosis || 'Not specified'}`);
});

// Count by age groups
const ageGroups = {};
autismDataset.forEach(record => {
  const age = record.ageGroup || 'Unknown';
  ageGroups[age] = (ageGroups[age] || 0) + 1;
});

console.log('\n📈 Age group distribution:');
Object.entries(ageGroups).forEach(([age, count]) => {
  console.log(`  ${age}: ${count} students`);
});

// Count by diagnosis
const diagnoses = {};
autismDataset.forEach(record => {
  const diagnosis = record.diagnosis || 'Unknown';
  diagnoses[diagnosis] = (diagnoses[diagnosis] || 0) + 1;
});

console.log('\n🏥 Diagnosis distribution:');
Object.entries(diagnoses).forEach(([diagnosis, count]) => {
  console.log(`  ${diagnosis}: ${count} students`);
});

console.log('\n✅ Dataset test complete!');