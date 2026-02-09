/**
 * Dataset Integration Service
 * Handles Excel dataset import and integration with TeachSmart app
 */

import { studentProfileService } from './studentProfileService';
import { dataTransformationService } from './dataTransformationService';

class DatasetIntegrationService {
  constructor() {
    this.supportedFormats = ['xlsx', 'csv', 'json'];
    this.datasetSchema = this.getExpectedSchema();
  }

  /**
   * Expected dataset schema for autism diagnosis data
   */
  getExpectedSchema() {
    return {
      required: ['age'],
      optional: [
        // Demographics
        'gender', 'ethnicity',
        
        // Communication measures
        'communication', 'verbal_communication', 'nonverbal_communication',
        'social_communication', 'language_skills',
        
        // Social interaction measures
        'social_interaction', 'eye_contact', 'social_reciprocity',
        'peer_interaction', 'social_awareness',
        
        // Repetitive behaviors and restricted interests
        'repetitive_behaviors', 'stereotyped_behaviors', 'routines',
        'restricted_interests', 'sensory_seeking', 'sensory_avoiding',
        
        // Sensory processing
        'sensory_sensitivity', 'sound_sensitivity', 'light_sensitivity',
        'touch_sensitivity', 'taste_sensitivity', 'smell_sensitivity',
        
        // Attention and hyperactivity
        'attention_span', 'hyperactivity', 'impulsivity', 'focus_ability',
        
        // Independence and daily living
        'independence', 'self_care', 'daily_living_skills',
        'self_regulation', 'emotional_regulation',
        
        // Learning characteristics
        'learning_style', 'processing_speed', 'memory_skills',
        'problem_solving', 'academic_skills'
      ]
    };
  }

  /**
   * Process uploaded dataset file
   * This would be called when teacher uploads the Excel file
   */
  async processDatasetFile(fileData, fileType = 'xlsx') {
    try {
      let jsonData;
      
      // Convert file to JSON based on type
      switch (fileType.toLowerCase()) {
        case 'xlsx':
          jsonData = await this.convertExcelToJSON(fileData);
          break;
        case 'csv':
          jsonData = await this.convertCSVToJSON(fileData);
          break;
        case 'json':
          jsonData = JSON.parse(fileData);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
      
      // Validate and clean data
      const validatedData = this.validateDataset(jsonData);
      
      // Transform to support profiles
      const profiles = await this.createProfilesFromDataset(validatedData);
      
      return {
        success: true,
        profilesCreated: profiles.length,
        profiles: profiles,
        summary: this.generateDatasetSummary(validatedData)
      };
      
    } catch (error) {
      console.error('Error processing dataset:', error);
      return {
        success: false,
        error: error.message,
        profilesCreated: 0
      };
    }
  }

  /**
   * Convert Excel data to JSON
   * Note: In a real implementation, you'd use a library like xlsx or react-native-xlsx
   */
  async convertExcelToJSON(fileData) {
    // Placeholder for Excel conversion
    // In practice, you would use:
    // import * as XLSX from 'xlsx';
    // const workbook = XLSX.read(fileData, { type: 'binary' });
    // const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    // return XLSX.utils.sheet_to_json(worksheet);
    
    throw new Error('Excel conversion not implemented. Please convert to CSV or JSON first.');
  }

  /**
   * Convert CSV data to JSON
   */
  async convertCSVToJSON(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const jsonData = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          // Try to parse as number, otherwise keep as string
          row[header] = isNaN(value) ? value : parseFloat(value);
        });
        
