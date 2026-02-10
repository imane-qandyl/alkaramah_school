import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

interface DebugResult {
  step: string;
  success: boolean;
  details: string;
  timestamp: string;
}

export default function ImageDownloadDebugger() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);

  const addResult = (step: string, success: boolean, details: string) => {
    const result: DebugResult = {
      step,
      success,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [...prev, result]);
    console.log(`${success ? '✅' : '❌'} ${step}: ${details}`);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Check FileSystem access
      addResult('FileSystem Access', true, `Document directory: ${FileSystem.documentDirectory}`);

      // Test 2: Check MediaLibrary permissions
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        addResult('MediaLibrary Permission', status === 'granted', `Status: ${status}`);
        
        if (status !== 'granted') {
          addResult('Permission Issue', false, 'MediaLibrary permission not granted - this is likely the main issue');
          setIsRunning(false);
          return;
        }
      } catch (error) {
        addResult('MediaLibrary Permission', false, `Error: ${error.message}`);
        setIsRunning(false);
        return;
      }

      // Test 3: Create a simple test image (1x1 pixel PNG)
      const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';
      const testDataUrl = `data:image/png;base64,${testBase64}`;
      
      addResult('Test Image Creation', true, `Data URL length: ${testDataUrl.length}`);

      // Test 4: Try writing the test image using new filesystem API
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `debug-test-${timestamp}.png`;
        const filePath = FileSystem.documentDirectory + filename;

        addResult('File Path', true, `Path: ${filePath}`);

        // Extract base64 data from data URL
        const base64Data = testDataUrl.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid base64 data');
        }

        // Write file using new filesystem API
        await FileSystem.writeAsStringAsync(filePath, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        addResult('FileSystem Write', true, `File written successfully to: ${filePath}`);
        
        // Test 5: Verify file exists
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        addResult('File Verification', fileInfo.exists, `Exists: ${fileInfo.exists}, Size: ${fileInfo.size || 'unknown'}`);
        
        if (fileInfo.exists) {
          // Test 6: Save to MediaLibrary
          try {
            const asset = await MediaLibrary.createAssetAsync(filePath);
            addResult('MediaLibrary Save', true, `Asset ID: ${asset.id}`);
            
            // Test 7: Clean up test file
            try {
              await FileSystem.deleteAsync(filePath);
              addResult('Cleanup', true, 'Test file deleted successfully');
            } catch (cleanupError) {
              addResult('Cleanup', false, `Cleanup failed: ${cleanupError.message}`);
            }
            
            Alert.alert(
              'Diagnostics Complete',
              'All tests passed! Image download should work correctly.',
              [{ text: 'OK' }]
            );
          } catch (mediaError) {
            addResult('MediaLibrary Save', false, `Error: ${mediaError.message}`);
          }
        }
      } catch (writeError) {
        addResult('FileSystem Write', false, `Error: ${writeError.message}`);
      }

    } catch (error) {
      addResult('Unexpected Error', false, `Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testWithActualImage = async () => {
    setIsRunning(true);
    
    try {
      // Simulate the actual image download process with a real base64 image
      const sampleImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';
      const imageUri = `data:image/png;base64,${sampleImageBase64}`;
      const metadata = {
        action: 'test-download',
        stylePreset: 'autism-friendly',
        generatedAt: new Date().toISOString()
      };

      // Use the same logic as the actual download function with new filesystem API
      if (!imageUri.startsWith('data:image/')) {
        throw new Error('Invalid image URI format');
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission not granted');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const action = metadata?.action || 'autism-friendly-image';
      const cleanAction = action.replace(/[^a-zA-Z0-9]/g, '-');
      const filename = `${cleanAction}-${timestamp}.png`;
      const filePath = FileSystem.documentDirectory + filename;

      // Extract base64 data from data URL
      console.log('🔍 Parsing image URI for base64 data...');
      console.log('   Full URI length:', imageUri.length);
      console.log('   URI starts with:', imageUri.substring(0, 100));
      
      let base64Data;
      
      // Handle different data URL formats
      if (imageUri.includes(',')) {
        // Standard data URL format: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
        const parts = imageUri.split(',');
        console.log('   Split parts:', parts.length);
        console.log('   Header part:', parts[0]);
        base64Data = parts[1];
      } else if (imageUri.startsWith('data:image/')) {
        // Sometimes the data might be directly after the header without comma
        const headerMatch = imageUri.match(/^data:image\/[^;]+;base64(.*)$/);
        if (headerMatch) {
          base64Data = headerMatch[1];
        }
      } else {
        // If it's already just base64 data
        base64Data = imageUri;
      }
      
      console.log('   Extracted base64 length:', base64Data ? base64Data.length : 'null');
      console.log('   Base64 starts with:', base64Data ? base64Data.substring(0, 50) : 'null');
      
      if (!base64Data || base64Data.trim().length === 0) {
        throw new Error('Could not extract base64 data from image URI');
      }
      
      // Clean up the base64 data (remove any whitespace)
      base64Data = base64Data.trim();

      // Write file using new filesystem API
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists) {
        const asset = await MediaLibrary.createAssetAsync(filePath);
        
        Alert.alert(
          'Test Successful',
          `Image saved successfully!\nAsset ID: ${asset.id}`,
          [
            { text: 'OK' },
            {
              text: 'Share Test',
              onPress: () => Sharing.shareAsync(filePath)
            }
          ]
        );
      } else {
        throw new Error('File was not created successfully');
      }

    } catch (error) {
      Alert.alert(
        'Test Failed',
        `Error: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Download Debugger</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={runDiagnostics}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Run Diagnostics</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton, isRunning && styles.buttonDisabled]}
          onPress={testWithActualImage}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Test Download</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <View key={index} style={[styles.resultItem, result.success ? styles.successItem : styles.errorItem]}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultStep}>{result.success ? '✅' : '❌'} {result.step}</Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
            <Text style={styles.resultDetails}>{result.details}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#28a745',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  successItem: {
    borderLeftColor: '#28a745',
  },
  errorItem: {
    borderLeftColor: '#dc3545',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultStep: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
  },
  resultDetails: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});