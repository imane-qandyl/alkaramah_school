/**
 * Trained Chatbot Service
 * Integrates with the local Python server running the trained teach_smart_chatbot.pkl model
 */

import Constants from 'expo-constants';

class TrainedChatbotService {
  constructor() {
    // Local Python server configuration
    // Use localhost for local development
    this.serverUrl = 'http://localhost:5001';
    this.isAvailable = false;
    this.hasLoggedUnavailable = false; // Prevent spam logging
    this.checkServerAvailability();
  }

  /**
   * Check if the Python server is running
   */
  async checkServerAvailability() {
    try {
      const response = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        timeout: 2000 // Reduced timeout for faster fallback
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isAvailable = data.chatbot_loaded;
        if (this.isAvailable) {
          console.log('✅ Trained chatbot server is available');
        }
      }
    } catch (error) {
      this.isAvailable = false;
      // Only log once to avoid spam
      if (!this.hasLoggedUnavailable) {
        console.log('ℹ️  Trained chatbot server not available (this is normal if not running)');
        this.hasLoggedUnavailable = true;
      }
    }
  }

  /**
   * Generate educational resource using trained model
   */
  async generateResource(params) {
    try {
      // Check server availability first
      await this.checkServerAvailability();
      
      if (!this.isAvailable) {
        // Return a more informative error for graceful fallback
        return {
          success: false,
          error: 'Trained chatbot server is not available',
          fallbackReason: 'Server not running or not accessible',
          suggestion: 'Start the Python server with: python python-server/chatbot_server.py'
        };
      }

      const response = await fetch(`${this.serverUrl}/generate-resource`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_age: params.studentAge,
          aet_target: params.aetTarget,
          context: params.learningContext,
          ability_level: params.abilityLevel,
          format: params.format,
          visual_support: params.visualSupport,
          text_level: params.textLevel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Server error',
          fallbackReason: 'Server returned error response'
        };
      }

      const result = await response.json();
      
      return {
        success: true,
        content: result.content,
        metadata: {
          ...result.metadata,
          provider: 'Trained Chatbot Model'
        }
      };

    } catch (error) {
      console.log('Trained chatbot service unavailable:', error.message);
      return {
        success: false,
        error: error.message,
        fallbackReason: 'Network or server connection error',
        suggestion: 'Check if Python server is running on localhost:5001'
      };
    }
  }

  /**
   * Test connection to trained chatbot
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.serverUrl}/test-connection`, {
        method: 'GET',
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error('Server connection failed');
      }

      const result = await response.json();
      
      return {
        success: result.success,
        message: result.message || 'Connection successful',
        model: result.model || 'Trained Model',
        provider: 'Local Trained Chatbot'
      };

    } catch (error) {
      return {
        success: false,
        error: `Connection failed: ${error.message}`,
        suggestion: 'Make sure the Python server is running on localhost:5000'
      };
    }
  }

  /**
   * Get AET targets from trained model
   */
  async getAETTargets() {
    try {
      if (!this.isAvailable) {
        await this.checkServerAvailability();
      }

      if (!this.isAvailable) {
        throw new Error('Trained chatbot server is not available');
      }

      const response = await fetch(`${this.serverUrl}/get-aet-targets`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to get AET targets');
      }

      const result = await response.json();
      return result.targets;

    } catch (error) {
      console.error('Error getting AET targets from trained model:', error);
      // Return default targets as fallback
      return {
        communication: [
          "Can identify and name basic emotions in self and others",
          "Uses appropriate greetings with familiar adults",
          "Follows simple two-step instructions"
        ],
        social: [
          "Demonstrates turn-taking in group activities",
          "Shares materials with peers when prompted",
          "Participates in simple group games"
        ],
        independence: [
          "Completes self-care tasks with minimal support",
          "Follows visual schedule for daily routines",
          "Makes simple choices when offered options"
        ]
      };
    }
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      available: this.isAvailable,
      serverUrl: this.serverUrl,
      provider: 'Trained Chatbot Model'
    };
  }
}

// Export singleton instance
export const trainedChatbotService = new TrainedChatbotService();
export default trainedChatbotService;