/**
 * AI Service for Educational Resource Generation
 * Supports both Azure OpenAI and trained local chatbot model
 */

import OpenAI from 'openai';
import Constants from 'expo-constants';
import { trainedChatbotService } from './trainedChatbotService';
import { azureConfig } from '../config/azure';

class AIResourceGenerator {
  constructor() {
    // Azure OpenAI Configuration - Use secure configuration
    const config = Constants.expoConfig?.extra?.azureOpenAI || {};
    
    this.endpoint = config.endpoint || azureConfig.endpoint;
    this.apiKey = null; // Will be loaded asynchronously
    this.apiVersion = config.apiVersion || azureConfig.apiVersion;
    this.deploymentName = config.deploymentName || azureConfig.deploymentName;
    
    // Initialize Azure OpenAI client
    this.client = null;
    this.initializeClient();
  }

  /**
   * Initialize Azure OpenAI client
   */
  async initializeClient() {
    try {
      // Load API key securely
      this.apiKey = await azureConfig.getApiKey();
      
      if (this.apiKey) {
        // Azure OpenAI endpoint format for OpenAI SDK
        this.client = new OpenAI({
          apiKey: this.apiKey,
          baseURL: `${this.endpoint}openai/deployments/${this.deploymentName}`,
          defaultQuery: { 'api-version': this.apiVersion },
          defaultHeaders: {
            'api-key': this.apiKey,
          },
        });
        console.log('Azure OpenAI client initialized successfully');
      } else {
        console.warn('Azure OpenAI API key not provided, using mock responses');
      }
    } catch (error) {
      console.error('Failed to initialize Azure OpenAI client:', error);
    }
  }

  /**
   * Generate educational resource based on input parameters
   * Tries trained chatbot first, then Azure OpenAI as fallback
   */
  async generateResource(params) {
    const { studentAge, abilityLevel, aetTarget, learningContext, format, visualSupport, textLevel } = params;

    try {
      // First, try the trained chatbot model
      console.log('🤖 Attempting to use trained chatbot model...');
      const trainedResult = await trainedChatbotService.generateResource(params);
      console.log('🔍 Trained chatbot result:', trainedResult.success ? 'SUCCESS' : 'FAILED');
      
      if (trainedResult.success) {
        console.log('✅ Generated resource using trained chatbot model');
        return trainedResult;
      } else {
        console.log('ℹ️  Trained chatbot unavailable:', trainedResult.fallbackReason);
        if (trainedResult.suggestion) {
          console.log('💡 Suggestion:', trainedResult.suggestion);
        }
      }

      // Ensure Azure OpenAI client is initialized
      if (!this.client && !this.apiKey) {
        await this.initializeClient();
      }

      // Fallback to Azure OpenAI if available
      if (this.client && this.apiKey) {
        console.log('🔄 Falling back to Azure OpenAI...');
        const response = await this.callAzureOpenAI(params);
        
        return {
          success: true,
          content: response.content,
          metadata: {
            generatedAt: new Date().toISOString(),
            targetAge: studentAge,
            abilityLevel,
            format,
            aetTarget,
            provider: 'Azure OpenAI'
          }
        };
      } else {
        // No AI services available
        return {
          success: false,
          error: 'AI services are currently unavailable. Please ensure your trained model server is running or configure Azure OpenAI.',
          fallbackReason: 'No AI services configured',
          suggestion: 'Start the Python server: cd python-server && ./start_server.sh',
          content: null
        };
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      
      return {
        success: false,
        error: 'Failed to generate resource. Please check your AI service connections and try again.',
        details: error.message,
        content: null
      };
    }
  }

  /**
   * Call Azure OpenAI API
   */
  async callAzureOpenAI(params) {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildUserPrompt(params);

    try {
      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from Azure OpenAI');
      }

      return {
        content: this.customizeContent(content, params)
      };
    } catch (error) {
      console.error('Azure OpenAI API Error:', error);
      throw error;
    }
  }

