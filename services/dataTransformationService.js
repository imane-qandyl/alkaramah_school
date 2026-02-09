/**
 * Data Transformation Service
 * Converts autism diagnosis dataset into educational support profiles
 * Handles Excel to JSON conversion and data normalization
 */

import { autismSupportService } from './autismSupportService';

class DataTransformationService {
  constructor() {
    this.supportLevelMappings = {
      // Map dataset scores to support levels
      communication: { low: [0, 2], medium: [3, 4], high: [5, 6] },
      social: { low: [0, 2], medium: [3, 4], high: [5, 6] },
      repetitive: { low: [0, 1], medium: [2, 3], high: [4, 6] },
      sensory: { low: [0, 1], medium: [2, 3], high: [4, 6] }
    };
  }

  /**
   * Transform Excel dataset to educational support profiles
   * This would be called after converting Excel to JSON
   */
  async transformDatasetToProfiles(datasetArray) {
    const profiles = [];
    
    for (const row of datasetArray) {
      try {
        const profile = await this.transformSingleRecord(row);
        if (profile) {
          profiles.push(profile);
        }
      } catch (error) {
        console.error('Error transforming record:', error);
      }
    }
    
    return profiles;
  }

  /**
   * Transform a single dataset record into support profile
   */
  async transformSingleRecord(dataRow) {
    // Normalize field names (handle different possible column names)
    const normalizedData = this.normalizeFieldNames(dataRow);
    
    // Create base support profile
    const supportProfile = {
      id: this.generateProfileId(normalizedData),
      source: 'dataset',
      createdAt: new Date().toISOString(),
      
      // Basic demographics
      demographics: this.extractDemographics(normalizedData),
      
      // Support level assessment
      supportLevels: this.calculateSupportLevels(normalizedData),
      
      // Learning preferences
      learningProfile: this.extractLearningProfile(normalizedData),
      
      // Communication profile
      communicationProfile: this.extractCommunicationProfile(normalizedData),
      
      // Social interaction profile
      socialProfile: this.extractSocialProfile(normalizedData),
      
      // Sensory processing profile
      sensoryProfile: this.extractSensoryProfile(normalizedData),
      
      // Behavioral patterns
      behaviorProfile: this.extractBehaviorProfile(normalizedData),
      
      // Educational recommendations
      educationalRecommendations: this.generateEducationalRecommendations(normalizedData),
      
      // AI prompt enhancements
      aiPromptContext: this.generateAIPromptContext(normalizedData)
    };

    return supportProfile;
  }

  /**
   * Normalize field names from different possible dataset formats
   */
  normalizeFieldNames(dataRow) {
    const normalized = {};
    
    // Common field mappings for autism datasets
    const fieldMappings = {
      // Demographics
      age: ['age', 'Age', 'student_age', 'child_age'],
      gender: ['gender', 'Gender', 'sex', 'Sex'],
      
      // Communication scores
      communication: ['communication', 'Communication', 'comm_score', 'verbal_skills'],
      verbal_communication: ['verbal', 'Verbal', 'verbal_comm', 'speech'],
      nonverbal_communication: ['nonverbal', 'NonVerbal', 'gestures', 'body_language'],
      
      // Social interaction scores
      social_interaction: ['social', 'Social', 'social_score', 'peer_interaction'],
      eye_contact: ['eye_contact', 'EyeContact', 'gaze', 'visual_attention'],
      social_reciprocity: ['reciprocity', 'Reciprocity', 'turn_taking', 'social_response'],
      
      // Repetitive behaviors
      repetitive_behaviors: ['repetitive', 'Repetitive', 'stereotyped', 'restricted'],
      routines: ['routines', 'Routines', 'sameness', 'consistency'],
      interests: ['interests', 'Interests', 'fixations', 'preoccupations'],
      
      // Sensory processing
      sensory_sensitivity: ['sensory', 'Sensory', 'sensitivity', 'processing'],
      sound_sensitivity: ['sound', 'Sound', 'auditory', 'noise'],
      light_sensitivity: ['light', 'Light', 'visual_sens', 'brightness'],
      touch_sensitivity: ['touch', 'Touch', 'tactile', 'texture'],
      
      // Attention and focus
      attention_span: ['attention', 'Attention', 'focus', 'concentration'],
      hyperactivity: ['hyperactivity', 'Hyperactivity', 'restless', 'fidgety'],
      
      // Independence and daily living
      independence: ['independence', 'Independence', 'self_care', 'daily_living'],
      self_regulation: ['regulation', 'Regulation', 'emotional_control', 'coping']
    };

    // Apply mappings
    for (const [normalizedKey, possibleKeys] of Object.entries(fieldMappings)) {
      for (const key of possibleKeys) {
        if (dataRow[key] !== undefined) {
          normalized[normalizedKey] = dataRow[key];
          break;
        }
      }
    }

    return normalized;
  }

