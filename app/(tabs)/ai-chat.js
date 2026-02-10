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
  Dimensions
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { aiService } from '@/services/aiService';
import { exportService } from '@/services/exportService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { conversationHistoryService } from '@/services/conversationHistoryService';

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
      return "Hello! I'm your AI teaching assistant powered by your trained model. I can help you with:\n\n• Creating lesson plans\n• Autism-friendly teaching strategies\n• AET target suggestions\n• Classroom management tips\n• Resource ideas\n\nWhat would you like to discuss?";
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
      try {
        if (currentStudent) {
          // Save with student context
          await conversationHistoryService.saveConversation(currentStudent.id, {
            userMessage: currentInput,
            aiResponse: aiResponse,
            studentContext: currentStudent,
            metadata: {
              provider: 'Trained Chatbot Model',
              timestamp: new Date().toISOString(),
              studentName: currentStudent.name,
              studentAge: currentStudent.age
            }
          });
          console.log(`💾 Saved conversation for student: ${currentStudent.name} (ID: ${currentStudent.id})`);
        } else {
          // Save general conversation with a default ID
          const generalId = 'general_conversations';
          await conversationHistoryService.saveConversation(generalId, {
            userMessage: currentInput,
            aiResponse: aiResponse,
            studentContext: null,
            metadata: {
              provider: 'Trained Chatbot Model',
              timestamp: new Date().toISOString(),
              studentName: 'General Chat',
              studentAge: null
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
            userMessage: currentInput,
            aiResponse: aiResponse,
            studentContext: currentStudent,
            metadata: {
              provider: 'Backup Save',
              timestamp: new Date().toISOString()
            }
          });
          console.log('✅ Backup save successful');
        } catch (backupError) {
          console.error('❌ Backup save also failed:', backupError);
        }
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
        return `${randomResponse}\n\nI can see you're working with ${currentStudent.name} (Age: ${currentStudent.age}). I have access to their profile and can create personalized resources for them. What would you like to focus on?`;
      }
      
      return randomResponse;
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
        return "I'm here to help with autism education and teaching strategies. Could you tell me more about what you're looking for? For example:\n\n• Lesson planning help\n• Behavior management strategies\n• AET target suggestions\n• Classroom adaptations";
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
              'Powered by Your Trained Model'
            }
          </ThemedText>
        </View>
        
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color="#666" />
        </TouchableOpacity>
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
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#2C3E50" />
              <Text style={styles.loadingText}>AI is thinking...</Text>
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
              "Ask me about autism education, lesson plans, strategies..." : 
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
});