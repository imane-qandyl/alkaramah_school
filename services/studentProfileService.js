/**
 * Student Profile Service
 * Manages autism support profiles and integrates with resource generation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { autismSupportService } from './autismSupportService';
import { dataTransformationService } from './dataTransformationService';

class StudentProfileService {
  constructor() {
    this.PROFILES_KEY = 'student_autism_profiles';
    this.ACTIVE_PROFILE_KEY = 'active_student_profile';
  }

  /**
   * Create a new student profile from dataset or manual input
   */
  async createProfile(profileData, source = 'manual') {
    try {
      let profile;
      
      if (source === 'dataset') {
        // Transform dataset row into support profile
        profile = await dataTransformationService.transformSingleRecord(profileData);
      } else {
        // Create profile from manual input
        profile = this.createManualProfile(profileData);
      }
      
      // Save profile
      const savedProfile = await this.saveProfile(profile);
      return { success: true, profile: savedProfile };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create profile from manual teacher input
   */
  createManualProfile(data) {
    return {
      id: this.generateProfileId(),
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Basic information
      studentName: data.studentName || 'Student',
      age: data.age,
      ageGroup: this.categorizeAge(data.age),
      
      // Support levels (teacher assessment)
      supportLevels: {
        communication: data.communicationLevel || 'medium',
        social: data.socialLevel || 'medium',
        behavioral: data.behaviorLevel || 'medium',
        sensory: data.sensoryLevel || 'medium',
        overall: data.overallSupport || 'medium'
      },
      
      // Learning preferences
      learningProfile: {
        attentionSpan: data.attentionSpan || 'moderate',
        processingSpeed: data.processingSpeed || 'moderate',
        learningModalities: data.learningModalities || ['visual'],
        supportNeeds: data.supportNeeds || [],
        strengths: data.strengths || [],
        challenges: data.challenges || []
      },
      
      // Communication profile
      communicationProfile: {
        verbalSkills: data.verbalSkills || 'medium',
        nonverbalSkills: data.nonverbalSkills || 'medium',
        preferredModes: data.communicationModes || ['verbal', 'visual'],
        supportStrategies: data.communicationStrategies || []
      },
      
      // Social profile
      socialProfile: {
        peerInteraction: data.peerInteraction || 'medium',
        groupPreference: data.groupPreference || 'small-group',
        socialStrategies: data.socialStrategies || []
      },
      
      // Sensory profile
      sensoryProfile: {
        overallSensitivity: data.sensoryLevel || 'medium',
        auditoryProcessing: data.auditoryProcessing || 'medium',
        visualProcessing: data.visualProcessing || 'medium',
        tactileProcessing: data.tactileProcessing || 'medium',
        sensoryStrategies: data.sensoryStrategies || []
      },
      
      // Educational recommendations
      educationalRecommendations: this.generateBasicRecommendations(data),
      
      // AI context for resource generation
      aiPromptContext: this.generateAIContext(data)
    };
  }

  /**
   * Save profile to storage
   */
  async saveProfile(profile) {
    try {
      const existingProfiles = await this.getAllProfiles();
      const updatedProfiles = [profile, ...existingProfiles.filter(p => p.id !== profile.id)];
      
      await AsyncStorage.setItem(this.PROFILES_KEY, JSON.stringify(updatedProfiles));
      return profile;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  /**
   * Get all student profiles
   */
  async getAllProfiles() {
    try {
      const profilesJson = await AsyncStorage.getItem(this.PROFILES_KEY);
      return profilesJson ? JSON.parse(profilesJson) : [];
    } catch (error) {
      console.error('Error getting profiles:', error);
      return [];
    }
  }

  /**
   * Get profile by ID
   */
  async getProfileById(id) {
    try {
      const profiles = await this.getAllProfiles();
      return profiles.find(profile => profile.id === id) || null;
    } catch (error) {
      console.error('Error getting profile by ID:', error);
      return null;
    }
  }

  /**
   * Set active student profile
   */
  async setActiveProfile(profileId) {
    try {
      await AsyncStorage.setItem(this.ACTIVE_PROFILE_KEY, profileId);
      return { success: true };
    } catch (error) {
      console.error('Error setting active profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get active student profile
   */
  async getActiveProfile() {
    try {
      const activeProfileId = await AsyncStorage.getItem(this.ACTIVE_PROFILE_KEY);
      if (!activeProfileId) return null;
      
      return await this.getProfileById(activeProfileId);
    } catch (error) {
      console.error('Error getting active profile:', error);
      return null;
    }
  }

  /**
   * Update existing profile
   */
  async updateProfile(id, updates) {
    try {
      const profiles = await this.getAllProfiles();
      const profileIndex = profiles.findIndex(p => p.id === id);
      
      if (profileIndex === -1) {
        return { success: false, error: 'Profile not found' };
      }
      
      profiles[profileIndex] = {
        ...profiles[profileIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
      return { success: true, profile: profiles[profileIndex] };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete profile
   */
  async deleteProfile(id) {
    try {
      const profiles = await this.getAllProfiles();
      const filteredProfiles = profiles.filter(p => p.id !== id);
      
      await AsyncStorage.setItem(this.PROFILES_KEY, JSON.stringify(filteredProfiles));
      
      // Clear active profile if it was deleted
      const activeProfileId = await AsyncStorage.getItem(this.ACTIVE_PROFILE_KEY);
      if (activeProfileId === id) {
        await AsyncStorage.removeItem(this.ACTIVE_PROFILE_KEY);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate AI context for resource creation
   */
  generateResourceContext(profile, resourceParams) {
    if (!profile) return resourceParams;
    
    // Enhance resource parameters with profile data
    const enhancedParams = {
      ...resourceParams,
      autismProfile: {
        supportLevel: profile.supportLevels?.overall || 'medium',
        communicationStyle: profile.communicationProfile?.preferredModes?.join(', ') || 'mixed',
        sensoryConsiderations: this.extractSensoryConsiderations(profile),
        attentionSpan: profile.learningProfile?.attentionSpan || 'moderate',
        socialPreference: profile.socialProfile?.groupPreference || 'flexible',
        adaptations: this.generateAdaptations(profile),
        teachingStrategies: this.generateTeachingStrategies(profile)
      }
    };
    
    return enhancedParams;
  }

  /**
   * Extract sensory considerations from profile
   */
  extractSensoryConsiderations(profile) {
    const considerations = [];
    
    if (profile.sensoryProfile?.auditoryProcessing === 'high') {
      considerations.push('Minimize auditory distractions');
    }
    
    if (profile.sensoryProfile?.visualProcessing === 'high') {
      considerations.push('Reduce visual clutter');
    }
    
    if (profile.sensoryProfile?.tactileProcessing === 'high') {
      considerations.push('Consider tactile sensitivities');
    }
    
    return considerations.length > 0 ? considerations : ['Standard sensory environment'];
  }

  /**
   * Generate specific adaptations based on profile
   */
  generateAdaptations(profile) {
    const adaptations = [];
    
    // Communication adaptations
    if (profile.communicationProfile?.verbalSkills === 'low') {
      adaptations.push('Use visual supports and symbols');
      adaptations.push('Provide multiple response options');
    }
    
    // Attention adaptations
    if (profile.learningProfile?.attentionSpan === 'short') {
      adaptations.push('Break activities into 5-10 minute segments');
      adaptations.push('Include movement breaks');
    }
    
    // Social adaptations
    if (profile.socialProfile?.groupPreference === 'individual') {
      adaptations.push('Provide individual work options');
      adaptations.push('Minimize group interaction requirements');
    }
    
    // Sensory adaptations
    if (profile.sensoryProfile?.overallSensitivity === 'high') {
      adaptations.push('Provide sensory regulation breaks');
      adaptations.push('Offer alternative sensory experiences');
    }
    
    return adaptations;
  }

  /**
   * Generate teaching strategies based on profile
   */
  generateTeachingStrategies(profile) {
    const strategies = [];
    
    // Add strategies from profile
    if (profile.communicationProfile?.supportStrategies) {
      strategies.push(...profile.communicationProfile.supportStrategies);
    }
    
    if (profile.socialProfile?.socialStrategies) {
      strategies.push(...profile.socialProfile.socialStrategies);
    }
    
    if (profile.sensoryProfile?.sensoryStrategies) {
      strategies.push(...profile.sensoryProfile.sensoryStrategies);
    }
    
    // Add default strategies if none specified
    if (strategies.length === 0) {
      strategies.push('Use clear, step-by-step instructions');
      strategies.push('Provide visual schedules and supports');
      strategies.push('Allow processing time');
      strategies.push('Use positive reinforcement');
    }
    
    return strategies;
  }

  /**
   * Generate basic recommendations for manual profiles
   */
  generateBasicRecommendations(data) {
    return {
      instructionalStrategies: [
        'Use clear, structured instructions',
        'Provide visual supports',
        'Allow processing time'
      ],
      environmentalModifications: [
        'Minimize distractions',
        'Provide consistent routines',
        'Offer quiet workspace options'
      ],
      assessmentAdaptations: [
        'Allow extended time',
        'Provide alternative response formats',
        'Use visual demonstrations'
      ]
    };
  }

  /**
   * Generate AI context for manual profiles
   */
  generateAIContext(data) {
    return {
      supportLevel: data.overallSupport || 'medium',
      primaryChallenges: data.challenges || [],
      primaryStrengths: data.strengths || [],
      communicationStyle: data.communicationModes || ['verbal', 'visual'],
      sensoryConsiderations: [],
      structuralNeeds: [],
      promptEnhancements: [
        `Support level: ${data.overallSupport || 'medium'}`,
        `Communication: ${data.communicationLevel || 'medium'}`,
        `Attention span: ${data.attentionSpan || 'moderate'}`
      ]
    };
  }

  /**
   * Search profiles by criteria
   */
  async searchProfiles(query, filters = {}) {
    try {
      const profiles = await this.getAllProfiles();
      const lowercaseQuery = query.toLowerCase();
      
      return profiles.filter(profile => {
        // Text search
        const matchesSearch = !query || 
          profile.studentName?.toLowerCase().includes(lowercaseQuery) ||
          profile.supportLevels?.overall?.includes(lowercaseQuery);
        
        // Age filter
        const matchesAge = !filters.ageGroup || profile.ageGroup === filters.ageGroup;
        
        // Support level filter
        const matchesSupport = !filters.supportLevel || 
          profile.supportLevels?.overall === filters.supportLevel;
        
        return matchesSearch && matchesAge && matchesSupport;
      });
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }

  /**
   * Get profile statistics
   */
  async getProfileStats() {
    try {
      const profiles = await this.getAllProfiles();
      
      const stats = {
        total: profiles.length,
        byAgeGroup: {},
        bySupportLevel: {},
        bySource: {}
      };
      
      profiles.forEach(profile => {
        // Age group stats
        const ageGroup = profile.ageGroup || 'unknown';
        stats.byAgeGroup[ageGroup] = (stats.byAgeGroup[ageGroup] || 0) + 1;
        
        // Support level stats
        const supportLevel = profile.supportLevels?.overall || 'unknown';
        stats.bySupportLevel[supportLevel] = (stats.bySupportLevel[supportLevel] || 0) + 1;
        
        // Source stats
        const source = profile.source || 'unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting profile stats:', error);
      return { total: 0, byAgeGroup: {}, bySupportLevel: {}, bySource: {} };
    }
  }

  /**
   * Clear all profiles (for testing/reset)
   */
  async clearAllProfiles() {
    try {
      await AsyncStorage.multiRemove([
        this.PROFILES_KEY,
        this.ACTIVE_PROFILE_KEY
      ]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing profiles:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  generateProfileId() {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  categorizeAge(age) {
    if (!age) return 'unknown';
    if (age <= 6) return 'early-years';
    if (age <= 11) return 'primary';
    if (age <= 16) return 'secondary';
    return 'post-secondary';
  }
}

// Export singleton instance
export const studentProfileService = new StudentProfileService();
export default studentProfileService;