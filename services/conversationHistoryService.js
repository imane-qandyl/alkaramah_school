/**
 * Conversation History Service
 * Manages AI chat history for each student
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class ConversationHistoryService {
  constructor() {
    this.storageKey = 'student_conversation_history';
  }

  /**
   * Save a conversation entry for a student
   */
  async saveConversation(studentId, conversation) {
    try {
      console.log(`🔄 Attempting to save conversation for student: ${studentId}`);
      
      const history = await this.getStudentHistory(studentId);
      console.log(`📚 Current history length for ${studentId}: ${history.length}`);
      
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userMessage: conversation.userMessage,
        aiResponse: conversation.aiResponse,
        studentContext: conversation.studentContext,
        metadata: {
          responseLength: conversation.aiResponse.length,
          hasModelInsights: conversation.aiResponse.includes('AI Model Insights'),
          topic: this.extractTopic(conversation.userMessage),
          provider: conversation.metadata?.provider || 'Unknown',
          studentName: conversation.metadata?.studentName || 'Unknown',
          studentAge: conversation.metadata?.studentAge || null,
          ...conversation.metadata
        }
      };

      history.push(newEntry);
      
      // Keep only last 50 conversations per student to manage storage
      if (history.length > 50) {
        const removed = history.splice(0, history.length - 50);
        console.log(`🗑️ Removed ${removed.length} old conversations for ${studentId}`);
      }

      await this.saveStudentHistory(studentId, history);
      console.log(`✅ Successfully saved conversation for ${studentId}. New total: ${history.length}`);
      
      // Verify the save worked
      const verifyHistory = await this.getStudentHistory(studentId);
      if (verifyHistory.length === history.length) {
        console.log(`✅ Save verification successful for ${studentId}`);
      } else {
        console.error(`❌ Save verification failed for ${studentId}. Expected: ${history.length}, Got: ${verifyHistory.length}`);
      }
      
      return newEntry;
    } catch (error) {
      console.error(`❌ Error saving conversation for ${studentId}:`, error);
      return null;
    }
  }

  /**
   * Get conversation history for a student
   */
  async getStudentHistory(studentId) {
    try {
      const allHistory = await AsyncStorage.getItem(this.storageKey);
      const historyData = allHistory ? JSON.parse(allHistory) : {};
      return historyData[studentId] || [];
    } catch (error) {
      console.error('Error getting student history:', error);
      return [];
    }
  }

  /**
   * Save conversation history for a student
   */
  async saveStudentHistory(studentId, history) {
    try {
      const allHistory = await AsyncStorage.getItem(this.storageKey);
      const historyData = allHistory ? JSON.parse(allHistory) : {};
      historyData[studentId] = history;
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(historyData));
    } catch (error) {
      console.error('Error saving student history:', error);
    }
  }

  /**
   * Get recent conversations for a student (last N conversations)
   */
  async getRecentConversations(studentId, limit = 10) {
    try {
      const history = await this.getStudentHistory(studentId);
      return history.slice(-limit).reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting recent conversations:', error);
      return [];
    }
  }

  /**
   * Search conversations for a student by topic or keyword
   */
  async searchConversations(studentId, searchTerm) {
    try {
      const history = await this.getStudentHistory(studentId);
      const searchLower = searchTerm.toLowerCase();
      
      return history.filter(conversation => 
        conversation.userMessage.toLowerCase().includes(searchLower) ||
        conversation.aiResponse.toLowerCase().includes(searchLower) ||
        conversation.metadata.topic.toLowerCase().includes(searchLower)
      ).reverse(); // Most recent first
    } catch (error) {
      console.error('Error searching conversations:', error);
      return [];
    }
  }

  /**
   * Get conversation statistics for a student
   */
  async getStudentStats(studentId) {
    try {
      const history = await this.getStudentHistory(studentId);
      
      const topics = {};
      let totalConversations = history.length;
      let conversationsWithInsights = 0;
      
      history.forEach(conversation => {
        // Count topics
        const topic = conversation.metadata.topic;
        topics[topic] = (topics[topic] || 0) + 1;
        
        // Count conversations with AI insights
        if (conversation.metadata.hasModelInsights) {
          conversationsWithInsights++;
        }
      });

      return {
        totalConversations,
        conversationsWithInsights,
        topTopics: Object.entries(topics)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([topic, count]) => ({ topic, count })),
        firstConversation: history[0]?.timestamp,
        lastConversation: history[history.length - 1]?.timestamp
      };
    } catch (error) {
      console.error('Error getting student stats:', error);
      return null;
    }
  }

  /**
   * Extract topic from user message
   */
  extractTopic(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('focus') || messageLower.includes('attention')) {
      return 'Focus & Attention';
    } else if (messageLower.includes('meltdown') || messageLower.includes('tantrum')) {
      return 'Meltdown Management';
    } else if (messageLower.includes('social') || messageLower.includes('friend')) {
      return 'Social Skills';
    } else if (messageLower.includes('communication') || messageLower.includes('speak')) {
      return 'Communication';
    } else if (messageLower.includes('behavior') || messageLower.includes('management')) {
      return 'Behavior Management';
    } else if (messageLower.includes('sensory')) {
      return 'Sensory Support';
    } else if (messageLower.includes('transition')) {
      return 'Transitions';
    } else if (messageLower.includes('lesson') || messageLower.includes('plan')) {
      return 'Lesson Planning';
    } else {
      return 'General Support';
    }
  }

  /**
   * Export conversation history for a student (for sharing with other teachers)
   */
  async exportStudentHistory(studentId, studentName) {
    try {
      const history = await this.getStudentHistory(studentId);
      const stats = await this.getStudentStats(studentId);
      
      const exportData = {
        studentId,
        studentName,
        exportDate: new Date().toISOString(),
        statistics: stats,
        conversations: history.map(conv => ({
          date: new Date(conv.timestamp).toLocaleDateString(),
          time: new Date(conv.timestamp).toLocaleTimeString(),
          question: conv.userMessage,
          response: conv.aiResponse,
          topic: conv.metadata.topic,
          hasAIInsights: conv.metadata.hasModelInsights
        }))
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting student history:', error);
      return null;
    }
  }

  /**
   * Delete a specific conversation for a student
   */
  async deleteConversation(studentId, conversationId) {
    try {
      console.log(`🗑️ Attempting to delete conversation ${conversationId} for student ${studentId}`);
      const history = await this.getStudentHistory(studentId);
      console.log(`📚 Student has ${history.length} conversations before deletion`);
      
      // Convert conversationId to number if it's a string
      const targetId = typeof conversationId === 'string' ? parseInt(conversationId) : conversationId;
      
      const filteredHistory = history.filter(conv => {
        const convId = typeof conv.id === 'string' ? parseInt(conv.id) : conv.id;
        return convId !== targetId;
      });
      
      console.log(`📚 Student will have ${filteredHistory.length} conversations after deletion`);
      
      if (filteredHistory.length === history.length) {
        console.log(`❌ Conversation ${conversationId} not found in student ${studentId} history`);
        return { success: false, error: 'Conversation not found' };
      }
      
      await this.saveStudentHistory(studentId, filteredHistory);
      console.log(`✅ Successfully deleted conversation ${conversationId} for student ${studentId}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear conversation history for a student
   */
  async clearStudentHistory(studentId) {
    try {
      const allHistory = await AsyncStorage.getItem(this.storageKey);
      const historyData = allHistory ? JSON.parse(allHistory) : {};
      delete historyData[studentId];
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(historyData));
      return true;
    } catch (error) {
      console.error('Error clearing student history:', error);
      return false;
    }
  }

  /**
   * Get all students with conversation history
   */
  async getStudentsWithHistory() {
    try {
      const allHistory = await AsyncStorage.getItem(this.storageKey);
      const historyData = allHistory ? JSON.parse(allHistory) : {};
      
      return Object.keys(historyData).map(studentId => ({
        studentId,
        conversationCount: historyData[studentId].length,
        lastConversation: historyData[studentId][historyData[studentId].length - 1]?.timestamp
      }));
    } catch (error) {
      console.error('Error getting students with history:', error);
      return [];
    }
  }

}

// Export singleton instance
export const conversationHistoryService = new ConversationHistoryService();
export default conversationHistoryService;