  /**
   * Build user prompt based on parameters and autism support profile
   */
  buildUserPrompt(params) {
    const { studentAge, abilityLevel, aetTarget, learningContext, format, visualSupport, textLevel, autismProfile, studentContext } = params;
    
    let basePrompt = `Create an autism-friendly educational resource with the following specifications:

**Student Profile:**
- Age: ${studentAge} years old
- Ability Level: ${abilityLevel}
- Learning Context: ${learningContext}

**Learning Objective:**
${aetTarget}

**Resource Requirements:**
- Format: ${format}
- Text Level: ${textLevel}
- Visual Support: ${visualSupport ? 'Include visual supports and symbols' : 'Text-based primarily'}`;

    // Enhance prompt with student context if available
    if (studentContext) {
      basePrompt += `

**SPECIFIC STUDENT PROFILE:**
- Student Name: ${studentContext.name || 'Student'}
- Age: ${studentContext.age || studentAge} years old

**SUPPORT LEVELS:**
${Object.entries(studentContext.supportLevels || {}).map(([domain, level]) => `- ${domain}: ${level}`).join('\n')}

**LEARNING PROFILE:**
- Attention Span: ${studentContext.learningProfile?.attentionSpan || 'moderate'}
- Processing Speed: ${studentContext.learningProfile?.processingSpeed || 'moderate'}
- Learning Modalities: ${studentContext.learningProfile?.learningModalities?.join(', ') || 'mixed'}

**COMMUNICATION PROFILE:**
- Verbal Skills: ${studentContext.communicationProfile?.verbalSkills || 'medium'}
- Preferred Modes: ${studentContext.communicationProfile?.preferredModes?.join(', ') || 'mixed'}

**SOCIAL PROFILE:**
- Group Preference: ${studentContext.socialProfile?.groupPreference || 'flexible'}
- Peer Interaction: ${studentContext.socialProfile?.peerInteraction || 'medium'}

**EDUCATIONAL RECOMMENDATIONS:**
${studentContext.educationalRecommendations?.instructionalStrategies?.map(strategy => `- ${strategy}`).join('\n') || '- Use individualized approach'}
${studentContext.educationalRecommendations?.environmentalModifications?.map(mod => `- ${mod}`).join('\n') || ''}`;
    }

    // Enhance prompt with autism support profile if available
    if (autismProfile) {
      basePrompt += `

**AUTISM SUPPORT PROFILE:**
- Support Level: ${autismProfile.supportLevel || 'medium'}
- Communication Style: ${autismProfile.communicationStyle || 'mixed'}
- Sensory Considerations: ${autismProfile.sensoryConsiderations?.join(', ') || 'standard'}
- Attention Span: ${autismProfile.attentionSpan || 'moderate'}
- Social Preference: ${autismProfile.socialPreference || 'flexible'}

**SPECIFIC ADAPTATIONS NEEDED:**
${autismProfile.adaptations?.map(adaptation => `- ${adaptation}`).join('\n') || '- Use clear, structured format'}

**TEACHING STRATEGIES TO INCORPORATE:**
${autismProfile.teachingStrategies?.map(strategy => `- ${strategy}`).join('\n') || '- Provide step-by-step instructions'}`;
    }

    basePrompt += `

**Special Instructions:**
- Use clear, simple language appropriate for autism spectrum learners
- Include structured activities with step-by-step instructions
- Provide success criteria and assessment guidance
- Add teacher notes for implementation
- Ensure low cognitive load and predictable format
- Include differentiation options for varying ability levels
- Consider sensory processing needs and provide alternatives
- Build in processing time and movement breaks as needed

Please create a comprehensive, classroom-ready resource that teachers can use immediately.`;

    return basePrompt;
  }

  /**
   * System prompt for Azure OpenAI to ensure autism-friendly, AET-aligned content
   */
  getSystemPrompt() {
    return `You are an expert special education teacher and autism specialist creating educational resources for students with autism spectrum conditions. Your expertise includes:

- Autism Education Trust (AET) frameworks and targets
- Autism-friendly teaching strategies and materials
- Sensory considerations and processing differences
- Visual supports and structured learning approaches
- Differentiation for varying ability levels

CRITICAL REQUIREMENTS:
1. Create resources specifically designed for autism spectrum learners
2. Use clear, concrete language and avoid abstract concepts
3. Provide structured, predictable formats with consistent layouts
4. Include visual supports, symbols, and clear headings
5. Ensure activities have clear start and end points
6. Provide processing time and sensory considerations
7. Include success criteria that are observable and measurable
8. Add teacher guidance for implementation and adaptation
9. Consider executive function support (organization, sequencing)
10. Ensure content is aligned to AET targets and outcomes

OUTPUT FORMAT:
- Use markdown formatting with clear headings
- Include teacher instructions and implementation notes
- Provide success criteria and assessment suggestions
- Add extension activities for different ability levels
- Include sensory and processing considerations
- Ensure content is immediately usable in classroom settings

AUTISM-FRIENDLY PRINCIPLES:
- Predictable structure and routine
- Clear visual hierarchy and organization
- Concrete, literal language
- Step-by-step instructions
- Visual supports and symbols
- Sensory considerations
- Processing time allowances
- Choice-making opportunities
- Positive reinforcement strategies
- Clear expectations and boundaries`;
  }

