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

  /**
   * Debug function to check storage status
   */
  async debugStorageStatus() {
    try {
      console.log('🔍 DEBUG: Checking conversation history storage...');
      
      const allHistory = await AsyncStorage.getItem(this.storageKey);
      if (!allHistory) {
        console.log('📝 No conversation history found in storage');
        return { totalStudents: 0, totalConversations: 0, students: [] };
      }

      const historyData = JSON.parse(allHistory);
      const students = Object.keys(historyData);
      const totalConversations = students.reduce((total, studentId) => {
        return total + historyData[studentId].length;
      }, 0);

      console.log(`📊 Storage Status:`);
      console.log(`   - Total students with history: ${students.length}`);
      console.log(`   - Total conversations: ${totalConversations}`);
      
      students.forEach(studentId => {
        const count = historyData[studentId].length;
        const lastConv = historyData[studentId][count - 1];
        console.log(`   - ${studentId}: ${count} conversations (last: ${lastConv?.timestamp})`);
      });

      return {
        totalStudents: students.length,
        totalConversations,
        students: students.map(studentId => ({
          studentId,
          count: historyData[studentId].length,
          lastConversation: historyData[studentId][historyData[studentId].length - 1]?.timestamp
        }))
      };
    } catch (error) {
      console.error('❌ Error checking storage status:', error);
      return null;
    }
  }

  /**
   * Force save a test conversation (for debugging)
   */
  async saveTestConversation(studentId, studentName = 'Test Student') {
    try {
      console.log(`🧪 Saving test conversation for ${studentId}`);
      
      const testConversation = {
        userMessage: 'Test question about focus',
        aiResponse: 'Test AI response with detailed focus strategies...',
        studentContext: {
          id: studentId,
          name: studentName,
          age: 8
        },
        metadata: {
          provider: 'Test',
          timestamp: new Date().toISOString(),
          studentName: studentName,
          studentAge: 8
        }
      };

      const result = await this.saveConversation(studentId, testConversation);
      if (result) {
        console.log(`✅ Test conversation saved successfully for ${studentId}`);
        return true;
      } else {
        console.log(`❌ Test conversation failed to save for ${studentId}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error saving test conversation for ${studentId}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const conversationHistoryService = new ConversationHistoryService();
export default conversationHistoryService;