import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { trainedChatbotService } from '@/services/trainedChatbotService';
import { imageGenerationService } from '@/services/imageGenerationService';

interface AIServiceStatusProps {
  style?: any;
  showDetails?: boolean;
}

export default function AIServiceStatus({ style, showDetails = false }: AIServiceStatusProps) {
  const [status, setStatus] = useState({
    trainedChatbot: false,
    azureOpenAI: false,
    imageGeneration: false,
    currentProvider: 'Mock'
  });

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      // Check trained chatbot
      await trainedChatbotService.checkServerAvailability();
      const trainedStatus = trainedChatbotService.getStatus();
      
      // Check image generation service
      const imageStatus = imageGenerationService.getStatus();
      
      // For now, we'll assume Azure OpenAI is configured if API key exists
      // In a real app, you'd check the actual service
      const azureConfigured = false; // This would check if Azure OpenAI is properly configured
      
      setStatus({
        trainedChatbot: trainedStatus.available,
        azureOpenAI: azureConfigured,
        imageGeneration: imageStatus.available,
        currentProvider: trainedStatus.available ? 'Trained Model' : 
                        azureConfigured ? 'Azure OpenAI' : 'Mock'
      });
    } catch (error) {
      console.log('Error checking AI service status:', error);
    }
  };

  const handleStatusPress = () => {
    if (!showDetails) return;
    
    const statusMessage = `AI Service Status:

🤖 Trained Chatbot: ${status.trainedChatbot ? '✅ Available' : '❌ Not Available'}
☁️ Azure OpenAI: ${status.azureOpenAI ? '✅ Available' : '❌ Not Available'}
🎨 Image Generation: ${status.imageGeneration ? '✅ Available' : '❌ Not Available'}

Current Provider: ${status.currentProvider}

${!status.trainedChatbot ? '\n💡 To use the trained model, start the Python server:\npython python-server/chatbot_server.py' : ''}
${!status.imageGeneration ? '\n🎨 To use image generation, configure SDK_BASE_URL and SDK_API_KEY' : ''}`;

    Alert.alert('AI Service Status', statusMessage);
  };

  const getStatusColor = () => {
    if (status.trainedChatbot) return '#27AE60'; // Muted green - best option
    if (status.azureOpenAI) return '#E67E22'; // Muted orange - good option
    return '#8B9DC3'; // Professional gray - fallback option
  };

  const getStatusIcon = () => {
    if (status.trainedChatbot) return 'checkmark-circle';
    if (status.azureOpenAI) return 'cloud-done';
    return 'help-circle';
  };

  if (!showDetails) {
    // Simple status indicator
    return (
      <View style={[styles.simpleStatus, style]}>
        <Ionicons 
          name={getStatusIcon()} 
          size={16} 
          color={getStatusColor()} 
        />
        <ThemedText style={[styles.simpleStatusText, { color: getStatusColor() }]}>
          {status.currentProvider}
        </ThemedText>
      </View>
    );
  }

  // Detailed status component
  return (
    <TouchableOpacity onPress={handleStatusPress}>
      <ThemedView style={[styles.detailedStatus, style]}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name={getStatusIcon()} 
            size={20} 
            color={getStatusColor()} 
          />
          <ThemedText style={styles.statusTitle}>AI Service</ThemedText>
        </View>
        
        <ThemedText style={[styles.providerText, { color: getStatusColor() }]}>
          Using: {status.currentProvider}
        </ThemedText>
        
        <View style={styles.serviceList}>
          <View style={styles.serviceItem}>
            <Ionicons 
              name={status.trainedChatbot ? 'checkmark-circle' : 'close-circle'} 
              size={14} 
              color={status.trainedChatbot ? '#27AE60' : '#E74C3C'} 
            />
            <ThemedText style={styles.serviceText}>Trained Model</ThemedText>
          </View>
          
          <View style={styles.serviceItem}>
            <Ionicons 
              name={status.azureOpenAI ? 'checkmark-circle' : 'close-circle'} 
              size={14} 
              color={status.azureOpenAI ? '#27AE60' : '#E74C3C'} 
            />
            <ThemedText style={styles.serviceText}>Azure OpenAI</ThemedText>
          </View>

          <View style={styles.serviceItem}>
            <Ionicons 
              name={status.imageGeneration ? 'checkmark-circle' : 'close-circle'} 
              size={14} 
              color={status.imageGeneration ? '#27AE60' : '#E74C3C'} 
            />
            <ThemedText style={styles.serviceText}>Image Generation</ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.tapHint}>Tap for details</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  simpleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  simpleStatusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  detailedStatus: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  providerText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  serviceList: {
    marginBottom: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 12,
    marginLeft: 6,
    color: '#666',
  },
  tapHint: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
});