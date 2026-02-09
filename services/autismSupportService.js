/**
 * Autism Support Service
 * Transforms autism assessment data into educational support profiles
 * Uses dataset insights to personalize learning experiences
 */

class AutismSupportService {
  constructor() {
    this.supportCategories = {
      communication: ['verbal', 'visual', 'gestural', 'written'],
      social: ['individual', 'small-group', 'peer-supported', 'adult-guided'],
      sensory: ['low-stimulation', 'moderate', 'high-input', 'varied'],
      structure: ['high-routine', 'moderate-flexibility', 'choice-based'],
      attention: ['short-burst', 'extended-focus', 'movement-breaks'],
      independence: ['high-support', 'moderate-support', 'emerging-independence']
    };
  }

  /**
   * Transform raw dataset into support profile
   * This would process the Excel data once converted to JSON
   */
  createSupportProfile(datasetRow) {
    // Example transformation from typical autism assessment data
    const profile = {
      studentId: datasetRow.id || this.generateId(),
      supportLevel: this.calculateOverallSupportLevel(datasetRow),
      
      // Communication support needs
      communication: {
        level: this.assessCommunicationLevel(datasetRow),
        preferences: this.extractCommunicationPreferences(datasetRow),
        strategies: this.getCommunicationStrategies(datasetRow)
      },
      
      // Social interaction support
      social: {
        level: this.assessSocialLevel(datasetRow),
        groupPreference: this.extractGroupPreference(datasetRow),
        strategies: this.getSocialStrategies(datasetRow)
      },
      
      // Sensory processing needs
      sensory: {
        level: this.assessSensoryLevel(datasetRow),
        sensitivities: this.extractSensitivities(datasetRow),
        strategies: this.getSensoryStrategies(datasetRow)
      },
      
      // Structure and routine needs
      structure: {
        level: this.assessStructureLevel(datasetRow),
        flexibility: this.extractFlexibilityLevel(datasetRow),
        strategies: this.getStructureStrategies(datasetRow)
      },
      
      // Attention and focus patterns
      attention: {
        level: this.assessAttentionLevel(datasetRow),
        duration: this.extractAttentionDuration(datasetRow),
        strategies: this.getAttentionStrategies(datasetRow)
      },
      
      // Independence and self-regulation
      independence: {
        level: this.assessIndependenceLevel(datasetRow),
        areas: this.extractIndependenceAreas(datasetRow),
        strategies: this.getIndependenceStrategies(datasetRow)
      },
      
      // Learning preferences derived from assessment
      learningPreferences: {
        modality: this.extractLearningModality(datasetRow),
        pace: this.extractLearningPace(datasetRow),
        reinforcement: this.extractReinforcementPreferences(datasetRow)
      },
      
      // Generated teaching recommendations
      teachingRecommendations: this.generateTeachingRecommendations(datasetRow)
    };

    return profile;
  }

  /**
   * Calculate overall support level from dataset indicators
   */
  calculateOverallSupportLevel(data) {
    // Example logic - would be customized based on actual dataset structure
    const indicators = [
      data.communication_score || 0,
      data.social_score || 0,
      data.repetitive_behavior_score || 0,
      data.sensory_score || 0
    ];
    
    const average = indicators.reduce((sum, score) => sum + score, 0) / indicators.length;
    
    if (average <= 2) return 'low';
    if (average <= 4) return 'medium';
    return 'high';
  }

  /**
   * Extract communication support needs
   */
  assessCommunicationLevel(data) {
    // Transform dataset communication indicators
    const communicationIndicators = {
      verbal_communication: data.verbal_skills || 0,
      nonverbal_communication: data.nonverbal_skills || 0,
      social_communication: data.social_communication || 0
    };
    
    const avgScore = Object.values(communicationIndicators).reduce((sum, val) => sum + val, 0) / 3;
    
    if (avgScore >= 4) return 'strong';
    if (avgScore >= 2) return 'developing';
    return 'emerging';
  }

  /**
   * Generate teaching strategies based on support profile
   */
  generateTeachingRecommendations(data) {
    const recommendations = {
      instructionStyle: [],
      environmentalSupports: [],
      communicationSupports: [],
      behaviorSupports: [],
      assessmentAdaptations: []
    };

    // Instruction style recommendations
    if (data.attention_span === 'short') {
      recommendations.instructionStyle.push('Break tasks into 5-10 minute segments');
      recommendations.instructionStyle.push('Use visual timers and schedules');
    }
    
    if (data.processing_speed === 'slow') {
      recommendations.instructionStyle.push('Allow extra processing time');
      recommendations.instructionStyle.push('Repeat instructions in different ways');
    }

    // Environmental supports
    if (data.sensory_sensitivity === 'high') {
      recommendations.environmentalSupports.push('Provide quiet workspace options');
      recommendations.environmentalSupports.push('Use soft lighting and minimal visual clutter');
    }

    // Communication supports
    if (data.verbal_communication === 'limited') {
      recommendations.communicationSupports.push('Use visual supports and symbols');
      recommendations.communicationSupports.push('Provide choice boards and communication cards');
    }

    return recommendations;
  }

