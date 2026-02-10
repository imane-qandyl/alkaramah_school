import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { imageGenerationService } from '../services/imageGenerationService';

interface ImageGenerationSetupProps {
  onSetupComplete?: (success: boolean) => void;
}

export default function ImageGenerationSetup({ onSetupComplete }: ImageGenerationSetupProps) {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    checkCurrentStatus();
  }, []);

  const checkCurrentStatus = async () => {
    try {
      const currentStatus = await imageGenerationService.getStatus();
      setStatus(currentStatus);
      setIsConfigured(currentStatus.available);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const configureService = async () => {
    setIsConfiguring(true);
    
    try {
      // Configure with your Z AI SDK credentials
      const success = await imageGenerationService.setConfiguration(
        'https://preview-chat-7ec86612-af1b-4382-aa85-6a00429c666b.space.z.ai/api/sdk',
        'zk_live_f55857a335d242a27fc16a43c3db505e2c8b40c246b93b5fbef62238443e5eab'
      );
      
      if (success) {
        // Test the connection
        const testResult = await imageGenerationService.testConnection();
        
        if (testResult.success) {
          setIsConfigured(true);
          Alert.alert(
            'Success! 🎉',
            'Image generation service is now configured and ready to use.',
            [{ text: 'OK' }]
          );
          onSetupComplete?.(true);
        } else {
          Alert.alert(
            'Configuration Saved',
            `Configuration was saved but connection test failed: ${testResult.error}`,
            [{ text: 'OK' }]
          );
          onSetupComplete?.(false);
        }
      } else {
        Alert.alert(
          'Setup Failed',
          'Failed to save the image generation configuration.',
          [{ text: 'OK' }]
        );
        onSetupComplete?.(false);
      }
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert(
        'Setup Error',
        `An error occurred during setup: ${error.message}`,
        [{ text: 'OK' }]
      );
      onSetupComplete?.(false);
    } finally {
      setIsConfiguring(false);
      await checkCurrentStatus();
    }
  };

  const testConnection = async () => {
    setIsConfiguring(true);
    
    try {
      const result = await imageGenerationService.testConnection();
      
      if (result.success) {
        Alert.alert(
          'Connection Test Successful! ✅',
          'The image generation service is working correctly.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Connection Test Failed ❌',
          `Error: ${result.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Test Error',
        `Failed to test connection: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎨 Image Generation Setup</Text>
        <Text style={styles.subtitle}>
          Configure the Z AI SDK for generating autism-friendly educational images
        </Text>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.statusTitle}>Current Status:</Text>
        {status ? (
          <View style={styles.statusItem}>
            <Text style={[styles.statusText, { color: status.available ? '#28a745' : '#dc3545' }]}>
              {status.available ? '✅ Configured and Ready' : '❌ Not Configured'}
            </Text>
            <Text style={styles.statusDetail}>Base URL: {status.baseUrl}</Text>
            <Text style={styles.statusDetail}>API Key: {status.apiKey}</Text>
            <Text style={styles.statusDetail}>Provider: {status.provider}</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>Loading status...</Text>
        )}
      </View>

      <View style={styles.buttonSection}>
        {!isConfigured ? (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={configureService}
            disabled={isConfiguring}
          >
            {isConfiguring ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Configure Image Generation</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testConnection}
            disabled={isConfiguring}
          >
            {isConfiguring ? (
              <ActivityIndicator color="#007bff" />
            ) : (
              <Text style={styles.testButtonText}>Test Connection</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={checkCurrentStatus}
          disabled={isConfiguring}
        >
          <Text style={styles.refreshButtonText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>What this enables:</Text>
        <Text style={styles.infoText}>• Generate custom educational images</Text>
        <Text style={styles.infoText}>• Create autism-friendly visual schedules</Text>
        <Text style={styles.infoText}>• Enhance learning materials with illustrations</Text>
        <Text style={styles.infoText}>• Support visual learning preferences</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 22,
  },
  statusSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  statusItem: {
    gap: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusDetail: {
    fontSize: 14,
    color: '#6c757d',
  },
  buttonSection: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  testButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  refreshButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
});