import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  Image
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { aiService } from '@/services/aiService';
import { exportService } from '@/services/exportService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { conversationHistoryService } from '@/services/conversationHistoryService';
import { imageGenerationService } from '@/services/imageGenerationService';
import EnhancedImageTestModal from '@/components/EnhancedImageTestModal';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export default function AIChatScreen() {
  const router = useRouter();
  const { studentContext, fromStudentProfile } = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  
  // Parse student context if provided
  const [currentStudent, setCurrentStudent] = useState(null);
  
  useEffect(() => {
    if (studentContext && typeof studentContext === 'string') {
      try {
        const parsedContext = JSON.parse(studentContext);
        setCurrentStudent(parsedContext);
      } catch (error) {
        console.error('Error parsing student context:', error);
      }
    }
  }, [studentContext]);
  
  // Initialize messages with student-specific greeting if context provided
  const getInitialMessage = () => {
    if (currentStudent) {
      return `Hello! I'm your AI teaching assistant, and I can see you're working with ${currentStudent.name || 'a student'} (Age: ${currentStudent.age || 'Unknown'}).

I have access to their profile including:
• Support levels: ${Object.entries(currentStudent.supportLevels || {}).map(([domain, level]) => `${domain}: ${level}`).join(', ')}
• Learning preferences: ${currentStudent.learningProfile?.learningModalities?.join(', ') || 'Mixed'}
• Communication style: ${currentStudent.communicationProfile?.verbalSkills || 'Medium'}

I can help you create personalized resources for this student. What would you like to work on?

Some suggestions:
• "Create a lesson plan for this student"
• "What teaching strategies work best for their profile?"
• "Generate activities for their learning style"
• "Help with behavior management strategies"`;
    } else {
      return "Welcome! I'm your trained autism education prediction model. I specialize in:\n\n• **Student Condition Prediction** - Classify learning status based on assessment data\n• **Support Level Recommendations** - Evidence-based guidance for intervention intensity\n• **Progress Classification** - Determine if students need immediate, continued, or advanced support\n• **Confidence Scoring** - Reliable predictions with accuracy percentages\n• **Educational Decision Support** - Data-driven insights for autism-friendly teaching\n\nProvide assessment results (3 tasks + observations) and I'll predict your student's current condition and recommended support approach.\n\nWhat assessment data would you like me to analyze?";
    }
  };
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: getInitialMessage(),
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [allowInputFocus, setAllowInputFocus] = useState(false);
  const [exportingMessageId, setExportingMessageId] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Only scroll if user is actively typing (not on initial load)
        if (inputText.length > 0) {
          setTimeout(() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }, 100);
        }
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [inputText]); // Add inputText as dependency

  // Update initial message when student context changes
  useEffect(() => {
    if (currentStudent) {
      setMessages([
        {
          id: 1,
          text: getInitialMessage(),
          isAI: true,
          timestamp: new Date()
        }
      ]);
    }
  }, [currentStudent]);

  // Delay input focus to prevent auto-keyboard on screen load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAllowInputFocus(true);
    }, 1000); // Wait 1 second before allowing input focus

    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isAI: false,
      timestamp: new Date()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Dismiss keyboard
    Keyboard.dismiss();

    // Scroll to bottom after adding message
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);

    try {
      // Check if user is requesting image generation
      const isImageRequest = detectImageRequest(currentInput);
      console.log(`🔍 Input: "${currentInput}"`);
      console.log(`🔍 Is Image Request: ${isImageRequest}`);
      
      if (isImageRequest) {
        console.log('🎨 Handling image generation...');
        await handleImageGeneration(currentInput);
      } else {
        console.log('💬 Handling regular AI response...');
        // Generate AI response using the same service as resource creation
        const aiResponse = await generateAIResponse(currentInput);
        
        const aiMessage = {
          id: Date.now() + 1,
          text: aiResponse,
          isAI: true,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Save conversation to history
        await saveConversationHistory(currentInput, aiResponse);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble responding right now. Please try again or check your AI service connection in the Profile tab.",
        isAI: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput) => {
    // Check if this is a simple greeting first
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|halo|hai)\s*[!.?]*$/i.test(userInput.trim());
    
    if (isGreeting) {
      // Return a direct greeting response without going through the AI service
      const greetingResponses = [
        "Hello! How can I assist you today?",
        "Hi there! I'm here to help you create educational resources for students with autism. What would you like to work on?",
        "Good day! I'm TeachSmart, your AI assistant for autism-friendly educational content. How can I help you today?",
        "Hello! I'm ready to help you create personalized learning activities. What's your teaching goal today?",
        "Hi! I'm here to support you with autism-friendly educational resources. What can I help you with?"
      ];
      
      const randomResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      
      if (currentStudent) {
        return `${randomResponse}\n\nI can see you're working with ${currentStudent.name} (Age: ${currentStudent.age}). I have access to their profile and can create personalized resources for them. What would you like to focus on?\n\n💡 You can also ask me to generate images by saying things like "create an image of brushing teeth" or "generate a picture for morning routine"`;
      }
      
      return randomResponse + "\n\n💡 You can also ask me to generate images by saying things like \"create an image of brushing teeth\" or \"generate a picture for morning routine\"";
    }
    
    // Create a chat-style prompt for the AI service with student context
    const chatParams = {
      studentAge: currentStudent?.age || 8,
      abilityLevel: currentStudent?.supportLevels?.learning || 'developing',
      aetTarget: currentStudent ? 
        `For student ${currentStudent.name} (${currentStudent.age} years old): ${userInput}` : 
        userInput, // Don't prefix with "Teacher question:" to let the trained model handle it naturally
      learningContext: currentStudent ? 
        `Student profile: ${JSON.stringify({
          supportLevels: currentStudent.supportLevels,
          learningProfile: currentStudent.learningProfile,
          communicationProfile: currentStudent.communicationProfile,
          socialProfile: currentStudent.socialProfile
        })}` : 
        'General teaching consultation',
      format: 'conversation',
      visualSupport: currentStudent?.learningProfile?.learningModalities?.includes('Visual') || false,
      textLevel: 'professional',
      // Add student-specific context
      studentContext: currentStudent
    };

    try {
      const result = await aiService.generateResource(chatParams);
      
      if (result.success) {
        // Extract just the content, remove markdown formatting for chat
        let response = result.content;
        
        // Clean up the response for chat format but keep it comprehensive
        response = response
          .replace(/^# .*$/gm, '') // Remove main headers
          .replace(/^## (.*$)/gm, '**$1**') // Convert subheaders to bold
          .replace(/^\*\*(.*?)\*\*/gm, '**$1**') // Keep bold formatting
          .replace(/^- /gm, '• ') // Convert dashes to bullets
          .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
          .trim();

        // For student-specific responses, keep the full content
        if (currentStudent) {
          return response || "I understand your question about " + currentStudent.name + ". Could you provide more specific details?";
        }

        // Only truncate for general responses if extremely long (over 2000 chars)
        if (response.length > 2000) {
          const lines = response.split('\n');
          const summary = lines.slice(0, 15).join('\n');
          response = summary + '\n\n💡 This is a detailed response. Would you like me to focus on any specific aspect?';
        }

        return response || "I understand your question. Could you provide more specific details so I can give you a more targeted response?";
      } else {
        throw new Error('AI service returned unsuccessful result');
      }
    } catch (error) {
      console.error('AI response generation error:', error);
      
      // Provide helpful fallback responses based on keywords
      const input = userInput.toLowerCase();
      
      if (input.includes('autism') || input.includes('aet')) {
        return "For autism-specific teaching strategies, I recommend focusing on:\n\n• Clear, predictable routines\n• Visual supports and schedules\n• Sensory considerations\n• Breaking tasks into smaller steps\n• Positive reinforcement\n\nWhat specific area would you like to explore?";
      } else if (input.includes('behavior') || input.includes('management')) {
        return "For classroom behavior support:\n\n• Establish clear expectations\n• Use visual cues and reminders\n• Provide choices when possible\n• Implement consistent routines\n• Focus on positive reinforcement\n\nWhat specific behavior challenges are you facing?";
      } else if (input.includes('lesson') || input.includes('plan')) {
        return "For effective lesson planning:\n\n• Start with clear learning objectives\n• Include multiple learning styles\n• Plan for different ability levels\n• Build in movement breaks\n• Prepare visual supports\n\nWhat subject or topic are you planning for?";
      } else {
        return "I'm here to help with autism education and teaching strategies. Could you tell me more about what you're looking for? For example:\n\n• Lesson planning help\n• Behavior management strategies\n• AET target suggestions\n• Classroom adaptations\n• Image generation for visual supports";
      }
    }
  };

  // Detect if user is requesting image generation
  const detectImageRequest = (input) => {
    const lowerInput = input.toLowerCase();
    
    // First check if this looks like assessment data - if so, don't generate images
    const assessmentPatterns = [
      /task\s*\d+\s*:/i,
      /benar|salah|bantu/i,
      /notes?\s*:/i,
      /observation/i
    ];
    
    if (assessmentPatterns.some(pattern => pattern.test(input))) {
      return false;
    }
    
    // Only trigger on explicit image generation requests
    const explicitImageKeywords = [
      'generate image', 'create image', 'make image', 'draw image',
      'generate picture', 'create picture', 'make picture', 'draw picture',
      'show me image', 'show me picture', 'generate visual', 'create visual',
      'image of', 'picture of', 'visual of',
      // Enhanced features - but only when explicitly requested
      'generate style variations', 'create different styles', 'make multiple styles',
      'generate social story image', 'create visual schedule', 'make sensory friendly image',
      'generate enhanced image', 'create autism friendly image', 'make educational image',
      // Steps - but only when explicitly requested for image generation
      'generate steps image', 'create step by step image', 'make instructions image',
      'show me how to', 'visual instructions for'
    ];
    
    return explicitImageKeywords.some(keyword => lowerInput.includes(keyword));
  };

  // Handle image generation requests
  const handleImageGeneration = async (userInput) => {
    setIsGeneratingImage(true);
    
    try {
      // Extract action from user input
      const action = extractActionFromInput(userInput);
      console.log(`🎨 Extracted action: "${action}"`);
      
      if (!action) {
        const clarificationMessage = {
          id: Date.now() + 1,
          text: "I'd be happy to generate an enhanced image for you! Could you please specify what action or activity you'd like me to illustrate? For example:\n\n• 'Generate an image of brushing teeth'\n• 'Create a picture of washing hands'\n• 'Show me a visual for morning routine'\n• 'Make an image of a child reading'\n• 'Create style variations for eating lunch'\n• 'Generate a social story image for going to school'",
          isAI: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, clarificationMessage]);
        return;
      }

      // Detect if user wants enhanced features
      const wantsVariations = userInput.toLowerCase().includes('variation') || userInput.toLowerCase().includes('different style');
      const wantsSocialStory = userInput.toLowerCase().includes('social story') || userInput.toLowerCase().includes('social situation');
      const wantsSteps = userInput.toLowerCase().includes('by steps') || userInput.toLowerCase().includes('step by step') || userInput.toLowerCase().includes('how to');
      const stylePreset = detectStylePreset(userInput);
      const qualityLevel = detectQualityLevel(userInput);

      // Show generating message with enhanced features info
      const generatingMessage = {
        id: Date.now() + 1,
        text: `🎨 Generating enhanced autism-friendly ${wantsSteps ? 'step-by-step images' : 'image'} for "${action}"...\n\n${wantsVariations ? '🔄 Creating multiple style variations...' : ''}${wantsSocialStory ? '📚 Using social story style...' : ''}${wantsSteps ? '📋 Creating step-by-step visual guide...' : ''}${stylePreset !== 'autism-friendly' ? `🎯 Style: ${stylePreset}` : ''}${qualityLevel !== 'child-friendly' ? `✨ Quality: ${qualityLevel}` : ''}\n\nThis may take a moment. I'm creating clear, educational illustrations with soft colors and minimal distractions.`,
        isAI: true,
        timestamp: new Date(),
        isGenerating: true
      };
      setMessages(prev => [...prev, generatingMessage]);

      console.log(`🎨 Starting enhanced image generation for: "${action}"`);

      let result;

      if (wantsSteps) {
        // Generate step-by-step images
        result = await generateActivitySteps(action, 5, stylePreset);
      } else if (wantsVariations) {
        // Use the enhanced generate-image endpoint for variations
        result = await generateEnhancedImageVariations(action, stylePreset);
      } else {
        // Use the enhanced generate-image endpoint for single image
        result = await generateEnhancedSingleImage(action, stylePreset, qualityLevel);
      }

      console.log(`🎨 Enhanced image generation result:`, result);

      // Remove the generating message
      setMessages(prev => prev.filter(msg => !msg.isGenerating));

      if (result.success) {
        if (result.steps) {
          // Handle step-by-step results
          const stepsMessage = {
            id: Date.now() + 2,
            text: `Here are your enhanced step-by-step images for "${action}":\n\n📋 Generated ${result.steps.length} steps with autism-friendly design principles.`,
            isAI: true,
            timestamp: new Date(),
            steps: result.steps,
            imageMetadata: { type: 'steps', action: action }
          };
          setMessages(prev => [...prev, stepsMessage]);
        } else if (result.variations) {
          // Handle multiple variations
          const variationsMessage = {
            id: Date.now() + 2,
            text: `Here are your enhanced style variations for "${action}":\n\n✨ Generated ${result.variations.length} different styles with autism-friendly design principles.`,
            isAI: true,
            timestamp: new Date(),
            variations: result.variations,
            imageMetadata: { type: 'variations', action: action }
          };
          setMessages(prev => [...prev, variationsMessage]);
        } else if (result.image) {
          // Handle single enhanced image
          const imageMessage = {
            id: Date.now() + 2,
            text: `Here's your enhanced autism-friendly image of "${action}":`,
            isAI: true,
            timestamp: new Date(),
            image: result.image,
            imageMetadata: result.metadata
          };
          setMessages(prev => [...prev, imageMessage]);
        }

        // Save conversation with enhanced image data
        await saveConversationHistory(
          userInput, 
          `Generated enhanced ${result.steps ? 'step-by-step images' : result.variations ? 'style variations' : 'image'}: ${action}`,
          { 
            imageGenerated: true, 
            action: action,
            enhanced: true,
            stylePreset: stylePreset,
            qualityLevel: qualityLevel,
            hasVariations: !!result.variations,
            hasSteps: !!result.steps
          }
        );
      } else {
        console.error(`🎨 Enhanced image generation failed:`, result);
        const errorMessage = {
          id: Date.now() + 2,
          text: `I apologize, but I couldn't generate the enhanced image right now. Error: ${result.error || 'Unknown error'}\n\nDetails: ${result.details || 'No additional details'}\n\nPlease try again or check if the enhanced image generation service is configured properly.`,
          isAI: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('🎨 Enhanced image generation error:', error);
      console.error('🎨 Error stack:', error.stack);
      const errorMessage = {
        id: Date.now() + 2,
        text: `I encountered an error while generating the enhanced image: ${error.message}\n\nPlease make sure the enhanced image generation service is properly configured and try again.`,
        isAI: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Generate enhanced single image
  const generateEnhancedSingleImage = async (action, stylePreset, qualityLevel) => {
    try {
      const result = await imageGenerationService.generateEnhancedImage({
        action: action,
        stylePreset: stylePreset,
        qualityLevel: qualityLevel,
        size: '768x768'
      });
      return result;
    } catch (error) {
      console.error('Enhanced single image generation error:', error);
      return { success: false, error: error.message };
    }
  };

  // Generate enhanced image variations
  const generateEnhancedImageVariations = async (action, baseStyle) => {
    try {
      const result = await imageGenerationService.generateStyleVariations(action);
      return result;
    } catch (error) {
      console.error('Enhanced variations generation error:', error);
      return { success: false, error: error.message };
    }
  };

  // Generate activity steps with images
  const generateActivitySteps = async (activity, numSteps, stylePreset) => {
    try {
      const result = await imageGenerationService.generateActivitySteps(activity, numSteps, {
        stylePreset: stylePreset,
        qualityLevel: 'child-friendly',
        generateImages: true
      });
      return result;
    } catch (error) {
      console.error('Activity steps generation error:', error);
      return { success: false, error: error.message };
    }
  };

  // Detect style preset from user input
  const detectStylePreset = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('visual schedule') || lowerInput.includes('schedule')) {
      return 'visual-schedule';
    } else if (lowerInput.includes('sensory') || lowerInput.includes('calm') || lowerInput.includes('soothing')) {
      return 'sensory-friendly';
    } else if (lowerInput.includes('social story') || lowerInput.includes('social situation')) {
      return 'social-story';
    } else {
      return 'autism-friendly'; // default
    }
  };

  // Detect quality level from user input
  const detectQualityLevel = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('detailed') || lowerInput.includes('high detail')) {
      return 'high-detail';
    } else if (lowerInput.includes('realistic') || lowerInput.includes('real')) {
      return 'realistic';
    } else if (lowerInput.includes('minimal') || lowerInput.includes('simple')) {
      return 'minimalist';
    } else if (lowerInput.includes('inclusive') || lowerInput.includes('diverse')) {
      return 'inclusive';
    } else {
      return 'child-friendly'; // default
    }
  };

  // Extract action from user input
  const extractActionFromInput = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Remove common prefixes
    let action = lowerInput
      .replace(/^(generate|create|make|draw|show me|give me)\s+(an?\s+)?(image|picture|visual|illustration)\s+(of|for|showing)\s+/i, '')
      .replace(/^(generate|create|make|draw|show me|give me)\s+(an?\s+)?(image|picture|visual|illustration)\s+/i, '')
      .replace(/^(image|picture|visual|illustration)\s+(of|for|showing)\s+/i, '')
      .replace(/^(an?\s+)/i, '') // Remove "a" or "an"
      .trim();

    // If no clear action found, try to extract from context
    if (!action || action.length < 3) {
      // Look for common activities
      const activities = [
        'brushing teeth', 'washing hands', 'eating', 'drinking', 'reading',
        'writing', 'playing', 'walking', 'running', 'sitting', 'standing',
        'morning routine', 'bedtime routine', 'getting dressed', 'taking a bath',
        'homework', 'studying', 'listening', 'talking', 'sharing', 'helping',
        'child brushing teeth', 'child washing hands', 'child eating', 'child reading'
      ];
      
      for (const activity of activities) {
        if (lowerInput.includes(activity)) {
          action = activity;
          break;
        }
      }
    }

    // Clean up the action
    if (action) {
      // Remove extra words that might interfere
      action = action
        .replace(/\s+/g, ' ') // Multiple spaces to single space
        .trim();
    }

    return action || null;
  };

  // Save conversation history
  const saveConversationHistory = async (userInput, aiResponse, extraMetadata = {}) => {
    try {
      if (currentStudent) {
        // Save with student context
        await conversationHistoryService.saveConversation(currentStudent.id, {
          userMessage: userInput,
          aiResponse: aiResponse,
          studentContext: currentStudent,
          metadata: {
            provider: 'Trained Chatbot Model',
            timestamp: new Date().toISOString(),
            studentName: currentStudent.name,
            studentAge: currentStudent.age,
            ...extraMetadata
          }
        });
        console.log(`💾 Saved conversation for student: ${currentStudent.name} (ID: ${currentStudent.id})`);
      } else {
        // Save general conversation with a default ID
        const generalId = 'general_conversations';
        await conversationHistoryService.saveConversation(generalId, {
          userMessage: userInput,
          aiResponse: aiResponse,
          studentContext: null,
          metadata: {
            provider: 'Trained Chatbot Model',
            timestamp: new Date().toISOString(),
            studentName: 'General Chat',
            studentAge: null,
            ...extraMetadata
          }
        });
        console.log('💾 Saved general conversation');
      }
    } catch (error) {
      console.error('❌ Error saving conversation:', error);
      // Try to save to a backup location
      try {
        const backupId = currentStudent?.id || 'backup_conversations';
        console.log(`🔄 Attempting backup save for: ${backupId}`);
        // Simple backup save without complex metadata
        await conversationHistoryService.saveConversation(backupId, {
          userMessage: userInput,
          aiResponse: aiResponse,
          studentContext: currentStudent,
          metadata: {
            provider: 'Backup Save',
            timestamp: new Date().toISOString(),
            ...extraMetadata
          }
        });
        console.log('✅ Backup save successful');
      } catch (backupError) {
        console.error('❌ Backup save also failed:', backupError);
      }
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: 1,
                text: "Chat cleared! How can I help you today?",
                isAI: true,
                timestamp: new Date()
              }
            ]);
          }
        }
      ]
    );
  };



  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Export functions
  const handleExport = async (message, format) => {
    if (!message.isAI || !message.text) {
      Alert.alert('Export Error', 'Only AI-generated content can be exported.');
      return;
    }

    setExportingMessageId(message.id);

    try {
      const metadata = {
        studentName: currentStudent?.name,
        studentAge: currentStudent?.age,
        generatedDate: message.timestamp.toISOString(),
        messageId: message.id
      };

      const result = await exportService.exportResource(message.text, format, metadata);
      
      if (result.success) {
        Alert.alert(
          'Export Successful',
          `Your resource has been exported as ${format.toUpperCase()}!`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Unable to export resource. Please try again.');
    } finally {
      setExportingMessageId(null);
    }
  };

  // Download image function
  const handleDownloadImage = async (imageUri, metadata) => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to save images to your photo library.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const action = metadata?.action || 'autism-friendly-image';
      const filename = `${action.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.png`;

      // Download the image to a temporary location
      const downloadResult = await FileSystem.downloadAsync(
        imageUri,
        FileSystem.documentDirectory + filename
      );

      if (downloadResult.status === 200) {
        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        
        Alert.alert(
          'Image Saved',
          'The image has been saved to your photo library!',
          [
            { text: 'OK' },
            { 
              text: 'Share', 
              onPress: () => Sharing.shareAsync(downloadResult.uri)
            }
          ]
        );
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        'Unable to download the image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const showExportOptions = (message) => {
    Alert.alert(
      'Export Options',
      'Choose how you want to export this resource:',
      [
        {
          text: 'PDF',
          onPress: () => handleExport(message, 'pdf'),
          style: 'default'
        },
        {
          text: 'Word Document',
          onPress: () => handleExport(message, 'docx'),
          style: 'default'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  // Check if message is exportable (AI-generated and substantial content)
  const isExportableMessage = (message) => {
    return message.isAI && 
           message.text.length > 100 && 
           (message.text.includes('Activity') || 
            message.text.includes('Learning') || 
            message.text.includes('Materials') ||
            message.text.includes('Steps') ||
            message.text.length > 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.push('./')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>
            🤖 AI Teaching Assistant
            {currentStudent && ` - ${currentStudent.name}`}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {currentStudent ? 
              `Age ${currentStudent.age} • ${Object.entries(currentStudent.supportLevels || {}).map(([domain, level]) => `${domain}: ${level}`).slice(0, 2).join(', ')}` :
              'Powered by Trained Model'
            }
          </ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowTestModal(true)} style={styles.testButton}>
            <Ionicons name="flask-outline" size={18} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Messages Container with proper keyboard handling */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: keyboardHeight > 0 ? 20 : 80 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isAI ? styles.aiMessageContainer : styles.userMessageContainer
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.isAI ? styles.aiMessageBubble : styles.userMessageBubble
              ]}
            >
              {message.isAI && (
                <View style={styles.aiIcon}>
                  <Ionicons name="chatbubble-ellipses" size={16} color="#2C3E50" />
                </View>
              )}
              <Text
                style={[
                  styles.messageText,
                  message.isAI ? styles.aiMessageText : styles.userMessageText
                ]}
              >
                {message.text}
              </Text>
              
              {/* Display generated image if present */}
              {message.image && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: message.image }}
                    style={styles.generatedImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownloadImage(message.image, message.imageMetadata)}
                  >
                    <Ionicons name="download-outline" size={20} color="#fff" />
                    <Text style={styles.downloadButtonText}>Download</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Display image variations if present */}
              {message.variations && (
                <View style={styles.variationsContainer}>
                  <Text style={styles.variationsTitle}>Style Variations:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variationsScroll}>
                    {message.variations.map((variation, index) => (
                      <View key={index} style={styles.variationItem}>
                        {variation.success && variation.image ? (
                          <>
                            <Image
                              source={{ uri: variation.image }}
                              style={styles.variationImage}
                              resizeMode="contain"
                            />
                            <Text style={styles.variationLabel}>{variation.style}</Text>
                            <TouchableOpacity
                              style={styles.variationDownloadButton}
                              onPress={() => handleDownloadImage(variation.image, { ...variation.metadata, style: variation.style })}
                            >
                              <Ionicons name="download-outline" size={16} color="#007bff" />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <View style={styles.variationError}>
                            <Text style={styles.variationErrorText}>Failed to generate {variation.style}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Display activity steps if present */}
              {message.steps && (
                <View style={styles.stepsContainer}>
                  <Text style={styles.stepsTitle}>Step-by-Step Guide:</Text>
                  {message.steps.map((step, index) => (
                    <View key={step.id} style={styles.stepItem}>
                      <View style={styles.stepHeader}>
                        <Text style={styles.stepNumber}>{step.order}</Text>
                        <Text style={styles.stepLabel}>{step.label}</Text>
                      </View>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                      {step.image && (
                        <View style={styles.stepImageContainer}>
                          <Image
                            source={{ uri: step.image }}
                            style={styles.stepImage}
                            resizeMode="contain"
                          />
                          <TouchableOpacity
                            style={styles.stepDownloadButton}
                            onPress={() => handleDownloadImage(step.image, { ...step.imageMetadata, step: step.label })}
                          >
                            <Ionicons name="download-outline" size={16} color="#007bff" />
                            <Text style={styles.stepDownloadButtonText}>Download</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.messageFooter}>
                <Text
                  style={[
                    styles.messageTime,
                    message.isAI ? styles.aiMessageTime : styles.userMessageTime
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
                
                {/* Export buttons for AI messages */}
                {message.isAI && isExportableMessage(message) && (
                  <View style={styles.exportButtons}>
                    {exportingMessageId === message.id ? (
                      <ActivityIndicator size="small" color="#3498DB" />
                    ) : (
                      <TouchableOpacity
                        style={styles.exportButton}
                        onPress={() => showExportOptions(message)}
                      >
                        <Ionicons name="download-outline" size={16} color="#3498DB" />
                        <Text style={styles.exportButtonText}>Export</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
        
        {(isLoading || isGeneratingImage) && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#2C3E50" />
              <Text style={styles.loadingText}>
                {isGeneratingImage ? "🎨 Generating image..." : "AI is thinking..."}
              </Text>
            </View>
          </View>
        )}
        </ScrollView>

        {/* Input Container */}
        <ThemedView style={[
          styles.inputContainer,
          keyboardHeight > 0 && Platform.OS === 'android' && { marginBottom: keyboardHeight }
        ]}>
          <TextInput
            style={[
              styles.textInput,
              !allowInputFocus && styles.textInputDisabled
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={allowInputFocus ? 
              "Ask me about autism education, lesson plans, strategies, or try: 'generate enhanced image of...', 'create style variations for...', 'make a visual schedule image...'" : 
              "Loading..."
            }
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            autoFocus={false}
            editable={allowInputFocus}
            onSubmitEditing={() => {
              if (!isLoading && inputText.trim()) {
                sendMessage();
              }
            }}
            blurOnSubmit={false}
            returnKeyType="send"
            onFocus={() => {
              // Only scroll if input focus is allowed (prevents auto-scroll on load)
              if (allowInputFocus) {
                setTimeout(() => {
                  if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd({ animated: true });
                  }
                }, 300);
              }
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={(!inputText.trim() || isLoading) ? "#999" : "#fff"} 
            />
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>

      {/* Enhanced Image Test Modal */}
      <EnhancedImageTestModal 
        visible={showTestModal} 
        onClose={() => setShowTestModal(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  chatContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    fontFamily: 'SF Pro Display',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#2C3E50',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testButton: {
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  clearButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    position: 'relative',
  },
  aiMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F4F6F8',
  },
  userMessageBubble: {
    backgroundColor: '#2C3E50',
    borderBottomRightRadius: 4,
  },
  aiIcon: {
    position: 'absolute',
    top: -8,
    left: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiMessageText: {
    color: '#34495E',
    marginTop: 8,
    fontFamily: 'SF Pro Text',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  exportButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3498DB',
    gap: 4,
  },
  exportButtonText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
  },
  aiMessageTime: {
    color: '#8B9DC3',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8B9DC3',
    fontStyle: 'italic',
    fontFamily: 'SF Pro Text',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
    minHeight: 70,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F4F6F8',
    color: '#34495E',
    fontFamily: 'SF Pro Text',
  },
  textInputDisabled: {
    backgroundColor: '#F0F0F0',
    color: '#999',
  },
  sendButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E1E8ED',
  },
  imageContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  generatedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 8,
    borderRadius: 6,
    gap: 6,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imageMetadata: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  imageMetadataText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  variationsContainer: {
    marginTop: 12,
  },
  variationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 8,
  },
  variationsScroll: {
    flexDirection: 'row',
  },
  variationItem: {
    marginRight: 12,
    alignItems: 'center',
    width: 120,
  },
  variationImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  variationLabel: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  variationDownloadButton: {
    marginTop: 4,
    padding: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  variationError: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f8d7da',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  variationErrorText: {
    fontSize: 10,
    color: '#721c24',
    textAlign: 'center',
  },
  stepsContainer: {
    marginTop: 12,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 12,
  },
  stepItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepNumber: {
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    minWidth: 24,
    textAlign: 'center',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  stepDescription: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 18,
  },
  stepImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    backgroundColor: '#e9ecef',
  },
  stepImageContainer: {
    marginTop: 8,
  },
  stepDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007bff',
    gap: 4,
  },
  stepDownloadButtonText: {
    color: '#007bff',
    fontSize: 12,
    fontWeight: '600',
  },
});