  /**
   * Convert support profile to AI prompt context
   */
  generateAIContext(supportProfile) {
    const context = {
      supportLevel: supportProfile.supportLevel,
      keyStrategies: [],
      environmentalNeeds: [],
      communicationStyle: supportProfile.communication.preferences,
      learningPreferences: supportProfile.learningPreferences
    };

    // Build context strings for AI prompts
    context.keyStrategies = [
      ...supportProfile.communication.strategies,
      ...supportProfile.social.strategies,
      ...supportProfile.sensory.strategies
    ];

    context.environmentalNeeds = [
      ...supportProfile.structure.strategies,
      ...supportProfile.attention.strategies
    ];

    return context;
  }

  /**
   * Generate autism-friendly prompt enhancements
   */
  enhanceAIPrompt(basePrompt, supportProfile) {
    const aiContext = this.generateAIContext(supportProfile);
    
    const enhancedPrompt = `${basePrompt}

AUTISM SUPPORT CONTEXT:
- Support Level: ${aiContext.supportLevel}
- Communication Style: ${aiContext.communicationStyle.join(', ')}
- Learning Preferences: Visual=${supportProfile.learningPreferences.modality.includes('visual')}, Structured=${supportProfile.structure.level === 'high-routine'}

KEY STRATEGIES TO INCORPORATE:
${aiContext.keyStrategies.map(strategy => `- ${strategy}`).join('\n')}

ENVIRONMENTAL CONSIDERATIONS:
${aiContext.environmentalNeeds.map(need => `- ${need}`).join('\n')}

SPECIFIC ADAPTATIONS NEEDED:
- Text Level: ${this.getTextLevelRecommendation(supportProfile)}
- Visual Support: ${this.getVisualSupportRecommendation(supportProfile)}
- Task Structure: ${this.getTaskStructureRecommendation(supportProfile)}
- Assessment Method: ${this.getAssessmentRecommendation(supportProfile)}`;

    return enhancedPrompt;
  }

  /**
   * Get text complexity recommendation based on profile
   */
  getTextLevelRecommendation(profile) {
    if (profile.communication.level === 'emerging') return 'very-simple';
    if (profile.communication.level === 'developing') return 'simple';
    return 'age-appropriate';
  }

  /**
   * Get visual support recommendation
   */
  getVisualSupportRecommendation(profile) {
    if (profile.learningPreferences.modality.includes('visual')) return 'high';
    if (profile.communication.level === 'emerging') return 'high';
    return 'moderate';
  }

  /**
   * Get task structure recommendation
   */
  getTaskStructureRecommendation(profile) {
    if (profile.structure.level === 'high-routine') return 'highly-structured';
    if (profile.attention.level === 'short-burst') return 'chunked';
    return 'flexible';
  }

  /**
   * Get assessment method recommendation
   */
  getAssessmentRecommendation(profile) {
    const methods = [];
    
    if (profile.communication.preferences.includes('visual')) {
      methods.push('visual-demonstration');
    }
    
    if (profile.social.groupPreference === 'individual') {
      methods.push('one-on-one-assessment');
    }
    
    if (profile.attention.duration === 'short') {
      methods.push('multiple-short-sessions');
    }
    
    return methods.join(', ') || 'standard-adapted';
  }

  /**
   * Create student profile tags for resource filtering
   */
  generateProfileTags(supportProfile) {
    const tags = [];
    
    // Support level tags
    tags.push(`support-${supportProfile.supportLevel}`);
    
    // Communication tags
    tags.push(`comm-${supportProfile.communication.level}`);
    supportProfile.communication.preferences.forEach(pref => {
      tags.push(`comm-${pref}`);
    });
    
    // Learning preference tags
    supportProfile.learningPreferences.modality.forEach(modality => {
      tags.push(`learning-${modality}`);
    });
    
    // Structure tags
    tags.push(`structure-${supportProfile.structure.level}`);
    
    // Sensory tags
    tags.push(`sensory-${supportProfile.sensory.level}`);
    
    return tags;
  }