  /**
   * Extract demographic information
   */
  extractDemographics(data) {
    return {
      age: this.parseAge(data.age),
      ageGroup: this.categorizeAge(data.age),
      gender: data.gender || 'not-specified'
    };
  }

  /**
   * Calculate support levels across different domains
   */
  calculateSupportLevels(data) {
    return {
      communication: this.calculateDomainSupport('communication', data.communication),
      social: this.calculateDomainSupport('social', data.social_interaction),
      behavioral: this.calculateDomainSupport('repetitive', data.repetitive_behaviors),
      sensory: this.calculateDomainSupport('sensory', data.sensory_sensitivity),
      overall: this.calculateOverallSupport(data)
    };
  }

  /**
   * Extract learning profile from dataset
   */
  extractLearningProfile(data) {
    return {
      attentionSpan: this.categorizeAttentionSpan(data.attention_span),
      processingSpeed: this.categorizeProcessingSpeed(data),
      learningModalities: this.inferLearningModalities(data),
      supportNeeds: this.identifySupportNeeds(data),
      strengths: this.identifyStrengths(data),
      challenges: this.identifyChallenges(data)
    };
  }

  /**
   * Extract communication profile
   */
  extractCommunicationProfile(data) {
    return {
      verbalSkills: this.categorizeScore(data.verbal_communication),
      nonverbalSkills: this.categorizeScore(data.nonverbal_communication),
      socialCommunication: this.categorizeScore(data.social_interaction),
      preferredModes: this.inferCommunicationModes(data),
      supportStrategies: this.generateCommunicationStrategies(data)
    };
  }

  /**
   * Extract social interaction profile
   */
  extractSocialProfile(data) {
    return {
      peerInteraction: this.categorizeScore(data.social_interaction),
      eyeContact: this.categorizeScore(data.eye_contact),
      socialReciprocity: this.categorizeScore(data.social_reciprocity),
      groupPreference: this.inferGroupPreference(data),
      socialStrategies: this.generateSocialStrategies(data)
    };
  }

  /**
   * Extract sensory processing profile
   */
  extractSensoryProfile(data) {
    return {
      overallSensitivity: this.categorizeScore(data.sensory_sensitivity),
      auditoryProcessing: this.categorizeScore(data.sound_sensitivity),
      visualProcessing: this.categorizeScore(data.light_sensitivity),
      tactileProcessing: this.categorizeScore(data.touch_sensitivity),
      sensoryStrategies: this.generateSensoryStrategies(data)
    };
  }

  /**
   * Extract behavioral patterns
   */
  extractBehaviorProfile(data) {
    return {
      repetitiveBehaviors: this.categorizeScore(data.repetitive_behaviors),
      routineAdherence: this.categorizeScore(data.routines),
      restrictedInterests: this.categorizeScore(data.interests),
      selfRegulation: this.categorizeScore(data.self_regulation),
      behaviorStrategies: this.generateBehaviorStrategies(data)
    };
  }

