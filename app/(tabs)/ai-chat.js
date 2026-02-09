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
  ActivityIndicator
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { aiService } from '@/services/aiService';
import { useRouter } from 'expo-router';

export default function AIChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI teaching assistant powered by your trained model. I can help you with:\n\n• Creating lesson plans\n• Autism-friendly teaching strategies\n• AET target suggestions\n• Classroom management tips\n• Resource ideas\n\nWhat would you like to discuss?",
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
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
    // Create a chat-style prompt for the AI service
    const chatParams = {
      studentAge: 8, // Default values for chat context
      abilityLevel: 'developing',
      aetTarget: `Teacher question: ${userInput}`,
      learningContext: 'General teaching consultation',
      format: 'conversation',
      visualSupport: false,
      textLevel: 'professional'
    };

    try {
      const result = await aiService.generateResource(chatParams);
      
      if (result.success) {
        // Extract just the content, remove markdown formatting for chat
        let response = result.content;
        
        // Clean up the response for chat format
        response = response
          .replace(/^# .*$/gm, '') // Remove main headers
          .replace(/^## (.*$)/gm, '$1:') // Convert subheaders to labels
          .replace(/^\*\*(.*?)\*\*/gm, '$1:') // Convert bold to labels
          .replace(/^- /gm, '• ') // Convert dashes to bullets
          .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
          .trim();

        // If response is too long, provide a summary
        if (response.length > 800) {
          const lines = response.split('\n');
          const summary = lines.slice(0, 10).join('\n');
          response = summary + '\n\n💡 This is a summary. Would you like me to elaborate on any specific point?';
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

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.push('./')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>🤖 AI Teaching Assistant</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Powered by Your Trained Model</ThemedText>
        </View>
        
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color="#666" />
        </TouchableOpacity>
      </ThemedView>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
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
                  <Ionicons name="chatbubble-ellipses" size={16} color="#4CAF50" />
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
              <Text
                style={[
                  styles.messageTime,
                  message.isAI ? styles.aiMessageTime : styles.userMessageTime
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>AI is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me about autism education, lesson plans, strategies..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
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
    paddingBottom: 20,
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
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  userMessageBubble: {
    backgroundColor: '#4CAF50',
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
    color: '#333',
    marginTop: 8,
  },
  userMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
  },
  aiMessageTime: {
    color: '#999',
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
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});