  /**
   * Match resources to student profile
   */
  matchResourcesToProfile(resources, supportProfile) {
    const profileTags = this.generateProfileTags(supportProfile);
    
    return resources.map(resource => {
      const matchScore = this.calculateMatchScore(resource, profileTags, supportProfile);
      return {
        ...resource,
        matchScore,
        adaptationSuggestions: this.generateAdaptationSuggestions(resource, supportProfile)
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Calculate how well a resource matches a student profile
   */
  calculateMatchScore(resource, profileTags, supportProfile) {
    let score = 0;
    
    // Tag matching
    const resourceTags = resource.tags || [];
    const matchingTags = resourceTags.filter(tag => profileTags.includes(tag));
    score += matchingTags.length * 10;
    
    // Format matching
    if (supportProfile.learningPreferences.modality.includes('visual') && 
        resource.format === 'cards') {
      score += 20;
    }
    
    // Text level matching
    const recommendedTextLevel = this.getTextLevelRecommendation(supportProfile);
    if (resource.textLevel === recommendedTextLevel) {
      score += 15;
    }
    
    // Visual support matching
    const needsVisualSupport = this.getVisualSupportRecommendation(supportProfile) === 'high';
    if (resource.visualSupport === needsVisualSupport) {
      score += 15;
    }
    
    return score;
  }

  /**
   * Generate specific adaptation suggestions for a resource
   */
  generateAdaptationSuggestions(resource, supportProfile) {
    const suggestions = [];
    
    if (supportProfile.attention.duration === 'short' && resource.format === 'worksheet') {
      suggestions.push('Break worksheet into smaller sections');
      suggestions.push('Add visual progress indicators');
    }
    
    if (supportProfile.sensory.level === 'high-input' && resource.format === 'presentation') {
      suggestions.push('Add movement breaks between slides');
      suggestions.push('Include sensory regulation activities');
    }
    
    if (supportProfile.communication.level === 'emerging') {
      suggestions.push('Add more visual cues and symbols');
      suggestions.push('Simplify language and instructions');
    }
    
    return suggestions;
  }

  // Helper methods for data extraction (would be customized based on actual dataset)
  extractCommunicationPreferences(data) {
    const prefs = [];
    if (data.prefers_visual_communication) prefs.push('visual');
    if (data.uses_verbal_communication) prefs.push('verbal');
    if (data.uses_gestures) prefs.push('gestural');
    return prefs;
  }

  extractGroupPreference(data) {
    if (data.social_interaction_score <= 2) return 'individual';
    if (data.social_interaction_score <= 4) return 'small-group';
    return 'large-group';
  }

  extractSensitivities(data) {
    const sensitivities = [];
    if (data.sound_sensitivity) sensitivities.push('auditory');
    if (data.light_sensitivity) sensitivities.push('visual');
    if (data.touch_sensitivity) sensitivities.push('tactile');
    return sensitivities;
  }

  extractLearningModality(data) {
    const modalities = [];
    if (data.visual_learning_preference) modalities.push('visual');
    if (data.auditory_learning_preference) modalities.push('auditory');
    if (data.kinesthetic_learning_preference) modalities.push('kinesthetic');
    return modalities.length > 0 ? modalities : ['visual']; // Default to visual
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Additional assessment methods would be implemented based on actual dataset structure
  assessSocialLevel(data) { return 'developing'; }
  assessSensoryLevel(data) { return 'moderate'; }
  assessStructureLevel(data) { return 'high-routine'; }
  assessAttentionLevel(data) { return 'short-burst'; }
  assessIndependenceLevel(data) { return 'moderate-support'; }
  
  extractFlexibilityLevel(data) { return 'low'; }
  extractAttentionDuration(data) { return 'short'; }
  extractIndependenceAreas(data) { return ['self-care', 'task-completion']; }
  extractLearningPace(data) { return 'moderate'; }
  extractReinforcementPreferences(data) { return ['visual', 'social']; }
  
  getCommunicationStrategies(data) { return ['Use visual supports', 'Allow processing time']; }
  getSocialStrategies(data) { return ['Start with parallel activities', 'Provide social scripts']; }
  getSensoryStrategies(data) { return ['Offer sensory breaks', 'Reduce environmental stimuli']; }
  getStructureStrategies(data) { return ['Use visual schedules', 'Maintain consistent routines']; }
  getAttentionStrategies(data) { return ['Break tasks into chunks', 'Use timers and visual cues']; }
  getIndependenceStrategies(data) { return ['Provide step-by-step guides', 'Use positive reinforcement']; }
}

// Export singleton instance
export const autismSupportService = new AutismSupportService();
export default autismSupportService;