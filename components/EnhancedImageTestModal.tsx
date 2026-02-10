import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EnhancedImageTestModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EnhancedImageTestModal({ visible, onClose }: EnhancedImageTestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const testCases = [
    {
      name: 'Basic Enhanced Image',
      description: 'Generate a single enhanced image with autism-friendly style',
      request: {
        action: 'brushing teeth',
        stylePreset: 'autism-friendly',
        qualityLevel: 'child-friendly',
        size: '768x768'
      },
      endpoint: '/generate-image'
    },
    {
      name: 'Style Variations',
      description: 'Generate multiple style variations of the same action',
      request: {
        action: 'washing hands',
        generateVariations: true
      },
      endpoint: '/generate-image'
    },
    {
      name: 'Visual Schedule Style',
      description: 'Generate image with visual schedule styling',
      request: {
        action: 'eating lunch',
        stylePreset: 'visual-schedule',
        qualityLevel: 'high-detail',
        size: '768x768'
      },
      endpoint: '/generate-image'
    },
    {
      name: 'Enhanced Steps',
      description: 'Generate step-by-step instructions with images',
      request: {
        activity: 'making a sandwich',
        numSteps: 4,
        generateImages: true,
        stylePreset: 'visual-schedule',
        difficultyLevel: 'simple'
      },
      endpoint: '/generate-steps'
    },
    {
      name: 'Social Story',
      description: 'Generate a social story with contextual images',
      request: {
        scenario: 'going to the library',
        contexts: ['home', 'community'],
        includeEmotions: true,
        generateImages: true,
        targetAge: 'elementary'
      },
      endpoint: '/generate-social-story'
    }
  ];

  const runTest = async (testCase: any) => {
    setIsLoading(true);
    
    try {
      console.log(`🧪 Running test: ${testCase.name}`);
      console.log(`📡 Endpoint: ${testCase.endpoint}`);
      console.log(`📋 Request:`, testCase.request);

      const response = await fetch(testCase.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.request),
      });

      const result = await response.json();
      console.log(`✅ Test result for ${testCase.name}:`, result);

      const testResult = {
        name: testCase.name,
        success: result.success || response.ok,
        result: result,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [...prev, testResult]);

      if (testResult.success) {
        Alert.alert(
          'Test Successful! ✅',
          `${testCase.name} completed successfully.\n\n${result.variations ? `Generated ${result.variations.length} variations` : result.image ? 'Generated single image' : result.steps ? `Generated ${result.steps.length} steps` : result.socialStory ? 'Generated social story' : 'Test completed'}`
        );
      } else {
        Alert.alert(
          'Test Failed ❌',
          `${testCase.name} failed.\n\nError: ${result.error || 'Unknown error'}\n\nDetails: ${result.details || 'No additional details'}`
        );
      }
    } catch (error) {
      console.error(`❌ Test error for ${testCase.name}:`, error);
      
      const testResult = {
        name: testCase.name,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [...prev, testResult]);

      Alert.alert(
        'Test Error ❌',
        `${testCase.name} encountered an error.\n\nError: ${error.message}\n\nMake sure your development server is running.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🧪 Enhanced Image Generation Tests</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.description}>
            Test the enhanced image generation features. Make sure your development server is running first.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Tests</Text>
            {testCases.map((testCase, index) => (
              <View key={index} style={styles.testCase}>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{testCase.name}</Text>
                  <Text style={styles.testDescription}>{testCase.description}</Text>
                  <Text style={styles.testEndpoint}>Endpoint: {testCase.endpoint}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.testButton, isLoading && styles.testButtonDisabled]}
                  onPress={() => runTest(testCase)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.testButtonText}>Test</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {testResults.length > 0 && (
            <View style={styles.section}>
              <View style={styles.resultsHeader}>
                <Text style={styles.sectionTitle}>Test Results</Text>
                <TouchableOpacity onPress={clearResults} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
              
              {testResults.map((result, index) => (
                <View key={index} style={[styles.resultItem, result.success ? styles.resultSuccess : styles.resultError]}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultName}>
                      {result.success ? '✅' : '❌'} {result.name}
                    </Text>
                    <Text style={styles.resultTime}>
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  
                  {result.success ? (
                    <View style={styles.resultDetails}>
                      {result.result.image && (
                        <Text style={styles.resultDetail}>✓ Single image generated</Text>
                      )}
                      {result.result.variations && (
                        <Text style={styles.resultDetail}>✓ {result.result.variations.length} variations generated</Text>
                      )}
                      {result.result.steps && (
                        <Text style={styles.resultDetail}>✓ {result.result.steps.length} steps generated</Text>
                      )}
                      {result.result.socialStory && (
                        <Text style={styles.resultDetail}>✓ Social story generated</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.resultError}>
                      Error: {result.error || result.result?.error || 'Unknown error'}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usage Examples</Text>
            <Text style={styles.usageText}>
              Try these commands in the chat:
            </Text>
            <View style={styles.examplesList}>
              <Text style={styles.example}>• "Generate enhanced image of brushing teeth"</Text>
              <Text style={styles.example}>• "Create style variations for washing hands"</Text>
              <Text style={styles.example}>• "Make a visual schedule image of eating lunch"</Text>
              <Text style={styles.example}>• "Generate a sensory-friendly image of quiet time"</Text>
              <Text style={styles.example}>• "Create a social story image for going to school"</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  testCase: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  testEndpoint: {
    fontSize: 12,
    color: '#007bff',
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  resultSuccess: {
    borderLeftColor: '#28a745',
  },
  resultError: {
    borderLeftColor: '#dc3545',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  resultTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  resultDetails: {
    marginTop: 4,
  },
  resultDetail: {
    fontSize: 12,
    color: '#28a745',
    marginBottom: 2,
  },
  usageText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  examplesList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  example: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});