  /**
   * Generate educational recommendations based on profile
   */
  generateEducationalRecommendations(data) {
    const recommendations = {
      instructionalStrategies: [],
      environmentalModifications: [],
      assessmentAdaptations: [],
      socialSupports: [],
      sensorySupports: [],
      communicationSupports: []
    };

    // Instructional strategies
    if (this.categorizeScore(data.attention_span) === 'low') {
      recommendations.instructionalStrategies.push('Break tasks into 5-10 minute segments');
      recommendations.instructionalStrategies.push('Use visual timers and schedules');
      recommendations.instructionalStrategies.push('Provide frequent breaks');
    }

    if (this.categorizeScore(data.communication) === 'low') {
      recommendations.instructionalStrategies.push('Use visual supports and symbols');
      recommendations.instructionalStrategies.push('Provide multiple ways to demonstrate understanding');
      recommendations.instructionalStrategies.push('Allow extra processing time');
    }

    // Environmental modifications
    if (this.categorizeScore(data.sensory_sensitivity) === 'high') {
      recommendations.environmentalModifications.push('Provide quiet workspace options');
      recommendations.environmentalModifications.push('Use soft lighting and reduce visual clutter');
      recommendations.environmentalModifications.push('Offer noise-canceling headphones');
    }

    if (this.categorizeScore(data.routines) === 'high') {
      recommendations.environmentalModifications.push('Maintain consistent daily schedules');
      recommendations.environmentalModifications.push('Provide advance notice of changes');
      recommendations.environmentalModifications.push('Use visual schedules and calendars');
    }

    // Assessment adaptations
    recommendations.assessmentAdaptations.push('Allow extended time for responses');
    recommendations.assessmentAdaptations.push('Provide alternative response formats');
    recommendations.assessmentAdaptations.push('Use visual demonstration when possible');

    return recommendations;
  }

  /**
   * Generate AI prompt context for personalized resource creation
   */
  generateAIPromptContext(data) {
    const supportLevels = this.calculateSupportLevels(data);
    const learningProfile = this.extractLearningProfile(data);
    
    return {
      supportLevel: supportLevels.overall,
      primaryChallenges: learningProfile.challenges,
      primaryStrengths: learningProfile.strengths,
      communicationStyle: this.inferCommunicationModes(data),
      sensoryConsiderations: this.extractSensoryConsiderations(data),
      structuralNeeds: this.extractStructuralNeeds(data),
      promptEnhancements: this.generatePromptEnhancements(data)
    };
  }

