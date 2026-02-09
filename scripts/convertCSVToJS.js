/**
 * Convert CSV to JavaScript data file
 * This script reads the CSV and creates a JS file with all the data
 */

const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function convertCSVToJS() {
  try {
    console.log('📂 Reading CSV file...');
    const csvPath = path.join(__dirname, '..', 'Dataset for Autism Diagnosis.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log(`📋 Found ${lines.length} lines in CSV`);
    
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or invalid');
    }
    
    // Parse headers
    const headers = parseCSVLine(lines[0]);
    console.log(`📊 Headers: ${headers.length} columns`);
    
    // Parse data rows
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= headers.length - 2) { // Allow some flexibility
        const record = {};
        
        // Map to simplified field names
        record.ageGroup = values[3] || '';
        record.sex = values[4] || '';
        record.diagnosis = values[9] || '';
        record.diagnosisAge = values[10] || '';
        record.verbalStatus = values[12] || '';
        record.socialCommunication = values[14] || '';
        record.nonverbalBehaviors = values[15] || '';
        record.relationships = values[16] || '';
        record.repetitiveBehaviors = values[17] || '';
        record.sensoryReactivity = values[18] || '';
        record.dsmDiagnosis = values[20] || '';
        record.uniqueBehaviors = values[13] || '';
        record.otherChallenges = values[19] || '';
        
        records.push(record);
      }
    }
    
    console.log(`✅ Converted ${records.length} records`);
    
    // Create JavaScript file
    const jsContent = `/**
 * Autism Diagnosis Dataset
 * Converted from CSV file with ${records.length} records
 * Generated on ${new Date().toISOString()}
 */

export const autismDataset = ${JSON.stringify(records, null, 2)};

export default autismDataset;
`;
    
    const outputPath = path.join(__dirname, '..', 'data', 'autismDataset.js');
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, jsContent);
    console.log(`📁 Created data file: ${outputPath}`);
    console.log(`🎉 Successfully converted ${records.length} records from your CSV!`);
    
    return records.length;
    
  } catch (error) {
    console.error('❌ Error converting CSV:', error);
    throw error;
  }
}

// Run the conversion
if (require.main === module) {
  convertCSVToJS();
}

module.exports = { convertCSVToJS };