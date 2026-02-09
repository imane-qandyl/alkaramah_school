/**
 * Real Dataset Service
 * Loads and processes the actual "Dataset for Autism Diagnosis.csv" file
 */

import { studentProfileService } from './studentProfileService';
import { autismDataset } from '../data/autismDataset';

class RealDatasetService {
  constructor() {
    this.studentNames = [
      // Nigerian names (since most respondents are from Nigeria) - Extended list for 90+ students
      'Adaeze', 'Chidi', 'Kemi', 'Tunde', 'Amara', 'Emeka', 'Folake', 'Ibrahim',
      'Ngozi', 'Olumide', 'Fatima', 'Segun', 'Chioma', 'Babatunde', 'Aisha', 'Kunle',
      'Blessing', 'Chinedu', 'Halima', 'Kayode', 'Adunni', 'Ifeanyi', 'Zainab', 'Damilola',
      'Chiamaka', 'Abdullahi', 'Funmi', 'Chukwuma', 'Hadiza', 'Biodun', 'Amina', 'Oluwaseun',
      'Chidinma', 'Musa', 'Bukola', 'Chineye', 'Suleiman', 'Adebayo', 'Khadija', 'Emeka',
      'Nneka', 'Yusuf', 'Temitope', 'Chukwuemeka', 'Asmau', 'Olumuyiwa', 'Hauwa', 'Chidi',
      'Adanna', 'Usman', 'Folashade', 'Chukwudi', 'Mariam', 'Oluwaseyi', 'Rukayat', 'Emeka',
      'Chinenye', 'Aliyu', 'Adebisi', 'Chukwuebuka', 'Safiya', 'Olumide', 'Khadijat', 'Emeka',
      'Adaora', 'Garba', 'Folake', 'Chukwuma', 'Aisha', 'Oluwasegun', 'Hafsat', 'Emeka',
      'Chinelo', 'Bello', 'Funmilayo', 'Chukwuemeka', 'Zainab', 'Olumuyiwa', 'Hauwa', 'Emeka',
      'Adaugo', 'Sani', 'Folashade', 'Chukwudi', 'Mariam', 'Oluwaseyi', 'Rukayat', 'Emeka',
      'Chioma', 'Umar', 'Adebisi', 'Chukwuebuka', 'Safiya', 'Olumide', 'Khadijat', 'Emeka',
      'Adaeze', 'Yakubu', 'Folake', 'Chukwuma', 'Aisha', 'Oluwasegun', 'Hafsat', 'Emeka',
      'Chinelo', 'Musa', 'Funmilayo', 'Chukwuemeka', 'Zainab', 'Olumuyiwa', 'Hauwa', 'Emeka'
    ];
    this.usedNames = new Set();
  }

  /**
   * Load and process the real autism diagnosis dataset
   */
  async loadRealDataset() {
    try {
      // In a real React Native app, you'd read the CSV file from assets or bundle
      // For now, I'll create the data structure based on your actual dataset
      const csvData = await this.loadCSVData();
      
      console.log('📊 Loading real autism diagnosis dataset...');
      console.log(`Found ${csvData.length} records`);
      
      // Transform each row to a student profile
      const profiles = csvData.map((row, index) => this.transformRowToProfile(row, index));
      
      // Filter out any invalid profiles
      const validProfiles = profiles.filter(profile => profile !== null);
      
      console.log(`✅ Created ${validProfiles.length} valid student profiles`);
      
      return validProfiles;
      
    } catch (error) {
      console.error('❌ Error loading real dataset:', error);
      throw error;
    }
  }

  /**
   * Load CSV data from your actual converted dataset
   */
  async loadCSVData() {
    try {
      console.log('📂 Loading your actual autism diagnosis dataset...');
      
      // Use the converted dataset from your CSV file
      const csvRecords = autismDataset;
      
      if (csvRecords && csvRecords.length > 0) {
        console.log(`✅ Loaded ${csvRecords.length} records from your actual CSV file`);
        return csvRecords;
      } else {
        throw new Error('No records found in your dataset');
      }
    } catch (error) {
      console.error('❌ Error loading your dataset:', error);
      throw error; // Don't fall back to sample data, use your real data
    }
  }