  /**
   * Helper methods for data processing
   */
  parseAge(ageValue) {
    if (typeof ageValue === 'number') return ageValue;
    if (typeof ageValue === 'string') {
      const parsed = parseInt(ageValue);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  categorizeAge(age) {
    if (!age) return 'unknown';
    if (age <= 6) return 'early-years';
    if (age <= 11) return 'primary';
    if (age <= 16) return 'secondary';
    return 'post-secondary';
  }

  calculateDomainSupport(domain, score) {
    if (score === undefined || score === null) return 'unknown';
    
    const mappings = this.supportLevelMappings[domain];
    if (!mappings) return 'medium';
    
    for (const [level, range] of Object.entries(mappings)) {
      if (score >= range[0] && score <= range[1]) {
        return level;
      }
    }
    
    return 'medium';
  }

  calculateOverallSupport(data) {
    const scores = [
      data.communication,
      data.social_interaction,
      data.repetitive_behaviors,
      data.sensory_sensitivity
    ].filter(score => score !== undefined && score !== null);
    
    if (scores.length === 0) return 'medium';
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (average <= 2) return 'low';
    if (average <= 4) return 'medium';
    return 'high';
  }

  categorizeScore(score) {
    if (score === undefined || score === null) return 'unknown';
    if (score <= 2) return 'low';
    if (score <= 4) return 'medium';
    return 'high';
  }

  categorizeAttentionSpan(score) {
    if (score === undefined || score === null) return 'moderate';
    if (score <= 2) return 'short';
    if (score <= 4) return 'moderate';
    return 'extended';
  }

  categorizeProcessingSpeed(data) {
    // Infer from multiple indicators
    const indicators = [data.communication, data.attention_span];
    const validScores = indicators.filter(s => s !== undefined && s !== null);
    
    if (validScores.length === 0) return 'moderate';
    
    const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    
    if (average <= 2) return 'slow';
    if (average <= 4) return 'moderate';
    return 'fast';
  }

  inferLearningModalities(data) {
    const modalities = [];
    
    // Infer from communication and sensory data
    if (this.categorizeScore(data.visual_processing || data.light_sensitivity) !== 'high') {
      modalities.push('visual');
    }
    
    if (this.categorizeScore(data.sound_sensitivity) !== 'high') {
      modalities.push('auditory');
    }
    
    if (this.categorizeScore(data.touch_sensitivity) !== 'high') {
      modalities.push('kinesthetic');
    }
    
    return modalities.length > 0 ? modalities : ['visual']; // Default to visual
  }

  identifySupportNeeds(data) {
    const needs = [];
    
    if (this.categorizeScore(data.communication) === 'low') {
      needs.push('communication-support');
    }
    
    if (this.categorizeScore(data.social_interaction) === 'low') {
      needs.push('social-skills-support');
    }
    
    if (this.categorizeScore(data.sensory_sensitivity) === 'high') {
      needs.push('sensory-regulation');
    }
    
    if (this.categorizeScore(data.attention_span) === 'low') {
      needs.push('attention-support');
    }
    
    return needs;
  }

  identifyStrengths(data) {
    const strengths = [];
    
    if (this.categorizeScore(data.routines) === 'high') {
      strengths.push('routine-following');
    }
    
    if (this.categorizeScore(data.interests) === 'high') {
      strengths.push('focused-interests');
    }
    
    if (this.categorizeScore(data.independence) === 'high') {
      strengths.push('independent-work');
    }
    
    return strengths;
  }

  identifyChallenges(data) {
    const challenges = [];
    
    if (this.categorizeScore(data.communication) === 'low') {
      challenges.push('communication-difficulties');
    }
    
    if (this.categorizeScore(data.social_interaction) === 'low') {
      challenges.push('social-interaction-challenges');
    }
    
    if (this.categorizeScore(data.sensory_sensitivity) === 'high') {
      challenges.push('sensory-processing-difficulties');
    }
    
    return challenges;
  }

  // Additional helper methods...
  inferCommunicationModes(data) {
    const modes = [];
    if (this.categorizeScore(data.verbal_communication) !== 'low') modes.push('verbal');
    if (this.categorizeScore(data.nonverbal_communication) !== 'low') modes.push('nonverbal');
    modes.push('visual'); // Always include visual as backup
    return modes;
  }

  inferGroupPreference(data) {
    const socialScore = this.categorizeScore(data.social_interaction);
    if (socialScore === 'low') return 'individual';
    if (socialScore === 'medium') return 'small-group';
    return 'flexible';
  }

  extractSensoryConsiderations(data) {
    const considerations = [];
    if (this.categorizeScore(data.sound_sensitivity) === 'high') {
      considerations.push('minimize-auditory-distractions');
    }
    if (this.categorizeScore(data.light_sensitivity) === 'high') {
      considerations.push('adjust-lighting');
    }
    if (this.categorizeScore(data.touch_sensitivity) === 'high') {
      considerations.push('consider-tactile-sensitivities');
    }
    return considerations;
  }

  extractStructuralNeeds(data) {
    const needs = [];
    if (this.categorizeScore(data.routines) === 'high') {
      needs.push('high-structure');
      needs.push('predictable-format');
    }
    if (this.categorizeScore(data.attention_span) === 'low') {
      needs.push('chunked-activities');
      needs.push('frequent-breaks');
    }
    return needs;
  }

  generatePromptEnhancements(data) {
    const enhancements = [];
    
    const supportLevel = this.calculateOverallSupport(data);
    enhancements.push(`Overall support level: ${supportLevel}`);
    
    const communicationLevel = this.categorizeScore(data.communication);
    enhancements.push(`Communication level: ${communicationLevel}`);
    
    const sensoryLevel = this.categorizeScore(data.sensory_sensitivity);
    enhancements.push(`Sensory sensitivity: ${sensoryLevel}`);
    
    return enhancements;
  }

  generateCommunicationStrategies(data) {
    const strategies = [];
    if (this.categorizeScore(data.verbal_communication) === 'low') {
      strategies.push('Use visual supports and symbols');
      strategies.push('Provide multiple communication options');
    }
    return strategies;
  }

  generateSocialStrategies(data) {
    const strategies = [];
    if (this.categorizeScore(data.social_interaction) === 'low') {
      strategies.push('Start with structured social activities');
      strategies.push('Provide social scripts and cues');
    }
    return strategies;
  }

  generateSensoryStrategies(data) {
    const strategies = [];
    if (this.categorizeScore(data.sensory_sensitivity) === 'high') {
      strategies.push('Provide sensory breaks');
      strategies.push('Offer sensory regulation tools');
    }
    return strategies;
  }

  generateBehaviorStrategies(data) {
    const strategies = [];
    if (this.categorizeScore(data.repetitive_behaviors) === 'high') {
      strategies.push('Incorporate interests into learning');
      strategies.push('Provide structured choices');
    }
    return strategies;
  }

  generateProfileId(data) {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const dataTransformationService = new DataTransformationService();
export default dataTransformationService;