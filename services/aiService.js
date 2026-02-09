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
    
    // Debug logging
    console.log('Azure OpenAI Configuration:');
    console.log('- Endpoint:', this.endpoint);
    console.log('- API Version:', this.apiVersion);
    console.log('- Deployment:', this.deploymentName);
    console.log('- API Key will be loaded securely');
    console.log('- Config object:', config);
    
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
        console.log('Base URL:', `${this.endpoint}openai/deployments/${this.deploymentName}`);
        console.log('API Version:', this.apiVersion);
        console.log('API Key loaded:', !!this.apiKey);
      } else {
        console.warn('Azure OpenAI API key not provided, using mock responses');
      }
    } catch (error) {
      console.error('Failed to initialize Azure OpenAI client:', error);
    }
  }

  /**
   * Generate educational resource based on input parameters
   * Tries trained chatbot first, then Azure OpenAI, then mock as fallback
   */
  async generateResource(params) {
    const { studentAge, abilityLevel, aetTarget, learningContext, format, visualSupport, textLevel } = params;

    try {
      // First, try the trained chatbot model
      console.log('Attempting to use trained chatbot model...');
      try {
        const trainedResult = await trainedChatbotService.generateResource(params);
        if (trainedResult.success) {
          console.log('✅ Generated resource using trained chatbot model');
          return trainedResult;
        }
      } catch (trainedError) {
        console.log('Trained chatbot not available, trying Azure OpenAI...', trainedError.message);
      }

      // Ensure Azure OpenAI client is initialized
      if (!this.client && !this.apiKey) {
        await this.initializeClient();
      }

      // Fallback to Azure OpenAI if available
      let response;
      if (this.client && this.apiKey) {
        console.log('Using Azure OpenAI...');
        response = await this.callAzureOpenAI(params);
      } else {
        console.log('Azure OpenAI not configured, using mock response');
        response = await this.mockAPICall(params);
      }
      
      return {
        success: true,
        content: response.content,
        metadata: {
          generatedAt: new Date().toISOString(),
          targetAge: studentAge,
          abilityLevel,
          format,
          aetTarget,
          provider: this.client ? 'Azure OpenAI' : 'Mock'
        }
      };
    } catch (error) {
      console.error('AI Generation Error:', error);
      
      // Final fallback to mock if everything else fails
      try {
        console.log('All AI services failed, falling back to mock response');
        const mockResponse = await this.mockAPICall(params);
        return {
          success: true,
          content: mockResponse.content,
          metadata: {
            generatedAt: new Date().toISOString(),
            targetAge: studentAge,
            abilityLevel,
            format,
            aetTarget,
            provider: 'Mock (Fallback)'
          }
        };
      } catch (mockError) {
        return {
          success: false,
          error: 'Failed to generate resource. Please try again.',
          content: null
        };
      }
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
    const { studentAge, abilityLevel, aetTarget, learningContext, format, visualSupport, textLevel, autismProfile } = params;
    
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
   * Mock API call for demonstration/fallback
   */
  async mockAPICall(params) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate dynamic content based on parameters
    const content = this.generateDynamicContent(params);

    return {
      content: this.customizeContent(content, params)
    };
  }

  /**
   * Generate dynamic content based on parameters
   */
  generateDynamicContent(params) {
    const { aetTarget, format, studentAge, abilityLevel } = params;
    
    // Extract key concepts from AET target
    const isEmotionTarget = aetTarget.toLowerCase().includes('emotion');
    const isSocialTarget = aetTarget.toLowerCase().includes('social') || aetTarget.toLowerCase().includes('turn');
    const isIndependenceTarget = aetTarget.toLowerCase().includes('independence') || aetTarget.toLowerCase().includes('routine');
    
    let title = 'Learning Resource';
    let activities = [];
    
    if (isEmotionTarget) {
      title = 'Emotion Recognition Resource';
      activities = this.getEmotionActivities(format);
    } else if (isSocialTarget) {
      title = 'Social Skills Resource';
      activities = this.getSocialActivities(format);
    } else if (isIndependenceTarget) {
      title = 'Independence Skills Resource';
      activities = this.getIndependenceActivities(format);
    } else {
      title = 'Educational Resource';
      activities = this.getGeneralActivities(format);
    }

    return this.formatContent(title, aetTarget, activities, format);
  }

  getEmotionActivities(format) {
    if (format === 'cards') {
      return [
        'Happy face card with discussion prompts',
        'Sad face card with coping strategies',
        'Angry face card with regulation techniques',
        'Scared face card with comfort strategies'
      ];
    } else {
      return [
        'Identify emotions in pictures',
        'Match emotions to situations',
        'Practice expressing feelings',
        'Create emotion diary'
      ];
    }
  }

  getSocialActivities(format) {
    if (format === 'cards') {
      return [
        'Turn-taking game cards',
        'Sharing scenario cards',
        'Conversation starter cards',
        'Social rule reminder cards'
      ];
    } else {
      return [
        'Practice turn-taking rules',
        'Role-play social situations',
        'Complete sharing activities',
        'Learn conversation skills'
      ];
    }
  }

  getIndependenceActivities(format) {
    if (format === 'cards') {
      return [
        'Morning routine cards',
        'Self-care task cards',
        'Organization reminder cards',
        'Problem-solving step cards'
      ];
    } else {
      return [
        'Follow daily routine checklist',
        'Practice self-care tasks',
        'Organize personal items',
        'Make independent choices'
      ];
    }
  }

  getGeneralActivities(format) {
    if (format === 'cards') {
      return [
        'Learning objective cards',
        'Activity instruction cards',
        'Success criteria cards',
        'Extension activity cards'
      ];
    } else {
      return [
        'Complete learning activities',
        'Practice new skills',
        'Demonstrate understanding',
        'Apply knowledge'
      ];
    }
  }

  formatContent(title, aetTarget, activities, format) {
    const activitiesText = activities.map((activity, index) => 
      format === 'cards' 
        ? `### Card ${index + 1}: ${activity}\n**Instructions:** Use this card to support learning\n**Success:** Student engages with activity\n`
        : `**Activity ${index + 1}:** ${activity}\n`
    ).join('\n');

    return `# ${title}

## Learning Objective
${aetTarget}

## Instructions for Teachers
This resource is designed to support autism-friendly learning. Use clear, simple language and provide visual supports as needed.

## Activities
${activitiesText}

## Success Criteria
- Student demonstrates understanding of the target skill
- Student engages appropriately with activities
- Student shows progress toward learning objective

## Assessment Notes
- Observe student's engagement and understanding
- Note any adaptations needed
- Record progress toward AET targets

## Extension Activities
- Adapt activities for different ability levels
- Create additional practice opportunities
- Connect to real-world applications

## Sensory Considerations
- Provide quiet space if needed
- Allow movement breaks
- Consider lighting and noise levels
- Offer sensory tools if helpful`;
  }

  /**
   * Customize generated content based on parameters
   */
  customizeContent(baseContent, params) {
    let customized = baseContent;
    
    // Adjust for age
    if (params.studentAge) {
      customized = customized.replace(/aged \d+-\d+/g, `aged ${params.studentAge}`);
    }

    // Adjust for ability level
    if (params.abilityLevel === 'emerging') {
      customized = customized.replace(/3 out of 4/g, '2 out of 3');
      customized += '\n\n## Additional Support\n- Use extra visual cues\n- Provide more processing time\n- Offer choices rather than open questions\n- Break tasks into smaller steps';
    } else if (params.abilityLevel === 'extending') {
      customized += '\n\n## Challenge Extension\n- Add more complex scenarios\n- Encourage peer teaching\n- Include problem-solving elements\n- Connect to real-world applications';
    }

    // Add visual support notes if requested
    if (params.visualSupport) {
      customized += '\n\n## Visual Support Notes\n- Include picture symbols and icons\n- Use clear, simple illustrations\n- Consider color coding for different concepts\n- Provide visual schedules and checklists';
    }

    // Add learning context specific notes
    if (params.learningContext === 'onetoone') {
      customized += '\n\n## One-to-One Support Notes\n- Allow for individual pacing\n- Provide immediate feedback\n- Adapt activities to specific interests\n- Focus on building confidence';
    } else if (params.learningContext === 'smallgroup') {
      customized += '\n\n## Small Group Notes\n- Establish clear group rules\n- Assign specific roles\n- Monitor social interactions\n- Provide group and individual goals';
    }

    return customized;
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
   * Get current configuration (for debugging)
   */
  getConfiguration() {
    const trainedStatus = trainedChatbotService.getStatus();
    
    return {
      azureOpenAI: {
        endpoint: this.endpoint,
        apiVersion: this.apiVersion,
        deploymentName: this.deploymentName,
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
          error: 'Azure OpenAI not configured. Please add your API key to the secure configuration.',
          config: this.getConfiguration()
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
        config: this.getConfiguration(),
        fullError: error.message
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIResourceGenerator();
export default aiService;