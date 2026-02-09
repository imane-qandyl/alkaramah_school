/**
 * Enhanced AsyncStorage Database Service for Teach Smart App
 * Completely free local database solution with advanced features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class EnhancedStorageService {
  constructor() {
    this.RESOURCES_KEY = 'teach_smart_resources';
    this.USERS_KEY = 'teach_smart_users';
    this.SETTINGS_KEY = 'teach_smart_settings';
    this.STATS_KEY = 'teach_smart_stats';
    this.currentUserId = 'default-user';
  }

  /**
   * Initialize database (no-op for AsyncStorage, but keeps API consistent)
   */
  async initialize() {
    return { success: true };
  }

  /**
   * Set current user ID
   */
  setUserId(userId) {
    this.currentUserId = userId;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Save a resource with enhanced metadata
   */
  async saveResource(resourceData) {
    try {
      const existingResources = await this.getAllResources();
      const newResource = {
        id: this.generateId(),
        ...resourceData,
        userId: this.currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        downloadCount: 0,
        isPublic: false,
        tags: resourceData.tags || [],
        // Add search-friendly fields
        searchText: `${resourceData.title} ${resourceData.aetTarget} ${resourceData.content}`.toLowerCase()
      };
      
      const updatedResources = [newResource, ...existingResources];
      await AsyncStorage.setItem(this.RESOURCES_KEY, JSON.stringify(updatedResources));
      
      // Update user stats
      await this.updateUserStats();
      
      return { success: true, resource: newResource };
    } catch (error) {
      console.error('Save resource error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all resources for current user with sorting
   */
  async getAllResources(sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const resourcesJson = await AsyncStorage.getItem(this.RESOURCES_KEY);
      const allResources = resourcesJson ? JSON.parse(resourcesJson) : [];
      
      // Filter by current user
      const userResources = allResources.filter(resource => 
        resource.userId === this.currentUserId
      );
      
      // Sort resources
      return this.sortResources(userResources, sortBy, sortOrder);
    } catch (error) {
      console.error('Get resources error:', error);
      return [];
    }
  }

  /**
   * Sort resources by various criteria
   */
  sortResources(resources, sortBy, sortOrder) {
    return resources.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'studentAge':
          aValue = parseInt(a.studentAge) || 0;
          bValue = parseInt(b.studentAge) || 0;
          break;
        case 'format':
          aValue = a.format || '';
          bValue = b.format || '';
          break;
        case 'lastAccessed':
          aValue = new Date(a.lastAccessed || a.createdAt);
          bValue = new Date(b.lastAccessed || b.createdAt);
          break;
        default: // createdAt
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  /**
   * Get resource by ID
   */
  async getResourceById(id) {
    try {
      const resources = await this.getAllResources();
      const resource = resources.find(resource => resource.id === id);
      
      if (resource) {
        // Update last accessed time
        await this.updateResource(id, { lastAccessed: new Date().toISOString() });
      }
      
      return resource || null;
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
      const resourcesJson = await AsyncStorage.getItem(this.RESOURCES_KEY);
      const allResources = resourcesJson ? JSON.parse(resourcesJson) : [];
      
      const resourceIndex = allResources.findIndex(resource => 
        resource.id === id && resource.userId === this.currentUserId
      );
      
      if (resourceIndex === -1) {
        return { success: false, error: 'Resource not found' };
      }
      
      allResources[resourceIndex] = {
        ...allResources[resourceIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
        // Update search text if content changed
        searchText: updates.title || updates.aetTarget || updates.content ? 
          `${updates.title || allResources[resourceIndex].title} ${updates.aetTarget || allResources[resourceIndex].aetTarget} ${updates.content || allResources[resourceIndex].content}`.toLowerCase() :
          allResources[resourceIndex].searchText
      };
      
      await AsyncStorage.setItem(this.RESOURCES_KEY, JSON.stringify(allResources));
      return { success: true, resource: allResources[resourceIndex] };
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
      const resourcesJson = await AsyncStorage.getItem(this.RESOURCES_KEY);
      const allResources = resourcesJson ? JSON.parse(resourcesJson) : [];
      
      const filteredResources = allResources.filter(resource => 
        !(resource.id === id && resource.userId === this.currentUserId)
      );
      
      if (filteredResources.length === allResources.length) {
        return { success: false, error: 'Resource not found' };
      }
      
      await AsyncStorage.setItem(this.RESOURCES_KEY, JSON.stringify(filteredResources));
      await this.updateUserStats();
      
      return { success: true };
    } catch (error) {
      console.error('Delete resource error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Advanced search with multiple criteria
   */
  async searchResources(query, filters = {}) {
    try {
      const resources = await this.getAllResources();
      const lowercaseQuery = query.toLowerCase();
      
      return resources.filter(resource => {
        // Text search
        const matchesSearch = !query || resource.searchText.includes(lowercaseQuery);
        
        // Format filter
        const matchesFormat = !filters.format || resource.format === filters.format;
        
        // Ability level filter
        const matchesAbility = !filters.abilityLevel || resource.abilityLevel === filters.abilityLevel;
        
        // Age group filter
        const matchesAge = !filters.ageGroup || this.matchesAgeGroup(resource.studentAge, filters.ageGroup);
        
        // Date range filter
        const matchesDate = !filters.dateRange || this.matchesDateRange(resource.createdAt, filters.dateRange);
        
        return matchesSearch && matchesFormat && matchesAbility && matchesAge && matchesDate;
      });
    } catch (error) {
      console.error('Search resources error:', error);
      return [];
    }
  }

  /**
   * Filter resources by criteria
   */
  async filterResources(filters) {
    return this.searchResources('', filters);
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
   * Check if date matches date range filter
   */
  matchesDateRange(dateString, dateRange) {
    const date = new Date(dateString);
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return date >= monthAgo;
      default:
        return true;
    }
  }

  /**
   * Get user settings with defaults
   */
  async getSettings() {
    try {
      const settingsJson = await AsyncStorage.getItem(`${this.SETTINGS_KEY}_${this.currentUserId}`);
      const settings = settingsJson ? JSON.parse(settingsJson) : {};
      
      return {
        ...this.getDefaultSettings(),
        ...settings
      };
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
      const currentSettings = await this.getSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(
        `${this.SETTINGS_KEY}_${this.currentUserId}`, 
        JSON.stringify(updatedSettings)
      );
      
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
      notifications: true,
      theme: 'light',
      language: 'en'
    };
  }

  /**
   * Get comprehensive resource statistics
   */
  async getResourceStats() {
    try {
      const resources = await this.getAllResources();
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Basic counts
      const total = resources.length;
      const thisMonthCount = resources.filter(r => new Date(r.createdAt) >= thisMonth).length;
      const thisWeekCount = resources.filter(r => new Date(r.createdAt) >= thisWeek).length;
      
      // Group by format
      const byFormat = resources.reduce((acc, resource) => {
        const format = resource.format || 'unknown';
        acc[format] = (acc[format] || 0) + 1;
        return acc;
      }, {});
      
      // Group by age group
      const byAgeGroup = resources.reduce((acc, resource) => {
        const age = parseInt(resource.studentAge) || 0;
        let group = 'unknown';
        if (age >= 3 && age <= 6) group = 'early';
        else if (age >= 7 && age <= 11) group = 'primary';
        else if (age >= 12 && age <= 16) group = 'secondary';
        
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {});
      
      // Group by ability level
      const byAbilityLevel = resources.reduce((acc, resource) => {
        const level = resource.abilityLevel || 'unknown';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});
      
      return {
        total,
        thisMonth: thisMonthCount,
        thisWeek: thisWeekCount,
        byFormat,
        byAgeGroup,
        byAbilityLevel
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return { 
        total: 0, 
        thisMonth: 0, 
        thisWeek: 0, 
        byFormat: {}, 
        byAgeGroup: {}, 
        byAbilityLevel: {}
      };
    }
  }

  /**
   * Update user statistics
   */
  async updateUserStats() {
    try {
      const resources = await this.getAllResources();
      const uniqueStudents = new Set();
      
      resources.forEach(resource => {
        if (resource.studentAge) {
          uniqueStudents.add(`${resource.studentAge}-${resource.abilityLevel}`);
        }
      });
      
      const stats = {
        totalResources: resources.length,
        totalStudentsHelped: uniqueStudents.size,
        totalTimesSaved: Math.round(resources.length * 0.5), // 30 minutes per resource
        lastActiveDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`${this.STATS_KEY}_${this.currentUserId}`, JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('Update user stats error:', error);
      return null;
    }
  }

  /**
   * Clear all data and reload real dataset
   */
  async clearAllData() {
    try {
      await enhancedStorageService.clearAllData();
      return { success: true };
    } catch (error) {
      console.error('Clear data error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const enhancedStorageService = new EnhancedStorageService();
export default enhancedStorageService;