  /**
   * Generate AET target suggestions based on category
   */
  async getAETTargets(category) {
    const targets = {
      communication: [
        "Can identify and name basic emotions in self and others",
        "Uses appropriate greetings with familiar adults",
        "Follows simple two-step instructions",
        "Requests help when needed using words or gestures",
        "Responds to their name when called",
        "Uses 'please' and 'thank you' appropriately"
      ],
      social: [
        "Demonstrates turn-taking in group activities",
        "Shares materials with peers when prompted",
        "Participates in simple group games",
        "Shows awareness of others' feelings",
        "Follows classroom rules and routines",
        "Engages in parallel play with peers"
      ],
      independence: [
        "Completes self-care tasks with minimal support",
        "Follows visual schedule for daily routines",
        "Organizes personal belongings",
        "Makes simple choices when offered options",
        "Asks for help when needed",
        "Transitions between activities with support"
      ],
      sensory: [
        "Uses appropriate sensory regulation strategies",
        "Identifies personal sensory preferences",
        "Communicates sensory needs effectively",
        "Participates in sensory activities",
        "Uses sensory tools appropriately",
        "Manages sensory overload with support"
      ]
    };

    return targets[category] || [];
  }

  /**
   * Test all available AI services
   */
  async testAllConnections() {
    const results = {
      trainedChatbot: null,
      azureOpenAI: null,
      mock: { success: true, message: 'Mock service always available' }
    };

    // Test trained chatbot
    try {
      console.log('Testing trained chatbot connection...');
      results.trainedChatbot = await trainedChatbotService.testConnection();
    } catch (error) {
      results.trainedChatbot = {
        success: false,
        error: error.message,
        suggestion: 'Start the Python server: cd python-server && ./start_server.sh'
      };
    }

    // Test Azure OpenAI
    try {
      console.log('Testing Azure OpenAI connection...');
      results.azureOpenAI = await this.testConnection();
    } catch (error) {
      results.azureOpenAI = {
        success: false,
        error: error.message
      };
    }

    return results;
  }

  /**
   * Get current configuration status
   */
  getConfiguration() {
    const trainedStatus = trainedChatbotService.getStatus();
    
    return {
      azureOpenAI: {
        hasApiKey: !!this.apiKey,
        clientInitialized: !!this.client
      },
      trainedChatbot: {
        available: trainedStatus.available,
        serverUrl: trainedStatus.serverUrl,
        provider: trainedStatus.provider
      }
    };
  }

  /**
   * Test Azure OpenAI connection
   */
  async testConnection() {
    try {
      // Ensure client is initialized
      if (!this.client && !this.apiKey) {
        await this.initializeClient();
      }

      if (!this.client || !this.apiKey) {
        return { 
          success: false, 
          error: 'Azure OpenAI not configured. Please add your API key to the secure configuration.'
        };
      }

      console.log('Testing connection with URL:', `${this.endpoint}openai/deployments/${this.deploymentName}`);
      
      const response = await this.client.chat.completions.create({
        model: this.deploymentName, // This should match your deployment name in Azure
        messages: [
          { role: 'user', content: 'Hello, this is a connection test. Please respond with "Connection successful".' }
        ],
        max_tokens: 50
      });

      return { 
        success: true, 
        message: 'Azure OpenAI connection successful',
        model: this.deploymentName,
        response: response.choices[0]?.message?.content || 'No response content'
      };
    } catch (error) {
      console.error('Connection test error details:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('404')) {
        errorMessage = `Deployment '${this.deploymentName}' not found. Please check your deployment name in Azure Portal under 'Model deployments'.`;
      } else if (error.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your Azure OpenAI API key.';
      } else if (error.message.includes('403')) {
        errorMessage = 'Access denied. Please check your API key permissions.';
      }
      
      return { 
        success: false, 
        error: errorMessage,
        fullError: error.message
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIResourceGenerator();
export default aiService;