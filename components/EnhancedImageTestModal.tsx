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
import { imageGenerationService } from '@/services/imageGenerationService';

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
      testFunction: async () => {
        return await imageGenerationService.generateEnhancedImage({
          action: 'brushing teeth',
          stylePreset: 'autism-friendly',
          qualityLevel: 'child-friendly',
          size: '768x768'
        });
      }
    },
    {
      name: 'Style Variations',
      description: 'Generate multiple style variations of the same action',
      testFunction: async () => {
        return await imageGenerationService.generateStyleVariations('washing hands');
      }
    },
    {
      name: 'Visual Schedule Style',
      description: 'Generate image with visual schedule styling',
      testFunction: async () => {
        return await imageGenerationService.generateEnhancedImage({
          action: 'eating lunch',
          stylePreset: 'visual-schedule',
          qualityLevel: 'high-detail',
          size: '768x768'
        });
      }
    },
    {
      name: 'Enhanced Steps',
      description: 'Generate step-by-step instructions with images',
      testFunction: async () => {
        return await imageGenerationService.generateActivitySteps('making a sandwich', 4, {
          stylePreset: 'visual-schedule',
          qualityLevel: 'child-friendly',
          generateImages: true
        });
      }
    },
    {
      name: 'Service Status Check',
      description: 'Check if the image generation service is properly configured',
      testFunction: async () => {
        const isAvailable = await imageGenerationService.isAvailable();
        const status = await imageGenerationService.getStatus();
        return {
          success: isAvailable,
          available: isAvailable,
          status: status,
          message: isAvailable ? 'Service is properly configured' : 'Service needs configuration'
        };
      }
    }
  ];

  const runTest = async (testCase: any) => {
    setIsLoading(true);
    
    try {
      console.log(`🧪 Running test: ${testCase.name}`);

      const result = await testCase.testFunction();
      console.log(`✅ Test result for ${testCase.name}:`, result);

      const testResult = {
        name: testCase.name,
        success: result.success || result.available || false,
        result: result,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [...prev, testResult]);

      if (testResult.success) {
        let successMessage = `${testCase.name} completed successfully.\n\n`;
        
        if (result.variations) {
          successMessage += `Generated ${result.variations.length} variations`;
        } else if (result.image) {
          successMessage += 'Generated single image';
        } else if (result.steps) {
          successMessage += `Generated ${result.steps.length} steps`;
        } else if (result.status) {
          successMessage += `Service status: ${result.message}`;
        } else {
          successMessage += 'Test completed';
        }

        Alert.alert('Test Successful! ✅', successMessage);
      } else {
        Alert.alert(
          'Test Failed ❌',
          `${testCase.name} failed.\n\nError: ${result.error || 'Unknown error'}\n\nDetails: ${result.details || result.suggestion || 'No additional details'}`
        );
      }
    } catch (error: any) {
      console.error(`❌ Test error for ${testCase.name}:`, error);
      
      const testResult = {
        name: testCase.name,
        success: false,
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [...prev, testResult]);

      Alert.alert(
        'Test Error ❌',
        `${testCase.name} encountered an error.\n\nError: ${error?.message || 'Unknown error'}\n\nThis might indicate a configuration issue with the image generation service.`
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
            Test the enhanced image generation features using your existing service. These tests work directly with your imageGenerationService.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Tests</Text>
            {testCases.map((testCase, index) => (
              <View key={index} style={styles.testCase}>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{testCase.name}</Text>
                  <Text style={styles.testDescription}>{testCase.description}</Text>
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
                      {result.result.status && (
                        <Text style={styles.resultDetail}>✓ {result.result.message}</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.resultErrorText}>
                      Error: {result.error || result.result?.error || 'Unknown error'}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chat Commands to Try</Text>
            <Text style={styles.usageText}>
              Try these commands in the chat (they now work with your enhanced service):
            </Text>
            <View style={styles.examplesList}>
              <Text style={styles.example}>• "Generate enhanced image of brushing teeth"</Text>
              <Text style={styles.example}>• "Create style variations for washing hands"</Text>
              <Text style={styles.example}>• "Generate image of how to pray by steps"</Text>
              <Text style={styles.example}>• "Make a visual schedule image of eating lunch"</Text>
              <Text style={styles.example}>• "Generate a sensory-friendly image of quiet time"</Text>
              <Text style={styles.example}>• "Show me how to brush teeth by steps"</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuration Check</Text>
            <Text style={styles.configText}>
              If tests fail, check your image generation configuration:
            </Text>
            <View style={styles.configList}>
              <Text style={styles.configItem}>• config/imageGeneration.json should have baseUrl and apiKey</Text>
              <Text style={styles.configItem}>• Z AI SDK credentials should be properly set</Text>
              <Text style={styles.configItem}>• Run the "Service Status Check" test above</Text>
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
  configText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  configList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  configItem: {
    fontSize: 13,
    color: '#2c3e50',
    marginBottom: 6,
  },
  resultErrorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
});