        jsonData.push(row);
      }
    }
    
    return jsonData;
  }

  /**
   * Validate dataset structure and content
   */
  validateDataset(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Dataset must be a non-empty array');
    }
    
    const validatedData = [];
    const errors = [];
    
    data.forEach((row, index) => {
      try {
        const validatedRow = this.validateRow(row, index);
        if (validatedRow) {
          validatedData.push(validatedRow);
        }
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    });
    
    if (errors.length > 0 && validatedData.length === 0) {
      throw new Error(`Validation failed:\n${errors.join('\n')}`);
    }
    
    if (errors.length > 0) {
      console.warn('Some rows had validation errors:', errors);
    }
    
    return validatedData;
  }

  /**
   * Validate individual row
   */
  validateRow(row, index) {
    // Check for required fields
    if (!row.age && !row.Age) {
      throw new Error('Age is required');
    }
    
    // Normalize and validate age
    const age = row.age || row.Age;
    if (isNaN(age) || age < 0 || age > 25) {
      throw new Error(`Invalid age: ${age}`);
    }
    
    // Normalize field names to lowercase with underscores
    const normalizedRow = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
      normalizedRow[normalizedKey] = row[key];
    });
    
    // Validate score ranges (assuming 0-6 scale for autism measures)
    const scoreFields = [
      'communication', 'social_interaction', 'repetitive_behaviors',
      'sensory_sensitivity', 'attention_span'
    ];
    
    scoreFields.forEach(field => {
      if (normalizedRow[field] !== undefined) {
        const score = parseFloat(normalizedRow[field]);
        if (isNaN(score) || score < 0 || score > 6) {
          console.warn(`Row ${index + 1}: Invalid score for ${field}: ${normalizedRow[field]}`);
          normalizedRow[field] = undefined; // Remove invalid scores
        } else {
          normalizedRow[field] = score;
        }
      }
    });
    
    return normalizedRow;
  }

  /**
   * Create student profiles from validated dataset
   */
  async createProfilesFromDataset(data) {
    const profiles = [];
    
    for (const row of data) {
      try {
        const result = await studentProfileService.createProfile(row, 'dataset');
        if (result.success) {
          profiles.push(result.profile);
        }
      } catch (error) {
        console.error('Error creating profile from row:', error);
      }
    }
    
    return profiles;
  }

  /**
   * Generate summary of dataset
   */
  generateDatasetSummary(data) {
    const summary = {
      totalRecords: data.length,
      ageRange: { min: null, max: null },
      supportLevelDistribution: { low: 0, medium: 0, high: 0 },
      commonCharacteristics: {},
      dataQuality: { complete: 0, partial: 0, minimal: 0 }
    };
    
    // Calculate age range
    const ages = data.map(row => row.age || row.Age).filter(age => !isNaN(age));
    if (ages.length > 0) {
      summary.ageRange.min = Math.min(...ages);
      summary.ageRange.max = Math.max(...ages);
    }
    
    // Analyze support levels (based on communication scores as proxy)
    data.forEach(row => {
      const commScore = row.communication || 3; // Default to medium
      if (commScore <= 2) summary.supportLevelDistribution.low++;
      else if (commScore <= 4) summary.supportLevelDistribution.medium++;
      else summary.supportLevelDistribution.high++;
      
      // Data quality assessment
      const fieldCount = Object.keys(row).filter(key => 
        row[key] !== undefined && row[key] !== null && row[key] !== ''
      ).length;
      
      if (fieldCount >= 10) summary.dataQuality.complete++;
      else if (fieldCount >= 5) summary.dataQuality.partial++;
      else summary.dataQuality.minimal++;
    });
    
    return summary;
  }

  /**
   * Generate insights from dataset for app integration
   */
  generateDatasetInsights(data) {
    const insights = {
      // Support level patterns
      supportPatterns: this.analyzeSupportPatterns(data),
      
      // Learning preference indicators
      learningPreferences: this.analyzeLearningPreferences(data),
      
      // Communication patterns
      communicationPatterns: this.analyzeCommunicationPatterns(data),
      
      // Sensory processing patterns
      sensoryPatterns: this.analyzeSensoryPatterns(data),
      
      // Age-related trends
      ageTrends: this.analyzeAgeTrends(data),
      
      // Recommendations for app usage
      appRecommendations: this.generateAppRecommendations(data)
    };
    
    return insights;
  }

  /**
   * Analyze support level patterns
   */
  analyzeSupportPatterns(data) {
    const patterns = {
      highSupportIndicators: [],
      mediumSupportIndicators: [],
      lowSupportIndicators: []
    };
    
    // Analyze which combinations of scores indicate different support levels
    data.forEach(row => {
      const commScore = row.communication || 3;
      const socialScore = row.social_interaction || 3;
      const sensoryScore = row.sensory_sensitivity || 3;
      
      const avgScore = (commScore + socialScore + sensoryScore) / 3;
      
      if (avgScore <= 2) {
        patterns.highSupportIndicators.push({
          communication: commScore,
          social: socialScore,
          sensory: sensoryScore
        });
      } else if (avgScore >= 4) {
        patterns.lowSupportIndicators.push({
          communication: commScore,
          social: socialScore,
          sensory: sensoryScore
        });
      }
    });
    
    return patterns;
  }

  /**
   * Analyze learning preferences from dataset
   */
  analyzeLearningPreferences(data) {
    const preferences = {
      visualLearners: 0,
      auditoryLearners: 0,
      kinestheticLearners: 0,
      structuredLearners: 0
    };
    
    data.forEach(row => {
      // Infer learning preferences from sensory and behavioral data
      if ((row.sound_sensitivity || 0) > 3) {
        preferences.visualLearners++;
      }
      
      if ((row.light_sensitivity || 0) > 3) {
        preferences.auditoryLearners++;
      }
      
      if ((row.routines || 0) > 4) {
        preferences.structuredLearners++;
      }
    });
    
    return preferences;
  }

  /**
   * Generate app usage recommendations based on dataset
   */
  generateAppRecommendations(data) {
    const recommendations = {
      defaultSettings: {},
      commonAdaptations: [],
      resourceTypes: [],
      teachingStrategies: []
    };
    
    // Analyze most common support needs
    const avgCommunication = this.calculateAverage(data, 'communication');
    const avgSensory = this.calculateAverage(data, 'sensory_sensitivity');
    const avgSocial = this.calculateAverage(data, 'social_interaction');
    
    // Default settings recommendations
    if (avgCommunication < 3) {
      recommendations.defaultSettings.visualSupport = true;
      recommendations.defaultSettings.textLevel = 'simple';
    }
    
    if (avgSensory > 3) {
      recommendations.commonAdaptations.push('Provide sensory breaks');
      recommendations.commonAdaptations.push('Minimize environmental distractions');
    }
    
    if (avgSocial < 3) {
      recommendations.resourceTypes.push('Individual worksheets');
      recommendations.resourceTypes.push('Self-paced activities');
    }
    
    return recommendations;
  }

  /**
   * Helper method to calculate average of a field
   */
  calculateAverage(data, field) {
    const values = data.map(row => row[field]).filter(val => !isNaN(val));
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  // Additional analysis methods
  analyzeCommunicationPatterns(data) {
    return {
      verbalCommunication: this.calculateAverage(data, 'verbal_communication'),
      nonverbalCommunication: this.calculateAverage(data, 'nonverbal_communication'),
      socialCommunication: this.calculateAverage(data, 'social_communication')
    };
  }

  analyzeSensoryPatterns(data) {
    return {
      auditoryProcessing: this.calculateAverage(data, 'sound_sensitivity'),
      visualProcessing: this.calculateAverage(data, 'light_sensitivity'),
      tactileProcessing: this.calculateAverage(data, 'touch_sensitivity')
    };
  }

  analyzeAgeTrends(data) {
    const trends = {};
    
    // Group by age ranges
    const ageGroups = {
      'early-years': data.filter(row => (row.age || 0) <= 6),
      'primary': data.filter(row => (row.age || 0) > 6 && (row.age || 0) <= 11),
      'secondary': data.filter(row => (row.age || 0) > 11)
    };
    
    Object.keys(ageGroups).forEach(group => {
      trends[group] = {
        count: ageGroups[group].length,
        avgCommunication: this.calculateAverage(ageGroups[group], 'communication'),
        avgSocial: this.calculateAverage(ageGroups[group], 'social_interaction'),
        avgSensory: this.calculateAverage(ageGroups[group], 'sensory_sensitivity')
      };
    });
    
    return trends;
  }

  /**
   * Export dataset integration guide
   */
  getIntegrationGuide() {
    return {
      title: 'Autism Dataset Integration Guide',
      steps: [
        {
          step: 1,
          title: 'Prepare Dataset',
          description: 'Convert Excel file to CSV or JSON format',
          requirements: [
            'Include age column (required)',
            'Use consistent column names',
            'Ensure numeric scores are in 0-6 range',
            'Remove any identifying information'
          ]
        },
        {
          step: 2,
          title: 'Upload Dataset',
          description: 'Import dataset through app interface',
          process: [
            'Go to Profile Management',
            'Select "Import Dataset"',
            'Choose file and upload',
            'Review validation results'
          ]
        },
        {
          step: 3,
          title: 'Review Profiles',
          description: 'Check generated student profiles',
          actions: [
            'Review support level assignments',
            'Verify learning preferences',
            'Adjust profiles as needed',
            'Set active profiles for resource generation'
          ]
        },
        {
          step: 4,
          title: 'Generate Resources',
          description: 'Create personalized educational materials',
          benefits: [
            'AI uses profile data for personalization',
            'Resources match support levels',
            'Adaptations are automatically included',
            'Teaching strategies are profile-specific'
          ]
        }
      ],
      expectedColumns: this.datasetSchema.optional,
      supportedFormats: this.supportedFormats
    };
  }
}

// Export singleton instance
export const datasetIntegrationService = new DatasetIntegrationService();
export default datasetIntegrationService;