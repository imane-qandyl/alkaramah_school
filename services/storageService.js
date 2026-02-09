/**
 * Storage Service for Educational Resources
 * Handles local storage and management of created resources
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  constructor() {
    this.STORAGE_KEY = 'teach_smart_resources';
    this.SETTINGS_KEY = 'teach_smart_settings';
  }

  /**
   * Save a resource to local storage
   */
  async saveResource(resource) {
    try {
      const existingResources = await this.getAllResources();
      const newResource = {
        id: Date.now().toString(),
        ...resource,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      
      const updatedResources = [newResource, ...existingResources];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedResources));
      
      return { success: true, resource: newResource };
    } catch (error) {
      console.error('Save resource error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all saved resources
   */
  async getAllResources() {
    try {
      const resourcesJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      return resourcesJson ? JSON.parse(resourcesJson) : [];
    } catch (error) {
      console.error('Get resources error:', error);
      return [];
    }
  }

  /**
   * Get resource by ID
   */
  async getResourceById(id) {
    try {
      const resources = await this.getAllResources();
      return resources.find(resource => resource.id === id);
    } catch (error) {
      console.error('Get resource by ID error:', error);
      return null;
    }
  }

  /**
   * Update existing resource
   */
  async updateResource(id, updates) {
    try {
      const resources = await this.getAllResources();
      const resourceIndex = resources.findIndex(resource => resource.id === id);
      
      if (resourceIndex === -1) {
        return { success: false, error: 'Resource not found' };
      }
      
      resources[resourceIndex] = {
        ...resources[resourceIndex],
        ...updates,
        lastModified: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(resources));
      return { success: true, resource: resources[resourceIndex] };
    } catch (error) {
      console.error('Update resource error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete resource
   */
  async deleteResource(id) {
    try {
      const resources = await this.getAllResources();
      const filteredResources = resources.filter(resource => resource.id !== id);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredResources));
      return { success: true };
    } catch (error) {
      console.error('Delete resource error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search resources
   */
  async searchResources(query) {
    try {
      const resources = await this.getAllResources();
      const lowercaseQuery = query.toLowerCase();
      
      return resources.filter(resource => 
        resource.title?.toLowerCase().includes(lowercaseQuery) ||
        resource.aetTarget?.toLowerCase().includes(lowercaseQuery) ||
        resource.content?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Search resources error:', error);
      return [];
    }
  }

  /**
   * Filter resources by criteria
   */
  async filterResources(filters) {
    try {
      const resources = await this.getAllResources();
      
      return resources.filter(resource => {
        if (filters.format && resource.format !== filters.format) return false;
        if (filters.ageGroup && !this.matchesAgeGroup(resource.studentAge, filters.ageGroup)) return false;
        if (filters.abilityLevel && resource.abilityLevel !== filters.abilityLevel) return false;
        return true;
      });
    } catch (error) {
      console.error('Filter resources error:', error);
      return [];
    }
  }

  /**
   * Check if age matches age group filter
   */
  matchesAgeGroup(age, ageGroup) {
    const numAge = parseInt(age);
    switch (ageGroup) {
      case 'early': return numAge >= 3 && numAge <= 6;
      case 'primary': return numAge >= 7 && numAge <= 11;
      case 'secondary': return numAge >= 12 && numAge <= 16;
      default: return true;
    }
  }

  /**
   * Get user settings
   */
  async getSettings() {
    try {
      const settingsJson = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : this.getDefaultSettings();
    } catch (error) {
      console.error('Get settings error:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Save user settings
   */
  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      return { success: true };
    } catch (error) {
      console.error('Save settings error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get default settings
   */
  getDefaultSettings() {
    return {
      defaultFormat: 'worksheet',
      defaultAgeGroup: '7-9',
      defaultAbilityLevel: 'developing',
      visualSupport: true,
      textLevel: 'simple',
      autoSave: true,
      notifications: true
    };
  }

  /**
   * Get resource statistics
   */
  async getResourceStats() {
    try {
      const resources = await this.getAllResources();
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      return {
        total: resources.length,
        thisMonth: resources.filter(r => new Date(r.createdAt) >= thisMonth).length,
        thisWeek: resources.filter(r => new Date(r.createdAt) >= thisWeek).length,
        byFormat: this.groupByFormat(resources),
        byAgeGroup: this.groupByAgeGroup(resources)
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return { total: 0, thisMonth: 0, thisWeek: 0, byFormat: {}, byAgeGroup: {} };
    }
  }

  /**
   * Group resources by format
   */
  groupByFormat(resources) {
    return resources.reduce((acc, resource) => {
      const format = resource.format || 'unknown';
      acc[format] = (acc[format] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Group resources by age group
   */
  groupByAgeGroup(resources) {
    return resources.reduce((acc, resource) => {
      const age = parseInt(resource.studentAge) || 0;
      let group = 'unknown';
      if (age >= 3 && age <= 6) group = 'early';
      else if (age >= 7 && age <= 11) group = 'primary';
      else if (age >= 12 && age <= 16) group = 'secondary';
      
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAllData() {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      await AsyncStorage.removeItem(this.SETTINGS_KEY);
      return { success: true };
    } catch (error) {
      console.error('Clear data error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;