  /**
   * Transform a dataset row into a student profile
   */
  transformRowToProfile(row, index) {
    try {
      const studentName = this.generateStudentName(row.sex);
      const age = this.extractAge(row.ageGroup);
      const supportLevel = this.calculateSupportLevel(row);
      
      return {
        id: `real_dataset_${index + 1}`,
        studentName,
        age,
        source: 'dataset',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Support levels based on actual assessment data
        supportLevels: {
          communication: this.mapCommunicationLevel(row.socialCommunication, row.verbalStatus),
          social: this.mapSocialLevel(row.relationships, row.socialCommunication),
          behavioral: this.mapBehavioralLevel(row.repetitiveBehaviors),
          sensory: this.mapSensoryLevel(row.sensoryReactivity),
          overall: supportLevel
        },
        
        // Learning profile derived from assessment
        learningProfile: {
          attentionSpan: this.inferAttentionSpan(row),
          processingSpeed: this.inferProcessingSpeed(row),
          learningModalities: this.inferLearningModalities(row),
          supportNeeds: this.identifySupportNeeds(row),
          strengths: this.identifyStrengths(row),
          challenges: this.identifyChallenges(row)
        },
        
        // Communication profile from verbal status and social communication
        communicationProfile: {
          verbalSkills: this.mapVerbalSkills(row.verbalStatus),
          nonverbalSkills: this.mapNonverbalSkills(row.nonverbalBehaviors),
          preferredModes: this.inferCommunicationModes(row),
          supportStrategies: this.generateCommunicationStrategies(row)
        },
        
        // Social profile from relationship and interaction data
        socialProfile: {
          peerInteraction: this.mapSocialInteraction(row.relationships),
          groupPreference: this.inferGroupPreference(row),
          socialStrategies: this.generateSocialStrategies(row)
        },
        
        // Sensory profile from reactivity data
        sensoryProfile: {
          overallSensitivity: this.mapSensoryLevel(row.sensoryReactivity),
          auditoryProcessing: this.inferAuditoryProcessing(row),
          visualProcessing: this.inferVisualProcessing(row),
          tactileProcessing: this.inferTactileProcessing(row),
          sensoryStrategies: this.generateSensoryStrategies(row)
        },
        
        // Educational recommendations based on profile
        educationalRecommendations: this.generateEducationalRecommendations(row, supportLevel)
      };
      
    } catch (error) {
      console.warn(`⚠️ Error processing row ${index + 1}:`, error.message);
      return null;
    }
  }

  /**
   * Generate appropriate student name based on gender
   */
  generateStudentName(sex) {
    const isFemale = sex === 'Female';
    const availableNames = this.studentNames.filter(name => !this.usedNames.has(name));
    
    if (availableNames.length === 0) {
      // If we've used all names, start reusing with numbers
      const baseName = isFemale ? 'Amara' : 'Chidi';
      let counter = 1;
      let newName = `${baseName} ${counter}`;
      while (this.usedNames.has(newName)) {
        counter++;
        newName = `${baseName} ${counter}`;
      }
      this.usedNames.add(newName);
      return newName;
    }
    
    // Try to pick gender-appropriate names (rough heuristic)
    const femaleNames = ['Adaeze', 'Kemi', 'Amara', 'Folake', 'Ngozi', 'Fatima', 'Chioma', 'Aisha', 'Blessing', 'Halima', 'Adunni', 'Zainab', 'Chiamaka', 'Funmi', 'Hadiza', 'Amina', 'Chidinma', 'Bukola', 'Chineye', 'Khadija', 'Nneka', 'Temitope', 'Asmau', 'Hauwa'];
    const maleNames = ['Chidi', 'Tunde', 'Emeka', 'Ibrahim', 'Olumide', 'Segun', 'Babatunde', 'Kunle', 'Chinedu', 'Kayode', 'Ifeanyi', 'Damilola', 'Abdullahi', 'Chukwuma', 'Biodun', 'Oluwaseun', 'Musa', 'Suleiman', 'Adebayo', 'Emeka', 'Yusuf', 'Chukwuemeka', 'Olumuyiwa', 'Chidi'];
    
    const genderNames = isFemale ? femaleNames : maleNames;
    const availableGenderNames = genderNames.filter(name => !this.usedNames.has(name));
    
    const selectedName = availableGenderNames.length > 0 
      ? availableGenderNames[Math.floor(Math.random() * availableGenderNames.length)]
      : availableNames[Math.floor(Math.random() * availableNames.length)];
    
    this.usedNames.add(selectedName);
    return selectedName;
  }

