/**
 * Enhanced Resource Service
 * Integrates AI chat history with resource library
 */

import { storageService } from './storageService';
import { conversationHistoryService } from './conversationHistoryService';
import { studentProfileService } from './studentProfileService';

class EnhancedResourceService {
  constructor() {
    this.RESOURCE_SOURCES = {
      AI_GENERATED: 'ai_generated',
      MANUAL_CREATED: 'manual_created',
      IMPORTED: 'imported',
      TEMPLATE: 'template'
    };
  }

  /**
   * Get all resources from multiple sources
   */
  async getAllResources() {
    try {
      // Get traditional stored resources (includes manually created ones)
      const storedResources = await storageService.getAllResources();
      
      // Get AI-generated resources from conversation history
      const aiResources = await this.getAIGeneratedResources();
      
      // Get template resources
      const templateResources = await this.getTemplateResources();
      
      // Combine and deduplicate
      const allResources = [
        ...storedResources,
        ...aiResources,
        ...templateResources
      ];

      // Remove duplicates based on ID
      const uniqueResources = allResources.filter((resource, index, self) => 
        index === self.findIndex(r => r.id === resource.id)
      );

      // Sort by creation date (newest first)
      return uniqueResources.sort((a, b) => 
        new Date(b.createdAt || b.timestamp || '').getTime() - 
        new Date(a.createdAt || a.timestamp || '').getTime()
      );
    } catch (error) {
      console.error('Error getting all resources:', error);
      return [];
    }
  }

  /**
   * Get resources generated from AI conversations
   */
  async getAIGeneratedResources() {
    try {
      const studentsWithHistory = await conversationHistoryService.getStudentsWithHistory();
      const aiResources = [];

      for (const student of studentsWithHistory) {
        const conversations = await conversationHistoryService.getStudentHistory(student.studentId);
        
        // Get student profile for context
        let studentProfile = null;
        try {
          studentProfile = await studentProfileService.getProfileById(student.studentId);
        } catch (error) {
          console.log(`Could not load profile for ${student.studentId}`);
        }

        // Convert conversations to resources
        conversations.forEach(conversation => {
          if (conversation.aiResponse && conversation.aiResponse.length > 200) {
            aiResources.push({
              id: `ai_${conversation.id}`,
              title: this.generateResourceTitle(conversation.userMessage, conversation.metadata.topic),
              content: conversation.aiResponse,
              format: 'ai_response',
              aetTarget: conversation.userMessage,
              studentAge: studentProfile?.age || conversation.studentContext?.age || 'Unknown',
              studentName: studentProfile?.studentName || conversation.studentContext?.name || 'Unknown Student',
              studentId: student.studentId,
              createdAt: conversation.timestamp,
              source: this.RESOURCE_SOURCES.AI_GENERATED,
              topic: conversation.metadata.topic,
              hasModelInsights: conversation.metadata.hasModelInsights,
              provider: conversation.metadata.provider,
              metadata: {
                conversationId: conversation.id,
                originalQuestion: conversation.userMessage,
                studentContext: conversation.studentContext,
                isFromAI: true
              }
            });
          }
        });
      }

      return aiResources;
    } catch (error) {
      console.error('Error getting AI generated resources:', error);
      return [];
    }
  }

  /**
   * Get template resources (predefined helpful resources)
   */
  async getTemplateResources() {
    return [
      {
        id: 'template_focus_strategies',
        title: 'Focus & Attention Strategies Template',
        content: `# Focus & Attention Strategies for Autism

## Environmental Modifications:
• Minimize visual clutter and distractions
• Use consistent seating arrangements
• Provide quiet work spaces
• Reduce background noise
• Use natural lighting when possible

## Teaching Strategies:
• Break tasks into smaller, manageable steps
• Use visual schedules and timers
• Provide clear, one-step instructions
• Incorporate movement breaks every 15-20 minutes
• Use student's special interests to maintain engagement

## Attention-Building Activities:
• Start with 2-3 minute focused activities
• Use highly preferred activities initially
• Gradually increase duration as success builds
• Incorporate fidget tools and sensory supports`,
        format: 'template',
        aetTarget: 'Improve focus and attention skills',
        studentAge: 'All ages',
        createdAt: new Date().toISOString(),
        source: this.RESOURCE_SOURCES.TEMPLATE,
        topic: 'Focus & Attention',
        metadata: { isTemplate: true }
      },
      {
        id: 'template_meltdown_management',
        title: 'Meltdown Management Guide Template',
        content: `# Meltdown Management Guide

## Understanding Meltdowns:
Meltdowns are neurological responses to overwhelming situations, not behavioral choices.

## During a Meltdown:
### DO:
• Stay calm and patient
• Ensure safety first
• Reduce sensory input
• Give space and time
• Use simple, calm language

### DON'T:
• Try to reason or negotiate
• Touch without permission
• Raise your voice
• Give demands or instructions

## After the Meltdown:
• Allow recovery time
• Offer comfort and support
• Discuss what happened (when ready)
• Plan prevention strategies`,
        format: 'template',
        aetTarget: 'Manage meltdowns effectively',
        studentAge: 'All ages',
        createdAt: new Date().toISOString(),
        source: this.RESOURCE_SOURCES.TEMPLATE,
        topic: 'Meltdown Management',
        metadata: { isTemplate: true }
      }
    ];
  }