  /**
   * Extract numeric age from age group
   */
  extractAge(ageGroup) {
    switch (ageGroup) {
      case '4-6': return 5;
      case '7-9': return 8;
      case '10-12': return 11;
      case '12 and above': return 13;
      default: return 8;
    }
  }

  /**
   * Calculate overall support level from DSM diagnosis or assessment data
   */
  calculateSupportLevel(row) {
    // Use DSM-5 diagnosis if available
    if (row.dsmDiagnosis) {
      if (row.dsmDiagnosis.includes('Level 1') || row.dsmDiagnosis.includes('Mild')) return 'low';
      if (row.dsmDiagnosis.includes('Level 2') || row.dsmDiagnosis.includes('Moderate')) return 'medium';
      if (row.dsmDiagnosis.includes('Level 3') || row.dsmDiagnosis.includes('Severe')) return 'high';
    }
    
    // Calculate from assessment scores
    const severityScores = [
      this.mapToNumeric(row.socialCommunication),
      this.mapToNumeric(row.sensoryReactivity)
    ];
    
    const avgSeverity = severityScores.reduce((sum, score) => sum + score, 0) / severityScores.length;
    
    if (avgSeverity <= 1.5) return 'low';
    if (avgSeverity <= 2.5) return 'medium';
    return 'high';
  }

  /**
   * Map text severity to numeric (1=mild, 2=moderate, 3=severe)
   */
  mapToNumeric(severity) {
    if (!severity) return 2;
    const lower = severity.toLowerCase();
    if (lower.includes('mild') || lower.includes('good') || lower.includes('very good')) return 1;
    if (lower.includes('moderate')) return 2;
    if (lower.includes('severe') || lower.includes('poor')) return 3;
    return 2;
  }

  /**
   * Map communication assessment to support level
   */
  mapCommunicationLevel(socialComm, verbalStatus) {
    if (verbalStatus === 'Non- Verbal' || verbalStatus === 'Just Few Words') return 'high';
    if (socialComm === 'Severe') return 'high';
    if (socialComm === 'Moderate') return 'medium';
    return 'low';
  }

  /**
   * Map social relationships to support level
   */
  mapSocialLevel(relationships, socialComm) {
    if (relationships === 'No') return 'high';
    if (relationships === 'Some times' || socialComm === 'Severe') return 'medium';
    return 'low';
  }

  /**
   * Map repetitive behaviors to support level
   */
  mapBehavioralLevel(repetitive) {
    if (repetitive === 'Yes') return 'medium';
    if (repetitive === 'Sometimes') return 'low';
    return 'low';
  }

  /**
   * Map sensory reactivity to support level
   */
  mapSensoryLevel(sensory) {
    if (sensory === 'Severe') return 'high';
    if (sensory === 'Moderate') return 'medium';
    return 'low';
  }

  /**
   * Map verbal status to skills level
   */
  mapVerbalSkills(verbalStatus) {
    if (verbalStatus === 'Verbal' || verbalStatus === 'lots of words and phrases') return 'high';
    if (verbalStatus === 'Just Few Words') return 'medium';
    return 'low';
  }

  /**
   * Map nonverbal behaviors to skills level
   */
  mapNonverbalSkills(nonverbal) {
    if (nonverbal === 'Very good') return 'high';
    if (nonverbal === 'Good') return 'medium';
    return 'low';
  }

  // Additional mapping methods...
  inferAttentionSpan(row) {
    if (row.socialCommunication === 'Severe') return 'short';
    if (row.socialCommunication === 'Moderate') return 'moderate';
    return 'extended';
  }

  inferProcessingSpeed(row) {
    if (row.nonverbalBehaviors === 'Poor') return 'slow';
    if (row.nonverbalBehaviors === 'Good') return 'moderate';
    return 'fast';
  }