  /**
   * Generate a meaningful title from user question and topic
   */
  generateResourceTitle(userMessage, topic) {
    // Clean up the user message
    let title = userMessage.replace(/^(For student .* \(\d+ years old\): )/i, '');
    title = title.replace(/^(Teacher question: )/i, '');
    
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    // Add topic prefix if not already included
    if (!title.toLowerCase().includes(topic.toLowerCase().split(' ')[0])) {
      title = `${topic}: ${title}`;
    }
    
    // Limit length
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }
    
    return title;
  }

  /**
   * Save AI response as a formal resource
   */
  async saveAIResponseAsResource(conversation, studentId, customTitle = null) {
    try {
      const studentProfile = await studentProfileService.getProfileById(studentId);
      
      const resource = {
        title: customTitle || this.generateResourceTitle(conversation.userMessage, conversation.metadata.topic),
        content: conversation.aiResponse,
        format: 'ai_generated',
        aetTarget: conversation.userMessage,
        studentAge: studentProfile?.age || conversation.studentContext?.age || 'Unknown',
        studentName: studentProfile?.studentName || conversation.studentContext?.name || 'Unknown Student',
        studentId: studentId,
        source: this.RESOURCE_SOURCES.AI_GENERATED,
        topic: conversation.metadata.topic,
        hasModelInsights: conversation.metadata.hasModelInsights,
        provider: conversation.metadata.provider,
        metadata: {
          conversationId: conversation.id,
          originalQuestion: conversation.userMessage,
          studentContext: conversation.studentContext,
          savedFromAI: true,
          savedAt: new Date().toISOString()
        }
      };

      const result = await storageService.saveResource(resource);
      return result;
    } catch (error) {
      console.error('Error saving AI response as resource:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get resources by student
   */
  async getResourcesByStudent(studentId) {
    try {
      const allResources = await this.getAllResources();
      return allResources.filter(resource => 
        resource.studentId === studentId || 
        resource.metadata?.studentContext?.id === studentId
      );
    } catch (error) {
      console.error('Error getting resources by student:', error);
      return [];
    }
  }

  /**
   * Get resources by topic
   */
  async getResourcesByTopic(topic) {
    try {
      const allResources = await this.getAllResources();
      return allResources.filter(resource => 
        resource.topic === topic ||
        resource.metadata?.topic === topic ||
        resource.aetTarget?.toLowerCase().includes(topic.toLowerCase())
      );
    } catch (error) {
      console.error('Error getting resources by topic:', error);
      return [];
    }
  }

  /**
   * Create a manual resource
   */
  async createManualResource(resourceData) {
    try {
      const resource = {
        ...resourceData,
        id: resourceData.id || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source: this.RESOURCE_SOURCES.MANUAL_CREATED,
        createdAt: resourceData.createdAt || new Date().toISOString(),
        timestamp: resourceData.timestamp || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        metadata: {
          ...resourceData.metadata,
          createdManually: true,
          createdBy: 'teacher',
          version: '1.0'
        }
      };

      const result = await storageService.saveResource(resource);
      return result;
    } catch (error) {
      console.error('Error creating manual resource:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get resource statistics
   */
  async getResourceStats() {
    try {
      const allResources = await this.getAllResources();
      
      const stats = {
        total: allResources.length,
        bySource: {},
        byTopic: {},
        byStudent: {},
        aiGenerated: 0,
        manualCreated: 0,
        templates: 0,
        withModelInsights: 0
      };

      allResources.forEach(resource => {
        // By source
        const source = resource.source || 'unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;

        // By topic
        const topic = resource.topic || 'General';
        stats.byTopic[topic] = (stats.byTopic[topic] || 0) + 1;

        // By student
        if (resource.studentId) {
          const studentName = resource.studentName || resource.studentId;
          stats.byStudent[studentName] = (stats.byStudent[studentName] || 0) + 1;
        }

        // Count types
        if (resource.source === this.RESOURCE_SOURCES.AI_GENERATED) {
          stats.aiGenerated++;
        } else if (resource.source === this.RESOURCE_SOURCES.MANUAL_CREATED) {
          stats.manualCreated++;
        } else if (resource.source === this.RESOURCE_SOURCES.TEMPLATE) {
          stats.templates++;
        }

        // Count AI insights
        if (resource.hasModelInsights) {
          stats.withModelInsights++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting resource stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const enhancedResourceService = new EnhancedResourceService();
export default enhancedResourceService;