  inferLearningModalities(row) {
    const modalities = ['visual'];
    if (row.verbalStatus === 'Verbal') modalities.push('auditory');
    if (row.repetitiveBehaviors === 'Yes') modalities.push('kinesthetic');
    return modalities;
  }

  identifySupportNeeds(row) {
    const needs = [];
    if (this.mapCommunicationLevel(row.socialCommunication, row.verbalStatus) === 'high') {
      needs.push('communication-support');
    }
    if (this.mapSocialLevel(row.relationships, row.socialCommunication) === 'high') {
      needs.push('social-skills-support');
    }
    if (this.mapSensoryLevel(row.sensoryReactivity) === 'high') {
      needs.push('sensory-regulation');
    }
    return needs;
  }

  identifyStrengths(row) {
    const strengths = [];
    if (row.nonverbalBehaviors === 'Very good' || row.nonverbalBehaviors === 'Good') {
      strengths.push('nonverbal-communication');
    }
    if (row.relationships === 'Yes') {
      strengths.push('relationship-building');
    }
    return strengths;
  }

  identifyChallenges(row) {
    const challenges = [];
    if (row.verbalStatus === 'Non- Verbal') {
      challenges.push('verbal-communication');
    }
    if (row.relationships === 'No') {
      challenges.push('social-interaction');
    }
    if (row.sensoryReactivity === 'Severe') {
      challenges.push('sensory-processing');
    }
    return challenges;
  }

  inferCommunicationModes(row) {
    const modes = ['visual'];
    if (row.verbalStatus === 'Verbal' || row.verbalStatus === 'lots of words and phrases') {
      modes.push('verbal');
    }
    if (row.nonverbalBehaviors === 'Good' || row.nonverbalBehaviors === 'Very good') {
      modes.push('gestural');
    }
    return modes;
  }

  mapSocialInteraction(relationships) {
    if (relationships === 'Yes') return 'high';
    if (relationships === 'Some times') return 'medium';
    return 'low';
  }

  inferGroupPreference(row) {
    if (row.relationships === 'No') return 'individual';
    if (row.relationships === 'Some times') return 'small-group';
    return 'flexible';
  }

  inferAuditoryProcessing(row) {
    return row.sensoryReactivity === 'Severe' ? 'high' : 'medium';
  }

  inferVisualProcessing(row) {
    return row.nonverbalBehaviors === 'Poor' ? 'high' : 'low';
  }

  inferTactileProcessing(row) {
    return row.sensoryReactivity === 'Severe' ? 'high' : 'medium';
  }

  generateCommunicationStrategies(row) {
    const strategies = [];
    if (row.verbalStatus === 'Non- Verbal') {
      strategies.push('Use visual communication system (PECS)');
      strategies.push('Provide picture choice boards');
    }
    if (row.socialCommunication === 'Severe') {
      strategies.push('Use simple, concrete language');
      strategies.push('Allow extra processing time');
    }
    return strategies;
  }

  generateSocialStrategies(row) {
    const strategies = [];
    if (row.relationships === 'No') {
      strategies.push('Start with parallel activities');
      strategies.push('Use social stories for interactions');
    }
    if (row.relationships === 'Some times') {
      strategies.push('Facilitate structured social activities');
      strategies.push('Provide social scripts and cues');
    }
    return strategies;
  }

  generateSensoryStrategies(row) {
    const strategies = [];
    if (row.sensoryReactivity === 'Severe') {
      strategies.push('Provide sensory breaks every 15 minutes');
      strategies.push('Use noise-canceling headphones');
      strategies.push('Minimize environmental stimuli');
    }
    if (row.sensoryReactivity === 'Moderate') {
      strategies.push('Monitor for sensory overload');
      strategies.push('Provide fidget tools as needed');
    }
    return strategies;
  }

  generateEducationalRecommendations(row, supportLevel) {
    const recommendations = {
      instructionalStrategies: [],
      environmentalModifications: [],
      assessmentAdaptations: []
    };

    // Based on support level
    if (supportLevel === 'high') {
      recommendations.instructionalStrategies.push(
        'Use very short activity segments (3-5 minutes)',
        'Provide immediate positive reinforcement',
        'Use visual supports for all instructions',
        'Break down tasks into single steps'
      );
      recommendations.environmentalModifications.push(
        'Provide structured, predictable environment',
        'Minimize distractions and overstimulation',
        'Create quiet retreat space'
      );
      recommendations.assessmentAdaptations.push(
        'Use observation-based assessment',
        'Allow demonstration instead of verbal responses',
        'Assess in very short sessions'
      );
    } else if (supportLevel === 'medium') {
      recommendations.instructionalStrategies.push(
        'Break tasks into 10-15 minute segments',
        'Use visual schedules and supports',
        'Provide clear, step-by-step instructions',
        'Allow processing time'
      );
      recommendations.environmentalModifications.push(
        'Provide consistent routines',
        'Offer quiet workspace options',
        'Use visual organization systems'
      );
      recommendations.assessmentAdaptations.push(
        'Allow extended time for responses',
        'Provide alternative response formats',
        'Use visual demonstrations'
      );
    } else {
      recommendations.instructionalStrategies.push(
        'Provide enrichment opportunities',
        'Use student interests to motivate learning',
        'Encourage independent work',
        'Offer leadership roles'
      );
      recommendations.environmentalModifications.push(
        'Standard classroom with minor accommodations',
        'Provide organizational supports'
      );
      recommendations.assessmentAdaptations.push(
        'Use clear, concrete language',
        'Provide written instructions',
        'Allow alternative demonstration methods'
      );
    }

    return recommendations;
  }

  /**
   * Force reload real dataset (removes all existing profiles)
   */
  async forceReloadRealDataset() {
    try {
      console.log('🔄 Force reloading real autism diagnosis dataset...');
      
      // Clear ALL existing profiles using the service method
      const clearResult = await studentProfileService.clearAllProfiles();
      if (clearResult.success) {
        console.log('✅ Cleared all existing profiles');
      }
      
      // Reset used names
      this.usedNames.clear();
      
      // Load fresh real dataset
      const profiles = await this.loadRealDataset();
      console.log(`Generated ${profiles.length} new profiles from real dataset`);
      
      // Save all new profiles
      for (const profile of profiles) {
        const result = await studentProfileService.saveProfile(profile);
        console.log(`Saved profile: ${profile.studentName} (${profile.age} years, ${profile.supportLevels.overall} support)`);
      }
      
      // Set first profile as active
      if (profiles.length > 0) {
        await studentProfileService.setActiveProfile(profiles[0].id);
        console.log(`Set active profile: ${profiles[0].studentName}`);
      }
      
      return {
        success: true,
        profilesLoaded: profiles.length,
        profileNames: profiles.map(p => p.studentName),
        activeProfile: profiles[0]?.studentName
      };
      
    } catch (error) {
      console.error('❌ Error force reloading real dataset:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Initialize real dataset profiles - FORCE RELOAD
   */
  async initializeRealDataset() {
    try {
      console.log('🔄 Force loading real autism diagnosis dataset...');
      
      // Clear any existing profiles first
      const existingProfiles = await studentProfileService.getAllProfiles();
      if (existingProfiles.length > 0) {
        console.log(`Clearing ${existingProfiles.length} existing profiles...`);
        for (const profile of existingProfiles) {
          await studentProfileService.deleteProfile(profile.id);
        }
      }
      
      // Load real dataset profiles
      const profiles = await this.loadRealDataset();
      
      // Save all profiles
      for (const profile of profiles) {
        await studentProfileService.saveProfile(profile);
      }
      
      // Set first profile as active
      if (profiles.length > 0) {
        await studentProfileService.setActiveProfile(profiles[0].id);
      }
      
      console.log(`✅ Loaded ${profiles.length} real student profiles from autism diagnosis dataset`);
      console.log(`👤 Sample names: ${profiles.slice(0, 3).map(p => p.studentName).join(', ')}`);
      
      return {
        success: true,
        profilesLoaded: profiles.length,
        activeProfile: profiles[0]?.studentName
      };
      
    } catch (error) {
      console.error('❌ Error initializing real dataset:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const realDatasetService = new RealDatasetService();
export default realDatasetService;